import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { KeysService } from '../keys';
import { DmaLogger } from '../logging';
import { DecodedToken } from '../shared';
import { TokensService } from '../tokens';

export function retrieveSignedCookieValue(request: FastifyRequest, cookieName: string, logger: DmaLogger) {
    const cookie = request.cookies[cookieName];

    if (!cookie) {
        logger.warn('Token not accepted - Reason: Token is missing');
        throw new UnauthorizedException('Unauthorized');
    }
    const unsignedCookie = request.unsignCookie(cookie);

    if (!unsignedCookie.valid) {
        logger.warn('Token not accepted - Reason: Something went wrong while unsinging the cookie');
        throw new UnauthorizedException('Unauthorized');
    }
    return unsignedCookie.value;
}

function retrieveKidFromTokenHeader(token: string, logger: DmaLogger): string {
    try {
        const [tokenHeaderBase64] = token.split('.');
        const tokenHeader = JSON.parse(Buffer.from(tokenHeaderBase64, 'base64').toString('utf8'));

        return tokenHeader.kid;
    } catch (error) {
        logger.warn(`Token not accepted - Reason: ${(error as Error).message}`);
        throw new BadRequestException('Unauthorized');
    }
}

export async function decodeToken(token: string, moduleRef: ModuleRef, logger: DmaLogger) {
    const jwtService = moduleRef.get(JwtService, { strict: false });
    const tokensService = moduleRef.get(TokensService, { strict: false });
    const keysService = moduleRef.get(KeysService, { strict: false });

    let decodedToken: DecodedToken = null;

    const kid = retrieveKidFromTokenHeader(token, logger);
    const keys = keysService.getKeysByKid(kid);

    try {
        decodedToken = await jwtService.verifyAsync(token, { publicKey: keys.toPEM() });
    } catch (error) {
        logger.warn(`Token not accepted - Reason: ${(error as Error).message}`);
        throw new UnauthorizedException('Unauthorized');
    }

    if (decodedToken.header.alg !== 'RS256') {
        logger.warn('Token not accepted - Reason: Invalid token algorithm');
        throw new UnauthorizedException('Unauthorized');
    }
    if (decodedToken.payload.iss !== 'dnd-mapp/authentication-server') {
        logger.warn(`Token not accepted - Reason: "${decodedToken.payload.iss}" is not a valid token issuer`);
        throw new UnauthorizedException('Unauthorized');
    }
    if (Date.now() >= decodedToken.payload.exp * 1000) {
        logger.warn('Token not accepted - Reason: Token has expired');
        throw new UnauthorizedException('Unauthorized');
    }
    const storedToken = await tokensService.getById(decodedToken.payload.jti);

    if (!storedToken) {
        logger.warn(`Token not accepted - Reason: Token with ID "${decodedToken.payload.jti}" does not exist`);
        throw new UnauthorizedException('Unauthorized');
    }
    if (storedToken.rvk) {
        logger.warn(`Token not accepted - Reason: Token with ID "${decodedToken.payload.jti}" is revoked`);
        await tokensService.revokeTokenLinage(decodedToken.payload.jti);
        throw new UnauthorizedException('Unauthorized');
    }
    return storedToken;
}

interface ValidateCookieParams {
    request: FastifyRequest;
    cookieName: string;
    moduleRef: ModuleRef;
    logger: DmaLogger;
}

export async function validateCookie(params: ValidateCookieParams) {
    const { request, cookieName, moduleRef, logger } = params;

    const cookieValue = retrieveSignedCookieValue(request, cookieName, logger);
    const decodedToken = await decodeToken(cookieValue, moduleRef, logger);

    logger.log('Token accepted');
    return decodedToken;
}
