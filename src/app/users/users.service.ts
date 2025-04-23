import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserData, User } from './models';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    public async getAll() {
        return await this.usersRepository.findAll();
    }

    public async getById(userId: string) {
        return await this.usersRepository.findOneById(userId);
    }

    public async update(user: User) {
        const { id, username } = user;

        await this.validateUserExists(id, `Can't update User. User with ID "${id}" does not exist.`);
        await this.validateUsername(username, `Can't update User. Username "${username}" cannot be used.`, id);
        return await this.usersRepository.update(user);
    }

    public async create(userData: CreateUserData) {
        await this.validateUsername(
            userData.username,
            `Can't create User. Username "${userData.username}" cannot be used.`
        );
        return await this.usersRepository.create(userData);
    }

    public async removeById(userId: string) {
        await this.validateUserExists(userId, `Can't remove User. User with ID "${userId}" does not exist.`);
        await this.usersRepository.removeById(userId);
    }

    private async getByUsername(username: string) {
        return await this.usersRepository.findOneByUsername(username);
    }

    private async validateUserExists(userId: string, errorMessage: string) {
        if (await this.getById(userId)) return;
        throw new NotFoundException(errorMessage);
    }

    private async validateUsername(username: string, errorMessage: string, userId?: string) {
        const queryResult = await this.getByUsername(username);

        if (((userId && queryResult) || queryResult) && queryResult.id !== userId) {
            throw new BadRequestException(errorMessage);
        }
    }
}
