import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database';
import { Client, CreateClientData } from '../shared';

const selectedClientAttributes = {
    select: {
        id: true,
        audience: true,
        redirectURLs: {
            select: {
                url: true,
            },
        },
    },
};

@Injectable()
export class ClientsRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public findAll = async () =>
        plainToInstance(
            Client,
            await this.databaseService.client.findMany({
                ...selectedClientAttributes,
            })
        );

    public create = async (data: CreateClientData) =>
        plainToInstance(
            Client,
            await this.databaseService.client.create({
                ...selectedClientAttributes,
                data: {
                    audience: data.audience,
                    redirectURLs: {
                        createMany: {
                            data: data.redirectURLs.map(({ url }) => ({ url: url })),
                        },
                    },
                },
            })
        );

    public findById = async (clientId: string) =>
        plainToInstance(
            Client,
            await this.databaseService.client.findFirst({
                ...selectedClientAttributes,
                where: { id: clientId },
            })
        );

    public findOneByRedirectURL = async (redirectURL: string) =>
        plainToInstance(
            Client,
            await this.databaseService.client.findFirst({
                ...selectedClientAttributes,
                where: { redirectURLs: { some: { url: redirectURL } } },
            })
        );

    public findByAudience = async (audience: string) =>
        plainToInstance(
            Client,
            await this.databaseService.client.findFirst({
                ...selectedClientAttributes,
                where: { audience: audience },
            })
        );

    public async update(data: Client) {
        const redirectUrls = (
            await this.databaseService.redirectURL.findMany({ where: { clientId: data.id }, select: { url: true } })
        ).map(({ url }) => url);

        plainToInstance(
            Client,
            await this.databaseService.client.update({
                ...selectedClientAttributes,
                where: { id: data.id },
                data: {
                    audience: data.audience,
                    redirectURLs: {
                        deleteMany: {
                            url: { notIn: data.redirectURLs.map(({ url }) => url) },
                        },
                        createMany: {
                            data: data.redirectURLs
                                .filter((rUrl) => !redirectUrls.includes(rUrl.url))
                                .map(({ url }) => ({ url: url })),
                        },
                    },
                },
            })
        );
    }

    public async removeById(clientId: string) {
        await this.databaseService.redirectURL.deleteMany({ where: { clientId: clientId } });
        await this.databaseService.client.delete({ where: { id: clientId } });
    }
}
