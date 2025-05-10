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
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ClientsService } from './clients.service';
import { Client, CreateClientData } from './models';

@Controller('clients')
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
