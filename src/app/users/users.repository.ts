import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database';
import { CreateUserData, UpdateUserData, User } from '../shared';

const selectedUserAttributes = {
    select: {
        id: true,
        username: true,
        password: true,
        roles: {
            select: {
                role: {
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
                },
            },
        },
    },
};

@Injectable()
export class UsersRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public findAll = async () =>
        plainToInstance(
            User,
            await this.databaseService.user.findMany({
                ...selectedUserAttributes,
            })
        );

    public findOneById = async (userId: string) =>
        plainToInstance(
            User,
            await this.databaseService.user.findFirst({ ...selectedUserAttributes, where: { id: userId } })
        );

    public findOneByUsername = async (username: string) =>
        plainToInstance(
            User,
            await this.databaseService.user.findFirst({ ...selectedUserAttributes, where: { username: username } })
        );

    public async update(data: UpdateUserData) {
        const currentRoles = (await this.findOneById(data.id)).roles;

        return plainToInstance(
            User,
            await this.databaseService.user.update({
                ...selectedUserAttributes,
                where: { id: data.id },
                data: {
                    id: data.id,
                    username: data.username,
                    roles: {
                        deleteMany: [...currentRoles]
                            .filter((oldRole) => ![...data.roles].some((newRole) => oldRole.id === newRole.id))
                            .map((removedRole) => ({
                                roleId: removedRole.id,
                                userId: data.id,
                            })),
                        createMany: {
                            data: [...data.roles]
                                .filter((newRole) => ![...currentRoles].some((oldRole) => newRole.id === oldRole.id))
                                .map((addedRole) => ({
                                    roleId: addedRole.id,
                                    userId: data.id,
                                })),
                        },
                    },
                },
            })
        );
    }

    public updatePassword = async (data: User) =>
        plainToInstance(
            User,
            await this.databaseService.user.update({
                ...selectedUserAttributes,
                where: { id: data.id },
                data: { password: data.password },
            })
        );

    public create = async (data: CreateUserData) =>
        plainToInstance(
            User,
            await this.databaseService.user.create({
                ...selectedUserAttributes,
                data: {
                    username: data.username,
                    password: data.password,
                    roles: {
                        createMany: {
                            data: [...data.roles].map(({ id }) => ({ roleId: id })),
                        },
                    },
                },
            })
        );

    public async removeById(userId: string) {
        await this.databaseService.user.delete({ where: { id: userId } });
    }
}
