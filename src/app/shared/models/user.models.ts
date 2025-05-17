import { PickType } from '@nestjs/mapped-types';
import { Exclude, Type } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Role, RoleName, transformAllRoleScopes } from './role.models';

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

    @IsDate()
    @IsOptional()
    public passwordExpiry?: Date;

    @ValidateNested()
    @IsArray()
    @Type(() => Role)
    public roles: Set<Role>;

    public getAllRoleScopes() {
        return [...this.roles].map((role) => role.getAllRoleScopes()).join(' ');
    }

    public hasRole(role: RoleName) {
        return [...this.roles].some(({ name }) => role === name);
    }
}

export class CreateUserData extends PickType(User, ['username', 'password', 'roles', 'passwordExpiry'] as const) {}

export class UpdateUserData extends PickType(User, ['id', 'username', 'roles', 'passwordExpiry'] as const) {}

export function transformAllUserRoles<T = unknown>(data: T[]) {
    return data.map((user) => transformUserRoles(user));
}

export function transformUserRoles<T = unknown>(data: T) {
    if (data === null || typeof data !== 'object' || !('roles' in data) || !Array.isArray(data.roles)) return data;
    data.roles = transformAllRoleScopes(data.roles.map(({ role }) => role));

    return data;
}
