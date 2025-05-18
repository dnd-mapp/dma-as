import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength, ValidateIf } from 'class-validator';

/** Maximum lifetime of an authorization code in ms, which currently is set to 5 minutes. */
export const MAX_AUTHORIZATION_CODE_LIFETIME = 300_000 as const;

export const COOKIE_NAME_ACCESS_TOKEN = '__Host-Access-Token';

export const CLIENT_ID_HEADER = 'Dma-Client-Id';

export const COOKIE_NAME_REFRESH_TOKEN = '__Host-Refresh-Token';

export class SignUpData {
    @IsString()
    @IsNotEmpty()
    public username: string;

    @IsString()
    @IsNotEmpty()
    public password: string;
}

export class MessageWithState {
    @IsString()
    @IsNotEmpty()
    public state: string;
}

export class AuthorizeRequest extends MessageWithState {
    @IsString()
    @IsNotEmpty()
    public codeChallenge: string;

    @IsUrl({ protocols: ['https'], require_protocol: true })
    @IsString()
    @IsNotEmpty()
    public redirectUrl: string;
}

export class Authorization {
    @IsString()
    @IsNotEmpty()
    public authorizationCode: string;

    @IsString()
    @IsNotEmpty()
    public codeChallenge: string;

    @IsString()
    @IsNotEmpty()
    public state: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    public userId?: string;

    @IsUrl({ protocols: ['https'], require_protocol: true })
    @IsString()
    @IsNotEmpty()
    public redirectUrl: string;

    @IsDate()
    public createdAt: Date;
}

export class LoginData extends MessageWithState {
    @IsString()
    @IsNotEmpty()
    public username: string;

    @IsString()
    @IsNotEmpty()
    public password: string;
}

export class TokenRequestData {
    @IsString()
    @IsNotEmpty()
    @ValidateIf((object) => !object.useRefreshToken)
    public authorizationCode?: string;

    @IsString()
    @IsNotEmpty()
    @ValidateIf((object) => !object.useRefreshToken)
    public codeVerifier?: string;

    @IsBoolean()
    @ValidateIf((object) => object.useRefreshToken)
    public useRefreshToken?: boolean;
}

export class ChangePasswordData {
    @IsString()
    @IsNotEmpty()
    public oldPassword: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(12)
    public newPassword: string;

    @IsDate()
    @IsOptional()
    public passwordExpiry?: Date;
}
