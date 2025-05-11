import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database';
import { CreateScopeData, Scope } from '../shared';

@Injectable()
export class ScopesRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public findAll = async () => plainToInstance(Scope, await this.databaseService.scope.findMany());

    public findOneById = async (scopeId: string) =>
        plainToInstance(Scope, await this.databaseService.scope.findUnique({ where: { id: scopeId } }));

    public findOneByName = async (scopeName: string) =>
        plainToInstance(Scope, await this.databaseService.scope.findFirst({ where: { name: scopeName } }));

    public create = async (data: CreateScopeData) =>
        plainToInstance(Scope, await this.databaseService.scope.create({ data: data }));

    public update = async (data: Scope) =>
        plainToInstance(Scope, await this.databaseService.scope.update({ where: { id: data.id }, data: data }));

    public async removeById(scopeId: string) {
        await this.databaseService.scope.delete({ where: { id: scopeId } });
    }
}
