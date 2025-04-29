import 'fastify';
import { User } from './shared';

declare module 'fastify' {
    interface FastifyRequest {
        authenticatedUser?: User;
    }
}
