import '@fastify/cookie';
import 'fastify';
import { ScopeName, User } from './src/app/shared';

declare module 'fastify' {
    interface FastifyRequest {
        authenticatedUser?: User;
        scopes?: ScopeName[];
    }
}
