import cors from 'cors';
import express, { type Express } from 'express';
import { errorHandler } from './middleware/error-handler';
import { auditRoutes } from './modules/audit/audit.routes';
import { claimRoutes } from './modules/claim/claim.routes';
import { documentRoutes } from './modules/document/document.routes';
import { flagRoutes } from './modules/flag/flag.routes';
import { receivableRoutes } from './modules/receivable/receivable.routes';

export function createApp(): Express {
    const app = express();
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));

    app.get('/health', (_req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.use('/api/receivables', receivableRoutes);
    app.use('/api/claims', claimRoutes);
    app.use('/api/flags', flagRoutes);
    app.use('/api/documents', documentRoutes);
    app.use('/api/audit', auditRoutes);

    app.use(errorHandler);

    return app;
}
