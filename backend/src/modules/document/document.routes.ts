import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler';
import { documentController } from './document.controller';

export const documentRoutes = Router();

documentRoutes.post('/', asyncHandler(documentController.upload));
documentRoutes.get('/:hash', asyncHandler(documentController.download));
