import { getContract } from '../../fabric/gateway';
import { decodeJson } from '../../lib/fabric-result';
import { commitAmount } from '../../services/crypto';
import type { CreateClaimDto } from './dto/create-claim.dto';

const LENDER_ORG = 'org1';
const REGULATOR_ORG = 'org2';

interface FinancingOutcome {
    receivableId: string;
    approved: boolean;
    remainingCapacity: number;
}

export interface FinancingResult extends FinancingOutcome {
    /**
     * Returned once, to the requesting lender only. This is the secret half of the on-chain
     * commitment (SHA256(amount||nonce)) that lets this lender -- and only this lender -- prove
     * its claimed amount later during a dispute. Never persisted server-side or logged.
     */
    nonce: string;
}

export const claimService = {
    async requestFinancing(dto: CreateClaimDto): Promise<FinancingResult> {
        const { commitment, nonce } = commitAmount(dto.amount);
        const contract = await getContract(LENDER_ORG);
        const result = await contract.submitTransaction(
            'RequestFinancing',
            dto.receivableId,
            dto.lenderId,
            String(dto.amount),
            dto.claimType,
            commitment,
        );
        const outcome = decodeJson<FinancingOutcome>(result);
        return { ...outcome, nonce };
    },

    async getMyClaim(receivableId: string, lenderId: string): Promise<unknown> {
        const contract = await getContract(LENDER_ORG);
        const result = await contract.evaluateTransaction('GetMyClaim', receivableId, lenderId);
        return decodeJson(result);
    },

    /** Regulator-only in the chaincode -- seeing every lender's claim on one receivable is the
     * supervisory view the whitepaper says only Bangladesh Bank gets. */
    async getAllClaims(receivableId: string): Promise<unknown> {
        const contract = await getContract(REGULATOR_ORG);
        const result = await contract.evaluateTransaction('GetAllClaims', receivableId);
        return decodeJson(result);
    },
};
