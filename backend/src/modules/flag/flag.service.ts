import { getContract } from '../../fabric/gateway';
import { decodeJson } from '../../lib/fabric-result';
import type { ClearFlagDto } from './dto/clear-flag.dto';
import type { RaiseFlagDto } from './dto/raise-flag.dto';

/** Raising/clearing a linked-entity flag and reading the consortium-wide flag list are all
 * regulator-only actions in the chaincode (Bangladesh Bank's supervisory role). */
const REGULATOR_ORG = 'org2';

export const flagService = {
    async raise(dto: RaiseFlagDto): Promise<void> {
        const contract = await getContract(REGULATOR_ORG);
        await contract.submitTransaction(
            'RaiseReceivableFlag',
            dto.receivableId,
            dto.flagId,
            dto.linkedEntityId,
            dto.reason,
        );
    },

    async clear(receivableId: string, flagId: string, dto: ClearFlagDto): Promise<void> {
        const contract = await getContract(REGULATOR_ORG);
        await contract.submitTransaction(
            'ClearReceivableFlag',
            receivableId,
            flagId,
            String(dto.feeAcknowledged),
            dto.supportingDocumentHash,
        );
    },

    async get(receivableId: string, flagId: string): Promise<unknown> {
        const contract = await getContract(REGULATOR_ORG);
        const result = await contract.evaluateTransaction('GetFlag', receivableId, flagId);
        return decodeJson(result);
    },

    async listForReceivable(receivableId: string): Promise<unknown> {
        const contract = await getContract(REGULATOR_ORG);
        const result = await contract.evaluateTransaction('GetFlagsForReceivable', receivableId);
        return decodeJson(result);
    },
};
