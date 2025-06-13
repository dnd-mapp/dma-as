import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationGuard, CreateScopeData, HasRole, RoleGuard, Roles, Scope } from '../shared';
import { ScopesService } from './scopes.service';

@Controller('scopes')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthenticationGuard, RoleGuard)
export class ScopesController {
    constructor(private readonly scopesService: ScopesService) {}

    @HasRole(Roles.ADMIN)
    @Get()
    public async getAll() {
        return await this.scopesService.getAll();
    }

    @HasRole(Roles.ADMIN)
    @Post()
    public async create(@Body() data: CreateScopeData, @Res({ passthrough: true }) response: FastifyReply) {
        const scope = await this.scopesService.create(data);

        response
            .status(HttpStatus.CREATED)
            .headers({ location: `${response.request.url}/${scope.id}` })
            .send(scope);
    }

    @HasRole(Roles.ADMIN)
    @Get(':scopeId')
    public async getById(@Param('scopeId') scopeIdParam: string) {
        const scope = await this.scopesService.getById(scopeIdParam);

        if (!scope) throw new NotFoundException(`Scope with ID "${scopeIdParam}" was not found`);
        return scope;
    }

    @HasRole(Roles.ADMIN)
    @Put(':scopeId')
    public async update(@Param('scopeId') scopeIdParam: string, @Body() data: Scope, @Req() request: FastifyRequest) {
        if (scopeIdParam !== data.id) {
            throw new BadRequestException(
                `It is not allowed to update Scope on path "${request.url}" with data from Scope with ID "${scopeIdParam}"`
            );
        }
        return await this.scopesService.update(data);
    }

    @HasRole(Roles.ADMIN)
    @Delete(':scopeId')
    public async remove(@Param('scopeId') scopeIdParam: string) {
        await this.scopesService.removeById(scopeIdParam);
    }
}
