import { createApp } from './app';
import { config } from './config';
import { closeAllConnections } from './fabric/gateway';

const app = createApp();

const server = app.listen(config.port, () => {
    console.log(`FinClaim backend listening on port ${config.port}`);
});

function shutdown(): void {
    server.close(() => {
        closeAllConnections();
        process.exit(0);
    });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
