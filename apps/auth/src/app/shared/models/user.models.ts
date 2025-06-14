import { PickType } from '@nestjs/mapped-types';
import { Exclude, Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';
import type { AccountStatus } from './account-status.models';
import { AccountStatuses } from './account-status.models';
import { Role, RoleName, transformAllRoleScopes } from './role.models';
import { ScopeName } from './scope.models';

export const MAX_LOGIN_ATTEMPTS = 3;

/**
 * Timeout in ms. for when a User has attempted to log in too many times and failed.
 * Currently set to 10 minutes.
 */
export const LOGIN_LOCK_TIMEOUT = 600_000;

/**
 * Expiration time in ms. for verifying an email address when a User creates a new account.
 * Currently set to 10 minutes.
 */
export const EMAIL_VERIFICATION_EXPIRY = 600_000;

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
    @Exclude({ toPlainOnly: true })
    public passwordExpiry?: Date;

    @IsEmail({ allow_display_name: false, require_display_name: false, require_tld: true, allow_ip_domain: false })
    @IsNotEmpty()
    @IsString()
    @Exclude({ toPlainOnly: true })
    public email: string;

    @IsBoolean()
    public emailVerified: boolean;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    @Exclude({ toPlainOnly: true })
    public emailVerificationCode?: string;

    @IsDate()
    @IsOptional()
    @Exclude({ toPlainOnly: true })
    public emailVerificationCodeExpiry?: Date;

    @Max(MAX_LOGIN_ATTEMPTS)
    @Min(0)
    @IsInt()
    @Exclude({ toPlainOnly: true })
    public loginAttempts: number;

    @IsDate()
    @IsOptional()
    @Exclude({ toPlainOnly: true })
    public lastLogin?: Date;

    @IsEnum(AccountStatuses)
    @IsString()
    public status: AccountStatus;

    @IsDate()
    @IsOptional()
    @Exclude({ toPlainOnly: true })
    public lockedUntil?: Date;

    @ValidateNested()
    @Type(() => Role)
    public roles: Set<Role>;

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
    'email',
    'emailVerified',
    'emailVerificationCode',
    'emailVerificationCodeExpiry',
    'password',
    'passwordExpiry',
    'roles',
    'status',
] as const) {
    @IsUrl({ protocols: ['https'], require_protocol: true })
    @IsNotEmpty()
    @IsString()
    public redirectUrl?: string;
}

export class UpdateUserData extends PickType(User, [
    'id',
    'username',
    'email',
    'emailVerified',
    'emailVerificationCode',
    'emailVerificationCodeExpiry',
    'passwordExpiry',
    'loginAttempts',
    'lastLogin',
    'status',
    'lockedUntil',
    'roles',
] as const) {}

export function transformAllUserRoles<T = unknown>(data: T[]) {
    return data.map((user) => transformUserRoles(user));
}

export function transformUserRoles<T = unknown>(data: T) {
    if (data === null || typeof data !== 'object' || !('roles' in data) || !Array.isArray(data.roles)) return data;
    data.roles = transformAllRoleScopes(data.roles.map(({ role }) => role));

    return data;
}
