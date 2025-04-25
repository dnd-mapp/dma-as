import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { DmaLogger } from '../logging';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(private readonly logger: DmaLogger) {
        this.logger.setContext('AuthenticationGuard');
    }

    public canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const isAuthorized = Boolean(request.raw.authenticatedUser);

        if (isAuthorized) return true;
        this.logger.warn(`Unauthorized access attempt detected from IP "${request.ip}"`);
        throw new UnauthorizedException('Unauthorized. Please, log in before trying again.');
    }
}
