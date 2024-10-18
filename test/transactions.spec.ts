import { expect, beforeAll, afterAll, describe, it, beforeEach } from 'vitest';
import request from 'supertest';
import { server } from '../src/app';
import { execSync } from 'child_process';

beforeAll(async () => {
    await server.ready();
});

afterAll(async () => {
    await server.close();
});

beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
});

describe('transactions routes', () => {
    it('user can create a new transaction', async () => {
        const response = await request(server.server)
            .post('/transactions')
            .send({
                title: 'Teste',
                amount: 5000,
                type: 'credit'
            });

        expect(response.statusCode).toEqual(201);
    });

    it('user can list all your transactions', async () => {
        const createTransactionResponse = await request(server.server)
            .post('/transactions')
            .send({
                title: 'Teste',
                amount: 5000,
                type: 'credit'
            });

        let cookies: string[] = createTransactionResponse.get('Set-Cookie') || [];

        const listTransactionsResponse = await request(server.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200);

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                amount: 5000,
                title: 'Teste'

            })
        ]);
    });

    it('user can get a specific transaction', async () => {
        const createTransactionResponse = await request(server.server)
            .post('/transactions')
            .send({
                title: 'Teste',
                amount: 5000,
                type: 'credit'
            });

        let cookies: string[] = createTransactionResponse.get('Set-Cookie') || [];

        const listTransactionsResponse = await request(server.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200);

        const transactionId = listTransactionsResponse.body.transactions[0].id;

        const getTransactionResponse = await request(server.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200)


        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                amount: 5000,
                title: 'Teste'
            })
        );
    });

    it('user can get your transactions summary', async () => {
        let createTransactionResponse = await request(server.server)
            .post('/transactions')
            .send({
                title: 'Teste',
                amount: 5000,
                type: 'credit'
            });

        let cookies: string[] = createTransactionResponse.get('Set-Cookie') || [];



        createTransactionResponse = await request(server.server)
            .post('/transactions')
            .set('Cookie', cookies)
            .send({
                title: 'Teste',
                amount: 8000,
                type: 'credit'
            });

        const summaryTransactionsResponse = await request(server.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200);

        expect(summaryTransactionsResponse.body).toEqual(
            expect.objectContaining({
                summary: {
                    amount: 13000
                }
            })
        );
    });
});
