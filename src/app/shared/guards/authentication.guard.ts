import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { DmaLogger } from '../../logging';
import { validateCookie } from '../functions';
import { CLIENT_ID_HEADER, COOKIE_NAME_ACCESS_TOKEN, TokenTypes } from '../models';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly logger: DmaLogger
    ) {
        this.logger.setContext('AuthenticationGuard');
    }

    public async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const clientId = request.headers[CLIENT_ID_HEADER.toLowerCase()] as string;

        const decodedToken = await validateCookie({
            request: request,
            cookieName: `${COOKIE_NAME_ACCESS_TOKEN}-${clientId}`,
            moduleRef: this.moduleRef,
            logger: this.logger,
        });

        if (decodedToken.tpe !== TokenTypes.ACCESS) {
            this.logger.warn('Token not accepted - Reason: Invalid token type');
            throw new UnauthorizedException('Unauthorized');
        }
        request.scopes = decodedToken.scopes;
        request.authenticatedUser = decodedToken.user;
        return true;
    }
}
