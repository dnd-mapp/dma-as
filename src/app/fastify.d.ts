import 'fastify';
import { ScopeName, User } from './shared';

declare module 'fastify' {
    interface FastifyRequest {
        authenticatedUser?: User;
        scopes?: ScopeName[];
    }
}
