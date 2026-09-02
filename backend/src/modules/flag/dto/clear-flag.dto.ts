import { HttpError } from '../../../lib/http-error';
import { asRecord, requireBoolean, requireString } from '../../../lib/validate';

export interface ClearFlagDto {
    feeAcknowledged: boolean;
    supportingDocumentHash: string;
}

/** Mirrors the frontend's ClearFlagDialog: the clear action must stay blocked unless both the
 * fee acknowledgment and a supporting document are present -- enforced again here (not just in
 * the chaincode) so the rejection is a clean 400 instead of a chaincode error round-trip. */
export function parseClearFlagDto(body: unknown): ClearFlagDto {
    const record = asRecord(body);
    const feeAcknowledged = requireBoolean(record, 'feeAcknowledged');
    const supportingDocumentHash = requireString(record, 'supportingDocumentHash');
    if (!feeAcknowledged) {
        throw new HttpError(400, 'The penalty fee must be acknowledged before a flag can be cleared');
    }
    return { feeAcknowledged, supportingDocumentHash };
}
