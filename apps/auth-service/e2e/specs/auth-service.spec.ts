import axios from 'axios';

describe('Auth Service', () => {
    it('GET /api/health returns ok', async () => {
        const res = await axios.get('/api/health');

        expect(res.status).toBe(200);
        expect(res.data).toEqual({ status: 'ok' });
    });

    it('POST /api/v1/auth/sign-up validates request body', async () => {
        const res = await axios.post('/api/v1/auth/sign-up', {}, { validateStatus: () => true });

        expect(res.status).toBe(400);
    });
});
