"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const child_process_1 = require("child_process");
(0, vitest_1.beforeAll)(async () => {
    await app_1.server.ready();
});
(0, vitest_1.afterAll)(async () => {
    await app_1.server.close();
});
(0, vitest_1.beforeEach)(() => {
    (0, child_process_1.execSync)('npm run knex migrate:rollback --all');
    (0, child_process_1.execSync)('npm run knex migrate:latest');
});
(0, vitest_1.describe)('transactions routes', () => {
    (0, vitest_1.it)('user can create a new transaction', async () => {
        const response = await (0, supertest_1.default)(app_1.server.server)
            .post('/transactions')
            .send({
            title: 'Teste',
            amount: 5000,
            type: 'credit'
        });
        (0, vitest_1.expect)(response.statusCode).toEqual(201);
    });
    (0, vitest_1.it)('user can list all your transactions', async () => {
        const createTransactionResponse = await (0, supertest_1.default)(app_1.server.server)
            .post('/transactions')
            .send({
            title: 'Teste',
            amount: 5000,
            type: 'credit'
        });
        let cookies = createTransactionResponse.get('Set-Cookie') || [];
        const listTransactionsResponse = await (0, supertest_1.default)(app_1.server.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200);
        (0, vitest_1.expect)(listTransactionsResponse.body.transactions).toEqual([
            vitest_1.expect.objectContaining({
                amount: 5000,
                title: 'Teste'
            })
        ]);
    });
    (0, vitest_1.it)('user can get a specific transaction', async () => {
        const createTransactionResponse = await (0, supertest_1.default)(app_1.server.server)
            .post('/transactions')
            .send({
            title: 'Teste',
            amount: 5000,
            type: 'credit'
        });
        let cookies = createTransactionResponse.get('Set-Cookie') || [];
        const listTransactionsResponse = await (0, supertest_1.default)(app_1.server.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200);
        const transactionId = listTransactionsResponse.body.transactions[0].id;
        const getTransactionResponse = await (0, supertest_1.default)(app_1.server.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200);
        (0, vitest_1.expect)(getTransactionResponse.body.transaction).toEqual(vitest_1.expect.objectContaining({
            amount: 5000,
            title: 'Teste'
        }));
    });
    (0, vitest_1.it)('user can get your transactions summary', async () => {
        let createTransactionResponse = await (0, supertest_1.default)(app_1.server.server)
            .post('/transactions')
            .send({
            title: 'Teste',
            amount: 5000,
            type: 'credit'
        });
        let cookies = createTransactionResponse.get('Set-Cookie') || [];
        createTransactionResponse = await (0, supertest_1.default)(app_1.server.server)
            .post('/transactions')
            .set('Cookie', cookies)
            .send({
            title: 'Teste',
            amount: 8000,
            type: 'credit'
        });
        const summaryTransactionsResponse = await (0, supertest_1.default)(app_1.server.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200);
        (0, vitest_1.expect)(summaryTransactionsResponse.body).toEqual(vitest_1.expect.objectContaining({
            summary: {
                amount: 13000
            }
        }));
    });
});
