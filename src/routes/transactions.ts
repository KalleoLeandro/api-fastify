import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { knex } from "../database";
import { randomUUID } from 'crypto';
import { checkSessionIdExists } from "../../middlewares/check-session-id-exists";
import { request } from "http";

export async function transactionsRoutes(server: FastifyInstance) {
    server.addHook('preHandler', async(request, response)=>{
        console.log(`[${request.method} ${request.url}]`)
    });
    
    server.get('/', { preHandler: [checkSessionIdExists] }, async (request, response) => {

        const { sessionId } = request.cookies;

        const transactions = await knex('transactions').where('session_id', sessionId).select();
        return { transactions };
    });

    server.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
        const { sessionId } = request.cookies;
        
        const getTransactionParamSchema = z.object({
            id: z.string().uuid()
        });

        const { id } = getTransactionParamSchema.parse(request.params);

        const transaction = await knex('transactions').where({ session_id: sessionId, id }).first();

        return { transaction };
    });

    server.get('/summary', { preHandler: [checkSessionIdExists] }, async (request, response) => {
        
        const { sessionId } = request.cookies;

        const summary = await knex('transactions').sum('amount', { as: 'amount' }).where('session_id', sessionId).first();

        return { summary }
    })

    server.post('/', async (request, response) => {

        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        });

        const { title, amount, type } = createTransactionBodySchema.parse(request.body);

        let sessionId = request.cookies.sessionId;

        if (!sessionId) {
            sessionId = randomUUID()

            response.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            });
        }

        await knex('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * (-1),
            session_id: sessionId
        });

        return response.status(201).send();
    });
}





/*server.get('/hello', async ()=>{
       const transaction = await knex('transactions').insert({
           id: crypto.randomUUID(),
           title: 'Transação de teste',
           amount: 1000
       }).returning('*');
   
       const transactions = await knex('transactions')
       .where('amount', 1000)
       .select('*');
   
       return transactions;
   
   });*/