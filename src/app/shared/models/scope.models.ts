import { OmitType, PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { RoleNoScopes } from './role.models';

export const ScopeNames = {
    CHANGE_PASSWORD: 'change:password',

    CREATE_USERS: 'create:users',
    READ_USERS: 'read:users',
    UPDATE_USERS: 'update:users',
    DELETE_USERS: 'delete:users',

    CREATE_CLIENTS: 'create:clients',
    READ_CLIENTS: 'read:clients',
    UPDATE_CLIENTS: 'update:clients',
    DELETE_CLIENTS: 'delete:clients',
    ROTATE_KEYS: 'rotate-keys:clients',

    CREATE_SCOPES: 'create:scopes',
    READ_SCOPES: 'read:scopes',
    UPDATE_SCOPES: 'update:scopes',
    DELETE_SCOPES: 'delete:scopes',

    CREATE_ROLES: 'create:roles',
    READ_ROLES: 'read:roles',
    UPDATE_ROLES: 'update:roles',
    DELETE_ROLES: 'delete:roles',
} as const;

export type ScopeName = (typeof ScopeNames)[keyof typeof ScopeNames];

export function scopeToScopes(scope: string) {
    const scopes = scope.split(' ');
    return scopes
        .filter((scope) => !Object.values(ScopeNames).includes(scope as ScopeName))
        .map((scope) => scope as ScopeName);
}

export function scopesToScope(scopes: ScopeName[]) {
    return scopes.join(' ');
}

export class Scope {
    @IsString()
    @IsNotEmpty()
    public id: string;

    @IsString()
    @IsEnum(ScopeNames)
    @MinLength(3)
    @IsNotEmpty()
    public name: ScopeName;

    @ValidateNested()
    @Type(() => RoleNoScopes)
    public roles: Set<RoleNoScopes>;
}

export class CreateScopeData extends PickType(Scope, ['name', 'roles'] as const) {}

export class ScopeNoRoles extends OmitType(Scope, ['roles'] as const) {}
