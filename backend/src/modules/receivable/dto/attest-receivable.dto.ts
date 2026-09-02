import { asRecord, requireString } from '../../../lib/validate';

export interface AttestReceivableDto {
    buyerId: string;
}

export function parseAttestReceivableDto(body: unknown): AttestReceivableDto {
    const record = asRecord(body);
    return { buyerId: requireString(record, 'buyerId') };
}
