import type { Request, Response } from 'express';
import { auditService } from './audit.service';
import { parseRecordAnchorDto } from './dto/record-anchor.dto';

export const auditController = {
    async recordAnchor(req: Request, res: Response): Promise<void> {
        const dto = parseRecordAnchorDto(req.body);
        await auditService.recordAnchor(dto);
        res.status(201).json({ periodLabel: dto.periodLabel, rootHash: dto.rootHash });
    },
};
