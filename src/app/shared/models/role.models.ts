import { OmitType, PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { ScopeNoRoles, scopesToScope } from './scope.models';

export const Roles = {
    USER: 'User',
    ADMIN: 'Admin',
    DUNGEON_MASTER: 'Dungeon Master',
} as const;

export type RoleName = (typeof Roles)[keyof typeof Roles];

export class Role {
    @IsString()
    @IsNotEmpty()
    public id: string;

    @IsString()
    @IsEnum(Roles)
    @MinLength(3)
    @IsNotEmpty()
    public name: RoleName;

    @ValidateNested()
    @Type(() => ScopeNoRoles)
    public scopes: Set<ScopeNoRoles>;

    public getAllRoleScopes() {
        return scopesToScope([...this.scopes].map((scope) => scope.name));
    }
}

export class CreateRoleData extends PickType(Role, ['name'] as const) {}

export class RoleNoScopes extends OmitType(Role, ['scopes'] as const) {}

export function transformAllRoleScopes<T = unknown>(data: T[]) {
    return data.map((role) => transformRoleScopes(role));
}

export function transformRoleScopes<T = unknown>(data: T) {
    if (data === null || typeof data !== 'object' || !('scopes' in data) || !Array.isArray(data.scopes)) return data;
    data.scopes = data.scopes.map(({ scope }) => scope);
    return data;
}
