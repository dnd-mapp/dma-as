import { PickType } from '@nestjs/mapped-types';
import { Exclude, Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { AccountStatus, AccountStatuses } from './account-status.models';
import { Role, RoleName, transformAllRoleScopes } from './role.models';
import { ScopeName } from './scope.models';

export class User {
    @IsString()
    @IsNotEmpty()
    public id: string;

    @IsString()
    @IsNotEmpty()
    public username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(12)
    @Exclude({ toPlainOnly: true })
    public password: string;

    @IsEnum(AccountStatuses)
    @IsString()
    public status: AccountStatus;

    @ValidateNested()
    @Type(() => Role)
    public roles: Set<Role>;

    @IsDate()
    @IsOptional()
    public passwordExpiry?: Date;

    @IsDate()
    @IsOptional()
    public lastLogin?: Date;

    @IsDate()
    @IsOptional()
    public lockedUntil?: Date;

    public getAllRoleScopes() {
        return [...this.roles].map((role) => role.getAllRoleScopes()).join(' ');
    }

    /**
     * Will check if a User has a Role with a particular name and also checks if all Scopes
     * of that Role the found Role are present in the provided Scopes.
     *
     * @param {RoleName} roleName - The name of the Role to be expected that a User has.
     * @param {ScopeName[]} [scopes] - The Scopes that are available within which all Scopes
     * of the found Role (if any) should be present.
     */
    public hasRole(roleName: RoleName, scopes?: ScopeName[]) {
        return [...this.roles].some((role) => roleName === role.name && (!scopes || role.hasAllScopes(scopes)));
    }
}

export class CreateUserData extends PickType(User, [
    'username',
    'password',
    'status',
    'roles',
    'passwordExpiry',
    'lastLogin',
    'lockedUntil',
] as const) {}

export class UpdateUserData extends PickType(User, [
    'id',
    'username',
    'password',
    'status',
    'roles',
    'passwordExpiry',
    'lastLogin',
    'lockedUntil',
] as const) {}

export function transformAllUserRoles<T = unknown>(data: T[]) {
    return data.map((user) => transformUserRoles(user));
}

export function transformUserRoles<T = unknown>(data: T) {
    if (data === null || typeof data !== 'object' || !('roles' in data) || !Array.isArray(data.roles)) return data;
    data.roles = transformAllRoleScopes(data.roles.map(({ role }) => role));

    return data;
}
