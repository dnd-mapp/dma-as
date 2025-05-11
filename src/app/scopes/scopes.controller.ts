import {
    BadRequestException,
    Body,
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
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateScopeData, Scope } from '../shared';
import { ScopesService } from './scopes.service';

@Controller('scopes')
export class ScopesController {
    constructor(private readonly scopesService: ScopesService) {}

    @Get()
    public async getAll() {
        return await this.scopesService.getAll();
    }

    @Post()
    public async create(@Body() data: CreateScopeData, @Res({ passthrough: true }) response: FastifyReply) {
        const scope = await this.scopesService.create(data);

        response
            .status(HttpStatus.CREATED)
            .headers({ location: `${response.request.url}/${scope.id}` })
            .send(scope);
    }

    @Get(':scopeId')
    public async getById(@Param('scopeId') scopeIdParam: string) {
        const scope = await this.scopesService.getById(scopeIdParam);

        if (!scope) throw new NotFoundException(`Scope with ID "${scopeIdParam}" was not found`);
        return scope;
    }

    @Put(':scopeId')
    public async update(@Param('scopeId') scopeIdParam: string, @Body() data: Scope, @Req() request: FastifyRequest) {
        if (scopeIdParam !== data.id) {
            throw new BadRequestException(
                `It is not allowed to update Scope on path "${request.url}" with data from Scope with ID "${scopeIdParam}"`
            );
        }
        return await this.scopesService.update(data);
    }

    @Delete(':scopeId')
    public async remove(@Param('scopeId') scopeIdParam: string) {
        await this.scopesService.removeById(scopeIdParam);
    }
}
