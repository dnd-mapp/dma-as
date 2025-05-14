import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { ScopeNoRoles } from './scope.models';

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
}

export class CreateRoleData extends OmitType(Role, ['id'] as const) {}

export class RoleNoScopes extends OmitType(Role, ['scopes'] as const) {}
