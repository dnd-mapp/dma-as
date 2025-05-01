import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { compare } from 'bcryptjs';
import { DmaLogger } from '../logging';
import {
    AudienceByRedirectUrl,
    AuthorizeRequest,
    ChangePasswordData,
    LoginData,
    MAX_AUTHORIZATION_CODE_LIFETIME,
    SignUpData,
    TokenRequestData,
    TokenTypes,
    User,
} from '../shared';
import { UsersService } from '../users';
import { hashPassword, valueToBase64, valueToSHA256 } from '../utils';
import { AuthorizationRepository } from './authorization.repository';
import { decodeToken } from './functions';
import { TokensService } from './tokens.service';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly authorizationRepository: AuthorizationRepository,
        private readonly usersService: UsersService,
        private readonly tokensService: TokensService,
        private readonly logger: DmaLogger
    ) {
        this.logger.setContext('AuthenticationService');
    }

    public async signUp(signUpData: SignUpData) {
        const createdUser = await this.usersService.create(signUpData);
        this.logger.log(`User account created successfully for username "${createdUser.username}"`);

        return createdUser;
    }

    public async authorize(data: AuthorizeRequest) {
        await this.authorizationRepository.storeCodeChallenge(data);
    }

    public async login(data: LoginData) {
        try {
            const user = await this.usersService.getByUsername(data.username);

            if (!user) {
                this.logger.warn(`Authentication failed for username "${data.username}" - Reason: User does not exist`);
                throw new Error();
            }
            if (await this.comparePassword(data.password, user.password)) {
                this.logger.log(`Login successful for username "${user.username}"`);
                return await this.updateAuthorization(data.state, user.id);
            }
            this.logger.warn(`Authentication failed for username "${user.username}" - Reason: Incorrect password`);
            throw new Error();
        } catch (error) {
            console.error(error);
            throw new BadRequestException('Wrong username or password');
        }
    }

    public async requestToken(data: TokenRequestData, refreshToken: string) {
        const { authorizationCode, codeVerifier, useRefreshToken } = data;

        if (authorizationCode && codeVerifier) {
            return await this.generateTokensWithAuthorizationCode(authorizationCode, codeVerifier);
        } else if (useRefreshToken) {
            return await this.generateTokensFromRefreshTokens(refreshToken);
        }
        return null;
    }

    public async changePassword(data: ChangePasswordData, user: User) {
        if (!(await this.comparePassword(data.oldPassword, user.password))) {
            this.logger.warn(`Change password failed for User with ID "${user.id}" - Reason: Incorrect old password`);
            throw new BadRequestException('Old password is incorrect');
        }
        user.password = await hashPassword(data.newPassword);

        await this.usersService.updatePassword(user);
        await this.tokensService.removeAllFromUser(user.id);

        this.logger.log(`Change password successfully for User with ID "${user.id}"`);
    }

    private async comparePassword(password: string, hash: string) {
        if (!hash) return false;
        return await compare(password, hash);
    }

    private async generateTokensWithAuthorizationCode(authorizationCode: string, codeVerifier: string) {
        const {
            authorizationCode: storedAuthorizationCode,
            codeChallenge,
            createdAt,
            redirectUrl,
            userId,
        } = await this.authorizationRepository.getAuthorizationByAuthorizationCode(authorizationCode);

        if (!this.validateTimespan(Date.now(), createdAt)) {
            await this.authorizationRepository.remove(storedAuthorizationCode);
            this.logger.warn('Request for tokens failed - Reason: Authorization Code has expired');
            throw new BadRequestException('Authorization request took too long');
        }
        if (!this.validateAuthorizationCode(authorizationCode, storedAuthorizationCode)) {
            this.logger.warn('Request for tokens failed - Reason: Invalid Authorization Code');
            throw new BadRequestException('Invalid authorization code');
        }
        if (!this.validateCodeChallenge(codeVerifier, codeChallenge)) {
            this.logger.warn('Request for tokens failed - Reason: Invalid Code Verifier');
            throw new BadRequestException('Invalid Code Verifier');
        }
        // TODO: Make this more dynamic/configurable
        const audience = this.resolveAudienceFromRedirectUrl(redirectUrl);

        await this.authorizationRepository.remove(authorizationCode);

        this.logger.log(`Request for tokens succeeded. Creating tokens for User with ID "${userId}"`);

        return await this.tokensService.generateTokens(audience, userId);
    }

    private async updateAuthorization(state: string, userId: string) {
        const authorization = await this.authorizationRepository.getAuthorizationByState(state);
        authorization.userId = userId;

        return await this.authorizationRepository.update(authorization);
    }

    private validateTimespan(currentTime: number, createdAt: Date) {
        return currentTime - createdAt.getTime() < MAX_AUTHORIZATION_CODE_LIFETIME;
    }

    private validateAuthorizationCode(received: string, stored: string) {
        return received === stored;
    }

    private validateCodeChallenge(codeVerifier: string, storedCodeChallenge: string) {
        const codeChallenge = valueToBase64(valueToSHA256(codeVerifier));
        return codeChallenge === storedCodeChallenge;
    }

    private resolveAudienceFromRedirectUrl(redirectUrl: string) {
        for (const [audience, urls] of Object.entries(AudienceByRedirectUrl)) {
            if (!urls.includes(redirectUrl)) continue;
            return audience;
        }
        return null;
    }

    private async generateTokensFromRefreshTokens(refreshToken: string) {
        const { jti, tpe, sub, aud } = await decodeToken(refreshToken, this.moduleRef, this.logger);

        if (tpe !== TokenTypes.REFRESH) {
            this.logger.warn('Request for tokens failed - Reason: Invalid token type');
            throw new UnauthorizedException('Unauthorized.');
        }
        const activeTokens = await this.tokensService.getCurrentActiveTokenFromUser(sub);

        await Promise.all(
            activeTokens.map((token) => {
                if (token.tpe === TokenTypes.ACCESS) return this.tokensService.removeByJti(token.jti);
                token.rvk = true;
                return this.tokensService.update(token);
            })
        );
        return await this.tokensService.generateTokens(aud, sub, jti);
    }
}
