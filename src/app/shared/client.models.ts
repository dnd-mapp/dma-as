import { PickType } from '@nestjs/mapped-types';
import { IsArray, IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';

export class RedirectURL {
    @IsUrl()
    @IsNotEmpty()
    @IsString()
    url: string;
}

export class Client {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    audience: string;

    @IsArray()
    @ValidateNested()
    redirectURLs: RedirectURL[];
}

export class CreateClientData extends PickType(Client, ['audience', 'redirectURLs'] as const) {}
