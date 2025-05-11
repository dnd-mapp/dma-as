import { OmitType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class Scope {
    @IsString()
    @IsNotEmpty()
    public id: string;

    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    public name: string;
}

export class CreateScopeData extends OmitType(Scope, ['id'] as const) {}
