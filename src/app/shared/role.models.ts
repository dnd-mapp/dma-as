import { OmitType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class Role {
    @IsString()
    @IsNotEmpty()
    public id: string;

    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    public name: string;
}

export class CreateRoleData extends OmitType(Role, ['id'] as const) {}
