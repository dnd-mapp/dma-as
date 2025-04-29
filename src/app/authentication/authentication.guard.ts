import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { DmaLogger } from '../logging';
import { validateCookie } from './functions';

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

        request.authenticatedUser = await validateCookie(request, this.moduleRef, this.logger);
        return true;
    }
}
