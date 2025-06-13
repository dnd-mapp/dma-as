import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { HasScope } from '../decorators';

@Injectable()
export class ScopeGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    public canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const requestedScope = this.reflector.get(HasScope, context.getHandler());

        return request.scopes.some((scope) => scope === requestedScope);
    }
}
