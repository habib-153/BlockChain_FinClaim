import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler';
import { claimController } from './claim.controller';

export const claimRoutes = Router();

claimRoutes.post('/', asyncHandler(claimController.requestFinancing));
claimRoutes.get('/:receivableId/all', asyncHandler(claimController.getAllClaims));
claimRoutes.get('/:receivableId/:lenderId', asyncHandler(claimController.getMyClaim));
