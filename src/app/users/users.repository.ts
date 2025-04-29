import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database';
import { CreateUserData, UpdateUserData, User } from '../shared';

@Injectable()
export class UsersRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public findAll = async () => plainToInstance(User, await this.databaseService.users.findMany());

    public findOneById = async (userId: string) =>
        plainToInstance(User, await this.databaseService.users.findFirst({ where: { id: userId } }));

    public findOneByUsername = async (username: string) =>
        plainToInstance(User, await this.databaseService.users.findFirst({ where: { username: username } }));

    public update = async (data: UpdateUserData) =>
        plainToInstance(User, await this.databaseService.users.update({ where: { id: data.id }, data: data }));

    public create = async (data: CreateUserData) =>
        plainToInstance(User, await this.databaseService.users.create({ data: data }));

    public async removeById(userId: string) {
        await this.databaseService.users.delete({ where: { id: userId } });
    }
}
