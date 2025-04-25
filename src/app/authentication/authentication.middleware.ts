import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { DmaLogger } from '../logging';
import { base64ToValue } from '../utils';
import { AuthenticationService } from './authentication.service';

type Request = FastifyRequest['raw'];
type Response = FastifyReply['raw'];

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly logger: DmaLogger
    ) {
        this.logger.setContext('AuthenticationMiddleware');
    }

    public async use(request: Request, _response: Response, next: () => void) {
        try {
            if (!request.headers.authorization || !request.headers.authorization.startsWith('Basic ')) {
                next();
                return;
            }
            const authHeader = request.headers.authorization.replace('Basic', '').trim();
            const decoded = base64ToValue(authHeader);

            const [username, password] = decoded.split(':');

            if (!username || !password) {
                throw new Error('Invalid Basic authentication format');
            }
            const user = await this.authenticationService.login({
                username: username,
                password: password,
            });

            request.authenticatedUser = user;

            this.logger.log(`Authenticated request for User with ID "${user.id}"`);
            next();
        } catch (error) {
            this.logger.warn(`Unable to set authentication - Reason: ${(error as Error).message}`);
            next();
        }
    }
}
