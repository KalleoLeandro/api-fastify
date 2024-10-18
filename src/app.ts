import fastify from "fastify";
import cookie from '@fastify/cookie';
import { env } from "./env";
import { transactionsRoutes } from "./routes/transactions";

export const server = fastify();

server.register(cookie);

server.register(transactionsRoutes,{
    prefix: 'transactions'
});