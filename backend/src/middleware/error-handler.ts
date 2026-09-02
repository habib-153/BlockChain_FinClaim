import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/http-error';

const NOT_FOUND_HINTS = ['does not exist', 'not registered', 'No claim found', 'No document found'];

/** Chaincode transactions throw plain `Error`s with a human-readable message (e.g. "Receivable
 * X does not exist"). There's no live network in this build to observe fabric-gateway's actual
 * error shape against, so this stays a best-effort mapping: known "not found" phrasing becomes
 * 404, everything else the chaincode/service layer rejected becomes 400, and anything
 * unrecognized (a real infra/connection failure) is a 500. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof HttpError) {
        res.status(err.status).json({ error: err.message });
        return;
    }

    if (err instanceof Error) {
        const status = NOT_FOUND_HINTS.some((hint) => err.message.includes(hint)) ? 404 : 400;
        res.status(status).json({ error: err.message });
        return;
    }

    res.status(500).json({ error: 'Unexpected error' });
}
