import type { Request, Response } from 'express';
import { parseClearFlagDto } from './dto/clear-flag.dto';
import { parseRaiseFlagDto } from './dto/raise-flag.dto';
import { flagService } from './flag.service';

export const flagController = {
    async raise(req: Request, res: Response): Promise<void> {
        const dto = parseRaiseFlagDto(req.body);
        await flagService.raise(dto);
        res.status(201).json({ flagId: dto.flagId, receivableId: dto.receivableId, status: 'PENDING_REVIEW' });
    },

    async clear(req: Request, res: Response): Promise<void> {
        const dto = parseClearFlagDto(req.body);
        await flagService.clear(req.params.receivableId, req.params.flagId, dto);
        res.status(200).json({ flagId: req.params.flagId, receivableId: req.params.receivableId, status: 'CLEARED' });
    },

    async get(req: Request, res: Response): Promise<void> {
        res.status(200).json(await flagService.get(req.params.receivableId, req.params.flagId));
    },

    async listForReceivable(req: Request, res: Response): Promise<void> {
        res.status(200).json(await flagService.listForReceivable(req.params.receivableId));
    },
};
