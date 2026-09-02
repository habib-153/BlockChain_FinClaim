import { HttpError } from '../../../lib/http-error';
import { asRecord, requireNumber, requireString } from '../../../lib/validate';

export interface SubmitReceivableDto {
    receivableId: string;
    sellerId: string;
    buyerId: string;
    faceValue: number;
    invoiceHash: string;
}

export function parseSubmitReceivableDto(body: unknown): SubmitReceivableDto {
    const record = asRecord(body);
    const faceValue = requireNumber(record, 'faceValue');
    if (faceValue <= 0) {
        throw new HttpError(400, 'faceValue must be a positive number');
    }
    return {
        receivableId: requireString(record, 'receivableId'),
        sellerId: requireString(record, 'sellerId'),
        buyerId: requireString(record, 'buyerId'),
        faceValue,
        invoiceHash: requireString(record, 'invoiceHash'),
    };
}
