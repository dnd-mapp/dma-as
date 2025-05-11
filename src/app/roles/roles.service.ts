import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleData, Role } from '../shared';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
    constructor(private readonly rolesRepository: RolesRepository) {}

    public async getAll() {
        return await this.rolesRepository.findAll();
    }

    public async getById(roleId: string) {
        return await this.rolesRepository.findOneById(roleId);
    }

    public async create(data: CreateRoleData) {
        await this.validateNameUnique(data.name, `Can't create Role - Reason: Role "${data.name}" already exists`);

        return await this.rolesRepository.create(data);
    }

    public async update(data: Role) {
        await this.validateNameUnique(data.name, `Can't update Role - Reason: Role "${data.name}" already exists`);

        return await this.rolesRepository.update(data);
    }

    public async removeById(roleId: string) {
        if (!(await this.getById(roleId))) {
            throw new NotFoundException(`Can't remove Role - Reason: Role with ID "${roleId}" was not found`);
        }
        await this.rolesRepository.removeById(roleId);
    }

    private async getByName(roleName: string) {
        return await this.rolesRepository.findOneByName(roleName);
    }

    private async validateNameUnique(roleName: string, message: string, roleId?: string) {
        const query = await this.getByName(roleName);

        if (query && (!roleId || roleId !== query.id)) throw new BadRequestException(message);
    }
}
