import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database';
import { CreateRoleData, Role } from '../shared';

@Injectable()
export class RolesRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public findAll = async () => plainToInstance(Role, await this.databaseService.role.findMany());

    public findOneById = async (roleId: string) =>
        plainToInstance(Role, await this.databaseService.role.findUnique({ where: { id: roleId } }));

    public findOneByName = async (roleName: string) =>
        plainToInstance(Role, await this.databaseService.role.findFirst({ where: { name: roleName } }));

    public create = async (data: CreateRoleData) =>
        plainToInstance(Role, await this.databaseService.role.create({ data: data }));

    public update = async (data: Role) =>
        plainToInstance(Role, await this.databaseService.role.update({ where: { id: data.id }, data: data }));

    public async removeById(roleId: string) {
        await this.databaseService.role.delete({ where: { id: roleId } });
    }
}
