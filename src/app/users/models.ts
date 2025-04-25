import { OmitType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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
}

export class CreateUserData extends OmitType(User, ['id'] as const) {}

export class UpdateUserData extends OmitType(User, ['password'] as const) {}

export class UpdateUserPasswordData extends OmitType(User, ['username'] as const) {}
