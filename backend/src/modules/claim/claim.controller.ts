import type { Request, Response } from 'express';
import { claimService } from './claim.service';
import { parseCreateClaimDto } from './dto/create-claim.dto';

export const claimController = {
    async requestFinancing(req: Request, res: Response): Promise<void> {
        const dto = parseCreateClaimDto(req.body);
        res.status(201).json(await claimService.requestFinancing(dto));
    },

    async getMyClaim(req: Request, res: Response): Promise<void> {
        res.status(200).json(await claimService.getMyClaim(req.params.receivableId, req.params.lenderId));
    },

    async getAllClaims(req: Request, res: Response): Promise<void> {
        res.status(200).json(await claimService.getAllClaims(req.params.receivableId));
    },
};
