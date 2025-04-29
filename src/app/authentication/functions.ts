import { UnauthorizedException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { DmaLogger } from '../logging';
import { COOKIE_NAME_ACCESS_TOKEN, DecodedToken } from '../shared';
import { TokensService } from './tokens.service';

export async function validateCookie(request: FastifyRequest, moduleRef: ModuleRef, logger: DmaLogger) {
    const jwtService = moduleRef.get(JwtService, { strict: false });
    const tokensService = moduleRef.get(TokensService, { strict: false });

    const accessTokenCookie = request.cookies[COOKIE_NAME_ACCESS_TOKEN];

    if (!accessTokenCookie) {
        logger.warn('Access token not accepted - Reason: Missing access token');
        throw new UnauthorizedException('Unauthorized');
    }
    const unsignedAccessTokenCookie = request.unsignCookie(accessTokenCookie);

    if (!unsignedAccessTokenCookie.valid) {
        logger.warn('Access token not accepted - Reason: Something went wrong while unsinging the access token cookie');
        throw new UnauthorizedException('Unauthorized');
    }
    let decodedToken: DecodedToken = null;

    try {
        decodedToken = await jwtService.verifyAsync<DecodedToken>(unsignedAccessTokenCookie.value);
    } catch (error) {
        logger.warn(`Access token not accepted - Reason: ${(error as Error).message}`);
        throw new UnauthorizedException('Unauthorized');
    }

    if (decodedToken.header.alg !== 'RS256') {
        logger.warn('Access token not accepted - Reason: Invalid token algorithm');
        throw new UnauthorizedException('Unauthorized');
    }
    if (decodedToken.payload.iss !== 'dnd-mapp/authentication-server') {
        logger.warn(`Access token not accepted - Reason: "${decodedToken.payload.iss}" is not a valid token issuer`);
        throw new UnauthorizedException('Unauthorized');
    }
    if (Date.now() / 1000 < decodedToken.payload.exp) {
        logger.warn('Access token not accepted - Reason: Access token has expired');
        throw new UnauthorizedException('Unauthorized');
    }
    const storedToken = await tokensService.getById(decodedToken.payload.jti);

    if (!storedToken) {
        logger.warn(`Access token not accepted - Reason: Token with ID "${decodedToken.payload.jti}" does not exist`);
        throw new UnauthorizedException('Unauthorized');
    }
    if (storedToken.rvk) {
        logger.warn(`Access token not accepted - Reason: Token with ID "${decodedToken.payload.jti}" is revoked`);
        // TODO: Remove all tokens that are related to this token.
        throw new UnauthorizedException('Unauthorized');
    }
    logger.log('Access token accepted');
    return storedToken.user;
}
