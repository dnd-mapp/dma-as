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
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationGuard } from '../authentication';
import { Client, COOKIE_NAME_ACCESS_TOKEN, COOKIE_NAME_REFRESH_TOKEN, CreateClientData } from '../shared';
import { ClientsService } from './clients.service';

@Controller('clients')
@UseGuards(AuthenticationGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Get()
    public async getAll() {
        return await this.clientsService.getAll();
    }

    @Post()
    public async create(@Body() data: CreateClientData, @Res({ passthrough: true }) response: FastifyReply) {
        const createdClient = await this.clientsService.create(data);
        const path = new URL(response.request.url).pathname;

        response
            .status(HttpStatus.CREATED)
            .headers({ location: `${path}/${createdClient.id}` })
            .send(createdClient);
    }

    @Post(':clientId/rotate-keys')
    public async rotateKeys(@Res({ passthrough: true }) response: FastifyReply, @Param('clientId') clientId: string) {
        await this.clientsService.rotateKeysForClient(clientId);

        response.clearCookie(COOKIE_NAME_REFRESH_TOKEN).clearCookie(`${COOKIE_NAME_ACCESS_TOKEN}-${clientId}`);
    }

    @Get(':clientId')
    public async getById(@Param('clientId') clientIdParam: string) {
        return await this.clientsService.getById(clientIdParam);
    }

    @Put(':clientId')
    public async update(
        @Req() request: FastifyRequest,
        @Param('clientId') clientIdParam: string,
        @Body() data: Client
    ) {
        const path = new URL(request.url).pathname;

        if (data.id !== clientIdParam) {
            throw new BadRequestException(
                `It's not allowed to change Client on path "${path}" with data from Client with ID "${clientIdParam}"`
            );
        }
        return await this.clientsService.update(data);
    }

    @Delete(':clientId')
    public async remove(@Param('clientId') clientIdParam: string) {
        await this.clientsService.removeById(clientIdParam);
    }
}
