import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler';
import { receivableController } from './receivable.controller';

export const receivableRoutes = Router();

receivableRoutes.post('/', asyncHandler(receivableController.submit));
receivableRoutes.post('/:id/attest', asyncHandler(receivableController.attest));
receivableRoutes.get('/:id/capacity', asyncHandler(receivableController.getCapacity));
receivableRoutes.get('/:id/history', asyncHandler(receivableController.getHistory));
