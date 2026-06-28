import { NestExpressApplication } from '@nestjs/platform-express';
import { getDataSourceToken } from '@nestjs/typeorm';
import { Response as ExpressResponse } from 'express';
import { DataSource } from 'typeorm';

export const composeHealthRoutes = (app: NestExpressApplication, globalPrefix: string) => {
    const httpAdapter = app.getHttpAdapter();

    httpAdapter.get(`${globalPrefix}/health`, (_req, res) => {
        const reply = res as ExpressResponse;
        reply.setHeader('Content-Type', 'application/json');
        reply.end(JSON.stringify({ status: 'ok' }));
    });

    httpAdapter.get(`${globalPrefix}/health/readiness`, async (_req, res) => {
        const reply = res as ExpressResponse;
        reply.setHeader('Content-Type', 'application/json');
        try {
            const dataSource = app.get<DataSource>(getDataSourceToken(), { strict: false });
            if (dataSource?.isInitialized) await dataSource.query('SELECT 1');
            reply.end(JSON.stringify({ status: 'ok' }));
        } catch {
            reply.status?.(503);
            reply.end(JSON.stringify({ status: 'error' }));
        }
    });
};
