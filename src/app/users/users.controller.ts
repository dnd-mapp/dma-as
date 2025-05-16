import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { DmaLogger } from '../logging';
import { AuthenticationGuard, CreateUserData, HasRole, RoleGuard, Roles, UpdateUserData, User } from '../shared';
import { UsersService } from './users.service';

@UseGuards(AuthenticationGuard, RoleGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly logger: DmaLogger
    ) {
        this.logger.setContext('UsersController');
    }

    @HasRole(Roles.USER)
    @Get()
    public async getAll() {
        this.logger.log('Getting all Users');
        return await this.usersService.getAll();
    }

    @HasRole(Roles.ADMIN)
    @Post()
    public async create(@Body() userData: CreateUserData) {
        this.logger.log('Creating a new user');
        return await this.usersService.create(userData);
    }

    @HasRole(Roles.USER)
    @Get('/:id')
    public async getById(@Param('id') userIdParam: string) {
        this.logger.log(`Getting user with ID "${userIdParam}"`);
        const query = await this.usersService.getById(userIdParam);

        if (!query) throw new NotFoundException(`User with ID "${userIdParam}" was not found`);
        return query;
    }

    @HasRole(Roles.USER)
    @Put('/:id')
    public async update(
        @Param('id') userIdParam: string,
        @Body() userData: UpdateUserData,
        @Req() request: FastifyRequest
    ) {
        this.validateResourceOwner(userIdParam, request.authenticatedUser);
        this.logger.log(`Update user with ID "${userIdParam}"`);

        if (userIdParam !== userData.id) {
            throw new BadRequestException(
                `The ID in the request body "${userData.id}" does not match the ID in the URL path "${userIdParam}"`
            );
        }
        return await this.usersService.update(userData);
    }

    @HasRole(Roles.ADMIN)
    @Delete('/:id')
    public async removeById(@Param('id') userIdParam: string, @Req() request: FastifyRequest) {
        this.validateResourceOwner(userIdParam, request.authenticatedUser);
        this.logger.log(`Remove user with ID "${userIdParam}"`);

        await this.usersService.removeById(userIdParam);
    }

    private validateResourceOwner(userId: string, authenticatedUser: User) {
        if (userId === authenticatedUser.id) return;
        this.logger.warn(`Unauthorized access attempt detected by User with ID "${authenticatedUser.id}"`);
        throw new ForbiddenException('You are not authorized to perform this action');
    }
}
