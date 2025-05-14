import { OmitType } from '@nestjs/mapped-types';
import { Exclude, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { Role } from './role.models';

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

    @ValidateNested()
    @IsArray()
    @Type(() => Role)
    public roles: Set<Role>;
}

export class CreateUserData extends OmitType(User, ['id'] as const) {}

export class UpdateUserData extends OmitType(User, ['password'] as const) {}
