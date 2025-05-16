import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { HasRole } from '../decorators';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    public canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const requestedRole = this.reflector.get(HasRole, context.getHandler());

        return request.authenticatedUser?.hasRole(requestedRole);
    }
}
