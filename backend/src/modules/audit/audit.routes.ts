import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler';
import { auditController } from './audit.controller';

export const auditRoutes = Router();

auditRoutes.post('/anchors', asyncHandler(auditController.recordAnchor));
