import {
    BadRequestException,
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    UseInterceptors,
} from '@nestjs/common';
import { DmaLogger } from '../logging';
import { CreateUserData, UpdateUserData } from './models';
import { UsersService } from './users.service';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
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
        this.logger.log('Creating a new user');
        return await this.usersService.create(userData);
    }

    @Get(':id')
    public async getById(@Param('id') userIdParam: string) {
        this.logger.log(`Getting user with ID "${userIdParam}"`);
        const query = await this.usersService.getById(userIdParam);

        if (!query) throw new NotFoundException(`User with ID "${userIdParam}" was not found`);
        return query;
    }

    @Put(':id')
    public async update(@Param('id') userIdParam: string, @Body() userData: UpdateUserData) {
        this.logger.log(`Update user with ID "${userIdParam}"`);

        if (userIdParam !== userData.id) {
            throw new BadRequestException(
                `The ID in the request body "${userData.id}" does not match the ID in the URL path "${userIdParam}"`
            );
        }
        return await this.usersService.update(userData);
    }

    @Delete(':id')
    public async removeById(@Param('id') userIdParam: string) {
        this.logger.log(`Remove user with ID "${userIdParam}"`);
        await this.usersService.removeById(userIdParam);
    }
}
