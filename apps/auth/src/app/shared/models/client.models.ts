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
    public id: string;

    @IsNotEmpty()
    @IsString()
    public audience: string;

    @IsArray()
    @ValidateNested()
    public redirectURLs: RedirectURL[];

    public isAllowedToRedirectTo(url: string) {
        return this.redirectURLs.some(({ url: redirectURL }) => redirectURL === url);
    }
}

export class CreateClientData extends PickType(Client, ['audience', 'redirectURLs'] as const) {}
