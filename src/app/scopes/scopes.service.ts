import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateScopeData, Scope } from '../shared';
import { ScopesRepository } from './scopes.repository';

@Injectable()
export class ScopesService {
    constructor(private readonly scopesRepository: ScopesRepository) {}

    public async getAll() {
        return await this.scopesRepository.findAll();
    }

    public async getById(scopeId: string) {
        return await this.scopesRepository.findOneById(scopeId);
    }

    public async create(data: CreateScopeData) {
        await this.validateNameUnique(data.name, `Can't create Scope - Reason: Scope "${data.name}" already exists`);

        return await this.scopesRepository.create(data);
    }

    public async update(data: Scope) {
        await this.validateNameUnique(
            data.name,
            `Can't update Scope - Reason: Scope "${data.name}" already exists`,
            data.id
        );

        return await this.scopesRepository.update(data);
    }

    public async removeById(scopeId: string) {
        if (!(await this.getById(scopeId))) {
            throw new NotFoundException(`Can't remove Scope - Reason: Scope with ID "${scopeId}" was not found`);
        }
        await this.scopesRepository.removeById(scopeId);
    }

    private async getByName(scopeName: string) {
        return await this.scopesRepository.findOneByName(scopeName);
    }

    private async validateNameUnique(scopeName: string, message: string, scopeId?: string) {
        const query = await this.getByName(scopeName);

        if (query && (!scopeId || scopeId !== query.id)) throw new BadRequestException(message);
    }
}
