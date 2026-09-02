import { asRecord, requireString } from '../../../lib/validate';

export interface UploadDocumentDto {
    contentBase64: string;
}

export function parseUploadDocumentDto(body: unknown): UploadDocumentDto {
    const record = asRecord(body);
    return { contentBase64: requireString(record, 'contentBase64') };
}
