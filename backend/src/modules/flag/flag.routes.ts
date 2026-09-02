import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler';
import { flagController } from './flag.controller';

export const flagRoutes = Router();

flagRoutes.post('/', asyncHandler(flagController.raise));
flagRoutes.post('/:receivableId/:flagId/clear', asyncHandler(flagController.clear));
flagRoutes.get('/:receivableId/:flagId', asyncHandler(flagController.get));
flagRoutes.get('/:receivableId', asyncHandler(flagController.listForReceivable));
