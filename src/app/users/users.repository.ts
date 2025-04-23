import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database';
import { CreateUserData, User } from './models';

@Injectable()
export class UsersRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public findAll: () => Promise<User[]> = async () => await this.databaseService.users.findMany();

    public findOneById = async (userId: string) =>
        (await this.databaseService.users.findFirst({ where: { id: userId } })) as User;

    public findOneByUsername = async (username: string) =>
        (await this.databaseService.users.findFirst({ where: { username: username } })) as User;

    public update = async (data: User) =>
        (await this.databaseService.users.update({ where: { id: data.id }, data: data })) as User;

    public create = async (data: CreateUserData) => (await this.databaseService.users.create({ data: data })) as User;

    public removeById = async (userId: string) => await this.databaseService.users.delete({ where: { id: userId } });
}
