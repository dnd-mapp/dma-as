import { Type } from 'class-transformer';
import { User } from './user.models';

/** Expiration time of the access token in ms, which is currently set at fifteen minutes. */
export const ACCESS_TOKEN_EXPIRATION_TIME = 900_000 as const;

/** Expiration time of the refresh token in ms, which is currently set at seven days. */
export const REFRESH_TOKEN_EXPIRATION_TIME = 604_800_000 as const;

/** The time in ms after which the refresh token can be used, which is currently set to 13 minutes. */
export const REFRESH_TOKEN_NBF = 780_000 as const;

export const TokenTypes = {
    ACCESS: 'ACCESS',
    REFRESH: 'REFRESH',
} as const;

export type TokenType = (typeof TokenTypes)[keyof typeof TokenTypes];

export class TokenMetadata {
    jti: string;
    tpe: TokenType;
    pti?: string;
    sub: string;
    aud: string;
    iss: string;
    rvk: boolean;
    iat: Date;
    exp: Date;
    nbf?: Date;

    @Type(() => User)
    user: User;
}

export interface DecodedToken {
    header: {
        alg: string;
        type: string;
    };
    payload: {
        jti: string;
        pti?: string;
        sub: string;
        iss: string;
        aud: string;
        iat: number;
        nbf?: number;
        exp: number;
    };
    signature: string;
}
