import { HttpError } from '../../../lib/http-error';
import { asRecord, requireNumber, requireString } from '../../../lib/validate';

export type ClaimType = 'PLEDGE' | 'ASSIGNMENT';

export interface CreateClaimDto {
    receivableId: string;
    lenderId: string;
    amount: number;
    claimType: ClaimType;
}

export function parseCreateClaimDto(body: unknown): CreateClaimDto {
    const record = asRecord(body);
    const amount = requireNumber(record, 'amount');
    if (amount <= 0) {
        throw new HttpError(400, 'amount must be a positive number');
    }
    const claimType = requireString(record, 'claimType');
    if (claimType !== 'PLEDGE' && claimType !== 'ASSIGNMENT') {
        throw new HttpError(400, 'claimType must be PLEDGE or ASSIGNMENT');
    }
    return {
        receivableId: requireString(record, 'receivableId'),
        lenderId: requireString(record, 'lenderId'),
        amount,
        claimType,
    };
}
