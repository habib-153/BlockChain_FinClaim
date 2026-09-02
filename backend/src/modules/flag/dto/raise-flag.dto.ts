import { asRecord, requireString } from '../../../lib/validate';

export interface RaiseFlagDto {
    flagId: string;
    receivableId: string;
    linkedEntityId: string;
    reason: string;
}

export function parseRaiseFlagDto(body: unknown): RaiseFlagDto {
    const record = asRecord(body);
    return {
        flagId: requireString(record, 'flagId'),
        receivableId: requireString(record, 'receivableId'),
        linkedEntityId: requireString(record, 'linkedEntityId'),
        reason: requireString(record, 'reason'),
    };
}
