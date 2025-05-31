import { BadRequestException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Cron } from '@nestjs/schedule';
import { ClientsService } from '../clients';
import { DmaLogger } from '../logging';
import { RolesService } from '../roles';
import {
    AuthorizeRequest,
    ChangePasswordData,
    decodeToken,
    LOGIN_LOCK_TIMEOUT,
    LoginData,
    MAX_AUTHORIZATION_CODE_LIFETIME,
    MAX_LOGIN_ATTEMPTS,
    Roles,
    SignUpData,
    TokenRequestData,
    TokenTypes,
    TooManyException,
    User,
} from '../shared';
import { AccountStatuses } from '../shared/models/account-status.models';
import { TokensService } from '../tokens';
import { UsersService } from '../users';
import { compareHashToValue, createHash, valueToBase64, valueToSHA256 } from '../utils';
import { AuthorizationRepository } from './authorization.repository';

function failedAuthenticationMessage(username: string, reason: string) {
    return `Authentication failed for username "${username}" - Reason: ${reason}`;
}

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly logger: DmaLogger,
        private readonly authorizationRepository: AuthorizationRepository,
        private readonly usersService: UsersService,
        private readonly tokensService: TokensService,
        private readonly clientsService: ClientsService,
        private readonly rolesService: RolesService
    ) {
        this.logger.setContext('AuthenticationService');
    }

    public async signUp(data: SignUpData) {
        const userRole = await this.rolesService.getByName(Roles.USER);
        const client = await this.clientsService.getById(data.clientId);

        if (!client || !client.isAllowedToRedirectTo(data.redirectUrl)) {
            const message = `Could not complete sign up - Reason: Invalid redirect URL "${data.redirectUrl}" for Client with ID "${data.clientId}"`;
            this.logger.warn(message);
            throw new BadRequestException(message);
        }
        const createdUser = await this.usersService.create(
            {
                ...data,
                emailVerified: false,
                roles: new Set([userRole]),
                status: AccountStatuses.PENDING_VERIFICATION,
            },
            data.redirectUrl
        );

        this.logger.log(`User account created successfully for username "${createdUser.username}"`);

        return createdUser;
    }

    public async authorize(data: AuthorizeRequest) {
        await this.authorizationRepository.storeCodeChallenge(data);
    }

    public async login(data: LoginData) {
        try {
            const user = await this.checkAccountExists(data.username);

            await this.increaseLoginAttempts(user);
            await this.checkUserPassword(user, data.password);
            this.checkAccountStatus(user);

            this.logger.log(`Login successful for username "${user.username}"`);
            await this.usersService.update({ ...user, lastLogin: new Date() });

            return await this.updateAuthorization(data.state, user.id);
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

    public async verifyEmail(token: string, redirectUrl: string) {
        const [[code, username], error] = this.decodeVerifyEmailToken(token);

        if (error) throw error;
        const user = await this.usersService.getByUsername(username);

        try {
            if (
                !(await compareHashToValue(code, user.emailVerificationCode)) &&
                user?.emailVerificationCodeExpiry?.getTime() >= new Date().getTime()
            ) {
                throw new Error();
            }
            user.emailVerificationCodeExpiry = user.emailVerificationCode = null;
            user.emailVerified = true;
            user.status = AccountStatuses.ACTIVE;

            await this.usersService.update(user);
        } catch {
            await this.usersService.sendVerifyEmailAddressEmail(user, redirectUrl);
            throw new BadRequestException('Invalid Token');
        }
    }

    public async resendVerifyEmail(token: string, redirectUrl: string) {
        const [[_code, username], error] = this.decodeVerifyEmailToken(token);

        if (error) throw error;
        const user = await this.usersService.getByUsername(username);

        await this.usersService.sendVerifyEmailAddressEmail(user, redirectUrl);
    }

    public async changePassword(data: ChangePasswordData, user: User) {
        if (!(await this.comparePassword(data.oldPassword, user.password))) {
            this.logger.warn(`Change password failed for User with ID "${user.id}" - Reason: Incorrect old password`);
            throw new BadRequestException('Old password is incorrect');
        }
        user.password = await createHash(data.newPassword);

        if (user.passwordExpiry) {
            user.passwordExpiry = data.passwordExpiry ?? null;
        }
        await this.usersService.updatePassword(user);
        await this.tokensService.revokeAllFromUser(user.id);

        this.logger.log(`Change password successfully for User with ID "${user.id}"`);
    }

    // Runs every 5 minutes past the whole hour, e.g. 12:05, 13:05, 14:05, etc.
    @Cron('0 5 * * * *')
    protected async removeExpiredAuthorizationCodes() {
        await this.authorizationRepository.removeExpiredAuthorizationCodes();
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
            await this.authorizationRepository.removeByAuthorizationCode(storedAuthorizationCode);
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
        const client = await this.clientsService.getByRedirectURL(redirectUrl);

        if (!client) {
            this.logger.warn('Request for tokens failed - Reason: Invalid redirect URL');
            throw new BadRequestException('Invalid redirect URL');
        }
        await this.authorizationRepository.removeByAuthorizationCode(authorizationCode);

        this.logger.log(`Request for tokens succeeded. Creating tokens for User with ID "${userId}"`);

        return {
            tokens: await this.tokensService.generateTokens(client, userId),
            clientId: client.id,
        };
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

    private async generateTokensFromRefreshTokens(refreshToken: string) {
        const { jti, tpe, sub, aud } = await decodeToken(refreshToken, this.moduleRef, this.logger);
        const client = await this.clientsService.getByAudience(aud);

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
        return {
            tokens: await this.tokensService.generateTokens(client, sub, jti),
            clientId: client.id,
        };
    }

    private async checkAccountExists(username: string) {
        const user = await this.usersService.getByUsername(username);

        if (user) return user;
        this.logger.warn(failedAuthenticationMessage(username, 'User does not exist'));
        throw new Error();
    }

    private async increaseLoginAttempts(user: User) {
        if (user.loginAttempts === MAX_LOGIN_ATTEMPTS && user.status === AccountStatuses.LOCKED) {
            throw new TooManyException('Too many login attempts. Please try again later.');
        }
        user.loginAttempts++;
        await this.usersService.update(user);

        if (user.loginAttempts === MAX_LOGIN_ATTEMPTS) {
            user.lockedUntil = new Date(Date.now() + LOGIN_LOCK_TIMEOUT);
            user.status = AccountStatuses.LOCKED;
            await this.usersService.update(user);

            throw new TooManyException('Too many login attempts. Please try again later.');
        }
    }

    private async checkUserPassword(user: User, password: string) {
        if (await this.comparePassword(password, user.password)) return;
        this.logger.warn(failedAuthenticationMessage(user.username, 'Incorrect password'));
        throw new Error();
    }

    private async comparePassword(password: string, hash: string) {
        if (!hash) return false;
        return await compareHashToValue(password, hash);
    }

    private checkAccountStatus(user: User) {
        if (user.status == AccountStatuses.ACTIVE) return;
        switch (user.status) {
            case AccountStatuses.PENDING_VERIFICATION:
                this.logger.warn(failedAuthenticationMessage(user.username, 'Email address not yet verified'));
                break;

            case AccountStatuses.BANNED:
                this.logger.warn(failedAuthenticationMessage(user.username, 'Account is banned'));
                break;

            case AccountStatuses.SUSPENDED:
                this.logger.warn(
                    failedAuthenticationMessage(user.username, `Account is suspended till "${user.lockedUntil}"`)
                );
                break;

            case AccountStatuses.LOCKED:
                this.logger.warn(
                    failedAuthenticationMessage(user.username, `Account is locked till "${user.lockedUntil}"`)
                );
                break;
        }
        throw new Error();
    }

    private decodeVerifyEmailToken(token: string): [string[], HttpException] {
        try {
            const decodedToken = Buffer.from(token, 'base64url').toString('utf8');
            decodedToken.split(':');

            return [decodedToken.split(':'), null];
        } catch {
            return [null, new BadRequestException('Invalid Token')];
        }
    }
}
