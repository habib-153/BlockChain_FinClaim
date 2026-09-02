import { getContract } from '../../fabric/gateway';
import type { RecordAnchorDto } from './dto/record-anchor.dto';

const REGULATOR_ORG = 'org2';

/**
 * Records that a batch of consortium ledger events was anchored to a public chain (mechanism 4:
 * public Merkle audit anchor). The actual publish to a public/permissionless chain is a separate
 * off-chain step (would use `config.publicAnchorRpcUrl`/`publicAnchorPrivateKey`) -- this only
 * records the resulting root hash on the permissioned ledger so consortium members and the
 * regulator have a canonical, queryable record of what was anchored and when.
 */
export const auditService = {
    async recordAnchor(dto: RecordAnchorDto): Promise<void> {
        const contract = await getContract(REGULATOR_ORG);
        await contract.submitTransaction('RecordMerkleAnchor', dto.rootHash, String(dto.eventCount), dto.periodLabel);
    },
};
