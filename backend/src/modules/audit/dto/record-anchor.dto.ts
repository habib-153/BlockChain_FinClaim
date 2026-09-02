import { HttpError } from '../../../lib/http-error';
import { asRecord, requireNumber, requireString } from '../../../lib/validate';

export interface RecordAnchorDto {
    rootHash: string;
    eventCount: number;
    periodLabel: string;
}

export function parseRecordAnchorDto(body: unknown): RecordAnchorDto {
    const record = asRecord(body);
    const eventCount = requireNumber(record, 'eventCount');
    if (eventCount < 0 || !Number.isInteger(eventCount)) {
        throw new HttpError(400, 'eventCount must be a non-negative integer');
    }
    return {
        rootHash: requireString(record, 'rootHash'),
        eventCount,
        periodLabel: requireString(record, 'periodLabel'),
    };
}
