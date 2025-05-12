import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { RoleNoScopes } from './role.models';

export class Scope {
    @IsString()
    @IsNotEmpty()
    public id: string;

    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    public name: string;

    @ValidateNested()
    @Type(() => RoleNoScopes)
    public roles: Set<RoleNoScopes>;
}

export class CreateScopeData extends OmitType(Scope, ['id'] as const) {}

export class ScopeNoRoles extends OmitType(Scope, ['roles'] as const) {}
