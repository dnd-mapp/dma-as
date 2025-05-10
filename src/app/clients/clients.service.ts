import { BadRequestException, Injectable } from '@nestjs/common';
import { KeysService } from '../keys';
import { Client, CreateClientData } from '../shared';
import { ClientsRepository } from './clients.repository';

@Injectable()
export class ClientsService {
    constructor(
        private readonly clientsRepository: ClientsRepository,
        private readonly keysService: KeysService
    ) {}

    public async getAll() {
        return await this.clientsRepository.findAll();
    }

    public async create(data: CreateClientData) {
        await this.validateUniqueAudience(data.audience, `Audience "${data.audience}" is already in use.`);

        const client = await this.clientsRepository.create(data);
        await this.keysService.generateKeyPair(client.id);

        return client;
    }

    public async getById(clientId: string) {
        return await this.clientsRepository.findById(clientId);
    }

    public async getByRedirectURL(redirectURL: string) {
        return await this.clientsRepository.findOneByRedirectURL(redirectURL);
    }

    public async getByAudience(audience: string) {
        return await this.clientsRepository.findByAudience(audience);
    }

    public async update(data: Client) {
        await this.validateUniqueAudience(data.audience, `Audience "${data.audience}" is already in use.`, data.id);

        return await this.clientsRepository.update(data);
    }

    public async removeById(clientId: string) {
        await this.clientsRepository.removeById(clientId);
    }

    private async validateUniqueAudience(audience: string, message: string, clientId?: string) {
        const client = await this.getByAudience(audience);

        if (((clientId && client) || client) && client.id !== clientId) {
            throw new BadRequestException(message);
        }
    }
}
