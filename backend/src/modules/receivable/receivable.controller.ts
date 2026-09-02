import type { Request, Response } from 'express';
import { parseAttestReceivableDto } from './dto/attest-receivable.dto';
import { parseSubmitReceivableDto } from './dto/submit-receivable.dto';
import { receivableService } from './receivable.service';

export const receivableController = {
    async submit(req: Request, res: Response): Promise<void> {
        const dto = parseSubmitReceivableDto(req.body);
        await receivableService.submit(dto);
        res.status(201).json({ receivableId: dto.receivableId, status: 'PENDING' });
    },

    async attest(req: Request, res: Response): Promise<void> {
        const dto = parseAttestReceivableDto(req.body);
        await receivableService.attest(req.params.id, dto.buyerId);
        res.status(200).json({ receivableId: req.params.id, status: 'ACTIVE' });
    },

    async getCapacity(req: Request, res: Response): Promise<void> {
        res.status(200).json(await receivableService.getCapacity(req.params.id));
    },

    async getHistory(req: Request, res: Response): Promise<void> {
        res.status(200).json(await receivableService.getHistory(req.params.id));
    },
};
