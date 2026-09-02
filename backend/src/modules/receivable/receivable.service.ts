import { getContract } from '../../fabric/gateway';
import { decodeJson } from '../../lib/fabric-result';
import type { SubmitReceivableDto } from './dto/submit-receivable.dto';

/**
 * SubmitReceivable/AttestBuyer/GetReceivableCapacity carry no MSP restriction in the chaincode
 * -- either org may call them. This gateway submits them via org1 (the Lender Consortium's peer
 * network), since that's where this prototype's API gateway infrastructure lives; org2 is
 * reserved for identities acting as Bangladesh Bank (see requireRegulator-gated calls below).
 */
const CONSORTIUM_ORG = 'org1';
const REGULATOR_ORG = 'org2';

export interface ReceivableCapacity {
    id: string;
    status: string;
    faceValue: number;
    totalClaimed: number;
    remainingCapacity: number;
}

export const receivableService = {
    async submit(dto: SubmitReceivableDto): Promise<void> {
        const contract = await getContract(CONSORTIUM_ORG);
        await contract.submitTransaction(
            'SubmitReceivable',
            dto.receivableId,
            dto.sellerId,
            dto.buyerId,
            String(dto.faceValue),
            dto.invoiceHash,
        );
    },

    async attest(receivableId: string, buyerId: string): Promise<void> {
        const contract = await getContract(CONSORTIUM_ORG);
        await contract.submitTransaction('AttestBuyer', receivableId, buyerId);
    },

    async getCapacity(receivableId: string): Promise<ReceivableCapacity> {
        const contract = await getContract(CONSORTIUM_ORG);
        const result = await contract.evaluateTransaction('GetReceivableCapacity', receivableId);
        return decodeJson<ReceivableCapacity>(result);
    },

    /** Regulator-only in the chaincode -- full state history is supervisory/audit visibility. */
    async getHistory(receivableId: string): Promise<unknown> {
        const contract = await getContract(REGULATOR_ORG);
        const result = await contract.evaluateTransaction('GetReceivableHistory', receivableId);
        return decodeJson(result);
    },
};
