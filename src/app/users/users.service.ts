import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DmaLogger } from '../logging';
import { CreateUserData, UpdateUserData } from './models';
import { hashPassword } from '../utils';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly logger: DmaLogger
    ) {
        this.logger.setContext('UsersService');
    }

    public async getAll() {
        return await this.usersRepository.findAll();
    }

    public async getById(userId: string) {
        return await this.usersRepository.findOneById(userId);
    }

    public async getByUsername(username: string) {
        return await this.usersRepository.findOneByUsername(username);
    }

    public async update(user: UpdateUserData) {
        try {
            const { id, username } = user;

            await this.validateUserExists(id, `Can't update User. User with ID "${id}" does not exist.`);
            await this.validateUsername(username, `Can't update User. Username "${username}" cannot be used.`, id);

            return await this.usersRepository.update(user);
        } catch (error) {
            if (error instanceof NotFoundException && error.message.includes('does not exist')) {
                this.logger.warn(`Failed to update User account with ID "${user.id}" - Reason: not found`);
            }
            if (error instanceof BadRequestException && error.message.includes('cannot be used')) {
                this.logger.warn(
                    `Failed to update User account with ID "${user.id}" - Reason: duplicate username "${user.username}"`
                );
            }
            throw error;
        }
    }

    public async create(userData: CreateUserData) {
        try {
            await this.validateUsername(
                userData.username,
                `Can't create User. Username "${userData.username}" cannot be used.`
            );
            userData.password = await hashPassword(userData.password);

            return await this.usersRepository.create(userData);
        } catch (error) {
            if (error instanceof BadRequestException && error.message.includes('cannot be used')) {
                this.logger.warn(
                    `Failed to create User account with username "${userData.username}" - Reason: Duplicate username`
                );
            }
            throw error;
        }
    }

    public async removeById(userId: string) {
        try {
            await this.validateUserExists(userId, `Can't remove User. User with ID "${userId}" does not exist.`);

            await this.usersRepository.removeById(userId);
        } catch (error) {
            if (error instanceof NotFoundException && error.message.includes('does not exist')) {
                this.logger.warn(`Failed to remove User with ID "${userId}" - Reason: Does not exist`);
            }
            throw error;
        }
    }

    private async validateUserExists(userId: string, errorMessage: string) {
        if (await this.getById(userId)) return;
        throw new NotFoundException(errorMessage);
    }

    private async validateUsername(username: string, errorMessage: string, userId?: string) {
        const queryResult = await this.getByUsername(username);

        if (((userId && queryResult) || queryResult) && queryResult.id !== userId) {
            // Should actually throw a NotFoundRequestException, but in order to prevent giving away too much information
            // about existing User accounts we throw a BadRequestException instead.
            throw new BadRequestException(errorMessage);
        }
    }
}
