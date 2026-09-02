import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Express doesn't forward rejected promises from async handlers to error middleware on its
 * own (pre-v5) -- this wrapper catches them and routes them to `next()` instead. */
export function asyncHandler(
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
    return (req, res, next) => {
        handler(req, res, next).catch(next);
    };
}
