import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DmaLogger } from '../logging';
import { CreateUserData, User } from './models';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly logger: DmaLogger
    ) {
        this.logger.setContext('UsersController');
    }

    @Get()
    public async getAll() {
        this.logger.log('Getting all Users');
        return await this.usersService.getAll();
    }

    @Post()
    public async create(@Body() userData: CreateUserData) {
        this.logger.log('Creating a new user', userData);
        return await this.usersService.create(userData);
    }

    @Get(':id')
    public async getById(@Param('id') userIdParam: string) {
        this.logger.log(`Getting user with ID "${userIdParam}"`);
        return await this.usersService.getById(userIdParam);
    }

    @Put(':id')
    public async update(@Param('id') userIdParam: string, @Body() userData: User) {
        this.logger.log(`Update user with ID "${userIdParam}"`);

        if (userIdParam !== userData.id) {
            throw new BadRequestException(
                `The ID in the request body "${userData.id}" does not match the ID in the URL path "${userIdParam}"`
            );
        }
        return await this.usersService.update(userData);
    }

    @Delete(':id')
    public async removeByid(@Param('id') userIdParam: string) {
        this.logger.log(`Remove user with ID "${userIdParam}"`);
        await this.usersService.removeById(userIdParam);
    }
}
