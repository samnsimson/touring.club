import { betterAuth } from 'better-auth';
import { typeormAdapter } from './adapter/auth.adapter';
import { dataSource } from './auth.datasource';

export const auth = betterAuth({
    database: typeormAdapter(dataSource, {
        usePlural: true,
        transaction: true,
    }),
});
