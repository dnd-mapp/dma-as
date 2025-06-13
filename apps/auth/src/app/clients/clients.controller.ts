import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import {
    AuthenticationGuard,
    Client,
    COOKIE_NAME_ACCESS_TOKEN,
    COOKIE_NAME_REFRESH_TOKEN,
    CreateClientData,
    HasRole,
    RoleGuard,
    Roles,
} from '../shared';
import { ClientsService } from './clients.service';

@Controller('clients')
@UseGuards(AuthenticationGuard, RoleGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @HasRole(Roles.ADMIN)
    @Get()
    public async getAll() {
        return await this.clientsService.getAll();
    }

    @HasRole(Roles.ADMIN)
    @Post()
    public async create(@Body() data: CreateClientData, @Res({ passthrough: true }) response: FastifyReply) {
        const createdClient = await this.clientsService.create(data);

        response
            .status(HttpStatus.CREATED)
            .headers({ location: `${response.request.url}/${createdClient.id}` })
            .send(createdClient);
    }

    @HasRole(Roles.ADMIN)
    @Post(':clientId/rotate-keys')
    public async rotateKeys(@Res({ passthrough: true }) response: FastifyReply, @Param('clientId') clientId: string) {
        await this.clientsService.rotateKeysForClient(clientId);

        response.clearCookie(COOKIE_NAME_REFRESH_TOKEN).clearCookie(`${COOKIE_NAME_ACCESS_TOKEN}-${clientId}`);
    }

    @HasRole(Roles.ADMIN)
    @Get(':clientId')
    public async getById(@Param('clientId') clientIdParam: string) {
        return await this.clientsService.getById(clientIdParam);
    }

    @HasRole(Roles.ADMIN)
    @Put(':clientId')
    public async update(
        @Req() request: FastifyRequest,
        @Param('clientId') clientIdParam: string,
        @Body() data: Client
    ) {
        if (data.id !== clientIdParam) {
            throw new BadRequestException(
                `It's not allowed to change Client on path "${request.url}" with data from Client with ID "${clientIdParam}"`
            );
        }
        return await this.clientsService.update(data);
    }

    @HasRole(Roles.ADMIN)
    @Delete(':clientId')
    public async remove(@Param('clientId') clientIdParam: string) {
        await this.clientsService.removeById(clientIdParam);
    }
}
