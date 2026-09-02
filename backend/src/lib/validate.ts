import { HttpError } from './http-error';

/** Minimal request-body validation -- a hand-rolled stand-in for class-validator/DTO pipes,
 * kept dependency-free since these are the only shapes this API needs to check. */

export function asRecord(body: unknown): Record<string, unknown> {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        throw new HttpError(400, 'Request body must be a JSON object');
    }
    return body as Record<string, unknown>;
}

export function requireString(body: Record<string, unknown>, field: string): string {
    const value = body[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new HttpError(400, `${field} is required and must be a non-empty string`);
    }
    return value;
}

export function requireNumber(body: Record<string, unknown>, field: string): number {
    const value = body[field];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new HttpError(400, `${field} is required and must be a finite number`);
    }
    return value;
}

export function requireBoolean(body: Record<string, unknown>, field: string): boolean {
    const value = body[field];
    if (typeof value !== 'boolean') {
        throw new HttpError(400, `${field} is required and must be a boolean`);
    }
    return value;
}
