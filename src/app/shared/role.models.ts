import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { ScopeNoRoles } from './scope.models';

export class Role {
    @IsString()
    @IsNotEmpty()
    public id: string;

    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    public name: string;

    @ValidateNested()
    @Type(() => ScopeNoRoles)
    public scopes: Set<ScopeNoRoles>;
}

export class CreateRoleData extends OmitType(Role, ['id'] as const) {}

export class RoleNoScopes extends OmitType(Role, ['scopes'] as const) {}
