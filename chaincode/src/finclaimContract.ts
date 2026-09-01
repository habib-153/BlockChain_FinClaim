import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

/**
 * Org MSP -> role mapping for this prototype network (test-network's stock 2-org topology):
 *   Org1MSP = Lender Consortium (banks / NBFIs / fintechs)
 *   Org2MSP = Regulator (Bangladesh Bank)
 * The channel's default endorsement policy requires BOTH orgs to endorse state-changing
 * transactions, so no single side (a lender, or the regulator alone) can unilaterally write
 * or alter claim state -- this is the on-chain enforcement of the whitepaper's governance
 * principle that freezing/disputing a claim needs Bangladesh Bank + consortium sign-off.
 */
const REGULATOR_MSP = 'Org2MSP';
const LENDER_MSP = 'Org1MSP';

type ReceivableStatus = 'PENDING' | 'ACTIVE' | 'FLAGGED' | 'DISPUTED' | 'SETTLED';
type ClaimType = 'PLEDGE' | 'ASSIGNMENT';
type ClaimStatus = 'ACTIVE' | 'REJECTED' | 'SETTLED' | 'RELEASED';

interface Receivable {
    docType: 'receivable';
    id: string;
    sellerId: string;
    buyerId: string;
    faceValue: number;
    invoiceHash: string; // hash of the encrypted off-chain invoice document
    status: ReceivableStatus;
    totalClaimed: number;
    flagReason?: string;
    createdAt: string;
}

interface Claim {
    docType: 'claim';
    receivableId: string;
    lenderId: string;
    amount: number;
    claimType: ClaimType;
    status: ClaimStatus;
    commitment: string; // caller-supplied hash commitment binding the amount for dispute-time reveal
    createdAt: string;
}

interface Lender {
    docType: 'lender';
    lenderId: string;
    name: string;
    lenderType: string;
    active: boolean;
}

interface LinkedEntity {
    docType: 'linkedEntity';
    businessIdA: string;
    businessIdB: string;
    reason: string;
    createdAt: string;
}

interface MerkleAnchor {
    docType: 'merkleAnchor';
    rootHash: string;
    eventCount: number;
    periodLabel: string;
    createdAt: string;
}

@Info({ title: 'FinClaimContract', description: 'Confidential receivable claim registry' })
export class FinClaimContract extends Contract {
    private requireRegulator(ctx: Context): void {
        const mspId = ctx.clientIdentity.getMSPID();
        if (mspId !== REGULATOR_MSP) {
            throw new Error(`Only the Regulator organization (${REGULATOR_MSP} / Bangladesh Bank) may perform this action`);
        }
    }

    private requireLenderOrg(ctx: Context): void {
        const mspId = ctx.clientIdentity.getMSPID();
        if (mspId !== LENDER_MSP) {
            throw new Error(`Only Lender Consortium organization (${LENDER_MSP}) identities may perform this action`);
        }
    }

    private async getReceivable(ctx: Context, receivableId: string): Promise<Receivable> {
        const bytes = await ctx.stub.getState(receivableId);
        if (!bytes || bytes.length === 0) {
            throw new Error(`Receivable ${receivableId} does not exist`);
        }
        return JSON.parse(bytes.toString()) as Receivable;
    }

    private claimKey(ctx: Context, receivableId: string, lenderId: string): string {
        return ctx.stub.createCompositeKey('claim', [receivableId, lenderId]);
    }

    // ---------------------------------------------------------------------
    // Lender onboarding / offboarding (Network Membership Governance)
    // ---------------------------------------------------------------------

    @Transaction()
    async OnboardLender(ctx: Context, lenderId: string, name: string, lenderType: string): Promise<void> {
        this.requireRegulator(ctx);
        const lender: Lender = { docType: 'lender', lenderId, name, lenderType, active: true };
        await ctx.stub.putState(`LENDER_${lenderId}`, Buffer.from(JSON.stringify(lender)));
    }

    @Transaction()
    async OffboardLender(ctx: Context, lenderId: string): Promise<void> {
        this.requireRegulator(ctx);
        const bytes = await ctx.stub.getState(`LENDER_${lenderId}`);
        if (!bytes || bytes.length === 0) {
            throw new Error(`Lender ${lenderId} is not registered`);
        }
        const lender = JSON.parse(bytes.toString()) as Lender;
        lender.active = false;
        await ctx.stub.putState(`LENDER_${lenderId}`, Buffer.from(JSON.stringify(lender)));
    }

    @Transaction(false)
    @Returns('string')
    async GetLender(ctx: Context, lenderId: string): Promise<string> {
        const bytes = await ctx.stub.getState(`LENDER_${lenderId}`);
        if (!bytes || bytes.length === 0) {
            throw new Error(`Lender ${lenderId} is not registered`);
        }
        return bytes.toString();
    }

    // ---------------------------------------------------------------------
    // Receivable lifecycle
    // ---------------------------------------------------------------------

    @Transaction()
    async SubmitReceivable(
        ctx: Context,
        receivableId: string,
        sellerId: string,
        buyerId: string,
        faceValueStr: string,
        invoiceHash: string,
    ): Promise<void> {
        const existing = await ctx.stub.getState(receivableId);
        if (existing && existing.length > 0) {
            throw new Error(`Receivable ${receivableId} already exists`);
        }
        const faceValue = Number(faceValueStr);
        if (!Number.isFinite(faceValue) || faceValue <= 0) {
            throw new Error('faceValue must be a positive number');
        }
        const receivable: Receivable = {
            docType: 'receivable',
            id: receivableId,
            sellerId,
            buyerId,
            faceValue,
            invoiceHash,
            status: 'PENDING',
            totalClaimed: 0,
            createdAt: ctx.stub.getTxTimestamp().seconds.low.toString(),
        };
        await ctx.stub.putState(receivableId, Buffer.from(JSON.stringify(receivable)));
        ctx.stub.setEvent('ReceivableSubmitted', Buffer.from(JSON.stringify({ receivableId, sellerId, buyerId })));
    }

    @Transaction()
    async AttestBuyer(ctx: Context, receivableId: string, buyerId: string): Promise<void> {
        const receivable = await this.getReceivable(ctx, receivableId);
        if (receivable.status !== 'PENDING') {
            throw new Error(`Receivable ${receivableId} is not PENDING (current status: ${receivable.status})`);
        }
        if (receivable.buyerId !== buyerId) {
            throw new Error('Buyer identity does not match the receivable buyer');
        }
        receivable.status = 'ACTIVE';
        await ctx.stub.putState(receivableId, Buffer.from(JSON.stringify(receivable)));
        ctx.stub.setEvent('ReceivableActivated', Buffer.from(JSON.stringify({ receivableId })));
    }

    // ---------------------------------------------------------------------
    // Confidential partial-financing check + claim
    // ---------------------------------------------------------------------

    @Transaction()
    @Returns('string')
    async RequestFinancing(
        ctx: Context,
        receivableId: string,
        lenderId: string,
        amountStr: string,
        claimType: string,
        commitment: string,
    ): Promise<string> {
        this.requireLenderOrg(ctx);

        const lenderBytes = await ctx.stub.getState(`LENDER_${lenderId}`);
        if (!lenderBytes || lenderBytes.length === 0) {
            throw new Error(`Lender ${lenderId} is not registered`);
        }
        const lender = JSON.parse(lenderBytes.toString()) as Lender;
        if (!lender.active) {
            throw new Error(`Lender ${lenderId} is not an active consortium member`);
        }

        if (claimType !== 'PLEDGE' && claimType !== 'ASSIGNMENT') {
            throw new Error('claimType must be PLEDGE or ASSIGNMENT');
        }

        const receivable = await this.getReceivable(ctx, receivableId);
        if (receivable.status !== 'ACTIVE') {
            throw new Error(`Receivable ${receivableId} is not ACTIVE (current status: ${receivable.status})`);
        }

        const amount = Number(amountStr);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('amount must be a positive number');
        }

        const key = this.claimKey(ctx, receivableId, lenderId);
        const existingClaimBytes = await ctx.stub.getState(key);
        if (existingClaimBytes && existingClaimBytes.length > 0) {
            const existingClaim = JSON.parse(existingClaimBytes.toString()) as Claim;
            if (existingClaim.status === 'ACTIVE') {
                throw new Error(`Lender ${lenderId} already holds an active claim on receivable ${receivableId}`);
            }
        }

        const remainingCapacity = receivable.faceValue - receivable.totalClaimed;
        const approved = amount <= remainingCapacity;

        const claim: Claim = {
            docType: 'claim',
            receivableId,
            lenderId,
            amount,
            claimType: claimType as ClaimType,
            status: approved ? 'ACTIVE' : 'REJECTED',
            commitment,
            createdAt: ctx.stub.getTxTimestamp().seconds.low.toString(),
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(claim)));

        if (approved) {
            receivable.totalClaimed += amount;
            await ctx.stub.putState(receivableId, Buffer.from(JSON.stringify(receivable)));
        }

        // Only the aggregate outcome is broadcast on the event; no other lender's amount is ever
        // included in what a given caller receives back.
        const result = {
            receivableId,
            approved,
            remainingCapacity: receivable.faceValue - receivable.totalClaimed,
        };
        ctx.stub.setEvent(approved ? 'ClaimApproved' : 'ClaimRejected', Buffer.from(JSON.stringify({ receivableId, lenderId })));
        return JSON.stringify(result);
    }

    @Transaction(false)
    @Returns('string')
    async GetReceivableCapacity(ctx: Context, receivableId: string): Promise<string> {
        const receivable = await this.getReceivable(ctx, receivableId);
        const result = {
            id: receivable.id,
            status: receivable.status,
            faceValue: receivable.faceValue,
            totalClaimed: receivable.totalClaimed,
            remainingCapacity: receivable.faceValue - receivable.totalClaimed,
        };
        return JSON.stringify(result);
    }

    @Transaction(false)
    @Returns('string')
    async GetMyClaim(ctx: Context, receivableId: string, lenderId: string): Promise<string> {
        this.requireLenderOrg(ctx);
        const key = this.claimKey(ctx, receivableId, lenderId);
        const bytes = await ctx.stub.getState(key);
        if (!bytes || bytes.length === 0) {
            throw new Error(`No claim found for lender ${lenderId} on receivable ${receivableId}`);
        }
        return bytes.toString();
    }

    // ---------------------------------------------------------------------
    // Regulator-only audit visibility
    // ---------------------------------------------------------------------

    @Transaction(false)
    @Returns('string')
    async GetAllClaims(ctx: Context, receivableId: string): Promise<string> {
        this.requireRegulator(ctx);
        const iterator = await ctx.stub.getStateByPartialCompositeKey('claim', [receivableId]);
        const claims: Claim[] = [];
        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value) {
                claims.push(JSON.parse(result.value.value.toString()) as Claim);
            }
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(claims);
    }

    @Transaction(false)
    @Returns('string')
    async GetReceivableHistory(ctx: Context, receivableId: string): Promise<string> {
        this.requireRegulator(ctx);
        const iterator = await ctx.stub.getHistoryForKey(receivableId);
        const history: unknown[] = [];
        let result = await iterator.next();
        while (!result.done) {
            if (result.value) {
                history.push({
                    txId: result.value.txId,
                    timestamp: result.value.timestamp,
                    isDelete: result.value.isDelete,
                    value: result.value.value.length > 0 ? JSON.parse(result.value.value.toString()) : null,
                });
            }
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(history);
    }

    // ---------------------------------------------------------------------
    // Fraud containment / dispute governance
    // ---------------------------------------------------------------------

    @Transaction()
    async FlagLinkedEntity(ctx: Context, businessIdA: string, businessIdB: string, reason: string): Promise<void> {
        this.requireRegulator(ctx);
        const link: LinkedEntity = {
            docType: 'linkedEntity',
            businessIdA,
            businessIdB,
            reason,
            createdAt: ctx.stub.getTxTimestamp().seconds.low.toString(),
        };
        const key = ctx.stub.createCompositeKey('linkedEntity', [businessIdA, businessIdB]);
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(link)));
        ctx.stub.setEvent('LinkedEntityFlagged', Buffer.from(JSON.stringify({ businessIdA, businessIdB, reason })));
    }

    @Transaction()
    async FreezeReceivable(ctx: Context, receivableId: string, reason: string): Promise<void> {
        this.requireRegulator(ctx);
        const receivable = await this.getReceivable(ctx, receivableId);
        receivable.status = 'DISPUTED';
        receivable.flagReason = reason;
        await ctx.stub.putState(receivableId, Buffer.from(JSON.stringify(receivable)));
        ctx.stub.setEvent('ReceivableFrozen', Buffer.from(JSON.stringify({ receivableId, reason })));
    }

    @Transaction()
    async UnfreezeReceivable(ctx: Context, receivableId: string): Promise<void> {
        this.requireRegulator(ctx);
        const receivable = await this.getReceivable(ctx, receivableId);
        if (receivable.status !== 'DISPUTED') {
            throw new Error(`Receivable ${receivableId} is not DISPUTED`);
        }
        receivable.status = 'ACTIVE';
        receivable.flagReason = undefined;
        await ctx.stub.putState(receivableId, Buffer.from(JSON.stringify(receivable)));
        ctx.stub.setEvent('ReceivableUnfrozen', Buffer.from(JSON.stringify({ receivableId })));
    }

    @Transaction()
    async SettleReceivable(ctx: Context, receivableId: string): Promise<void> {
        const receivable = await this.getReceivable(ctx, receivableId);
        if (receivable.status !== 'ACTIVE') {
            throw new Error(`Receivable ${receivableId} is not ACTIVE (current status: ${receivable.status})`);
        }
        receivable.status = 'SETTLED';
        await ctx.stub.putState(receivableId, Buffer.from(JSON.stringify(receivable)));
        ctx.stub.setEvent('ReceivableSettled', Buffer.from(JSON.stringify({ receivableId })));
    }

    // ---------------------------------------------------------------------
    // Public Merkle audit anchor (records that a batch of ledger events was
    // anchored to a public chain; the actual public-chain publish happens
    // off-chain in the backend anchor service)
    // ---------------------------------------------------------------------

    @Transaction()
    async RecordMerkleAnchor(ctx: Context, rootHash: string, eventCountStr: string, periodLabel: string): Promise<void> {
        this.requireRegulator(ctx);
        const anchor: MerkleAnchor = {
            docType: 'merkleAnchor',
            rootHash,
            eventCount: Number(eventCountStr),
            periodLabel,
            createdAt: ctx.stub.getTxTimestamp().seconds.low.toString(),
        };
        const key = ctx.stub.createCompositeKey('merkleAnchor', [periodLabel]);
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(anchor)));
    }
}
