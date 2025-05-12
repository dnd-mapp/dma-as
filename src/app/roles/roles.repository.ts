import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database';
import { CreateRoleData, Role } from '../shared';

const selectedRoleAttributes = {
    select: {
        id: true,
        name: true,
        scopes: {
            select: {
                scope: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        },
    },
} as const;

@Injectable()
export class RolesRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public findAll = async () =>
        plainToInstance(
            Role,
            this.transformAllRoleScopes(
                await this.databaseService.role.findMany({
                    ...selectedRoleAttributes,
                })
            )
        );

    public findOneById = async (roleId: string) =>
        plainToInstance(
            Role,
            this.transformRoleScopes(
                await this.databaseService.role.findUnique({ ...selectedRoleAttributes, where: { id: roleId } })
            )
        );

    public findOneByName = async (roleName: string) =>
        plainToInstance(
            Role,
            this.transformRoleScopes(
                await this.databaseService.role.findFirst({ ...selectedRoleAttributes, where: { name: roleName } })
            )
        );

    public create = async (data: CreateRoleData) =>
        plainToInstance(
            Role,
            this.transformRoleScopes(
                await this.databaseService.role.create({
                    ...selectedRoleAttributes,
                    data: {
                        name: data.name,
                    },
                })
            )
        );

    public update = async (data: Role) =>
        plainToInstance(
            Role,
            this.transformRoleScopes(
                await this.databaseService.role.update({
                    ...selectedRoleAttributes,
                    where: { id: data.id },
                    data: {
                        id: data.id,
                        name: data.name,
                    },
                })
            )
        );

    public async removeById(roleId: string) {
        await this.databaseService.role.delete({ where: { id: roleId } });
    }

    private transformAllRoleScopes<T = unknown>(data: T[]) {
        return data.map((role) => this.transformRoleScopes(role));
    }

    private transformRoleScopes<T = unknown>(data: T) {
        if (data === null || typeof data !== 'object' || !('scopes' in data) || !Array.isArray(data.scopes)) {
            return data;
        }
        data.scopes = data.scopes.map(({ scope }) => scope);
        return data;
    }
}
