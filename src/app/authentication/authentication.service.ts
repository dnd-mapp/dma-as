import { BadRequestException, Injectable } from '@nestjs/common';
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
    User,
} from '../shared';
import { UsersService } from '../users';
import { hashPassword, valueToBase64, valueToSHA256 } from '../utils';
import { AuthorizationRepository } from './authorization.repository';
import { TokensService } from './tokens.service';

@Injectable()
export class AuthenticationService {
    constructor(
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

    public async requestToken(data: TokenRequestData) {
        // TODO: Expand to accept and validate a refresh token to generate new tokens
        const { authorizationCode, codeChallenge, createdAt, redirectUrl, userId } =
            await this.authorizationRepository.getAuthorizationByAuthorizationCode(data.authorizationCode);

        if (!this.validateTimespan(Date.now(), createdAt)) {
            await this.authorizationRepository.remove(authorizationCode);
            this.logger.warn('Request for tokens failed - Reason: Authorization Code has expired');
            throw new BadRequestException('Authorization request took too long');
        }
        if (!this.validateAuthorizationCode(data.authorizationCode, authorizationCode)) {
            this.logger.warn('Request for tokens failed - Reason: Invalid Authorization Code');
            throw new BadRequestException('Invalid authorization code');
        }
        if (!(await this.validateCodeChallenge(data.codeVerifier, codeChallenge))) {
            this.logger.warn('Request for tokens failed - Reason: Invalid Code Verifier');
            throw new BadRequestException('Invalid Code Verifier');
        }
        // TODO: Make this more dynamic/configurable
        const audience = this.resolveAudienceFromRedirectUrl(redirectUrl);

        await this.authorizationRepository.remove(authorizationCode);

        this.logger.log(`Request for tokens succeeded. Creating tokens for User with ID "${userId}"`);

        return await this.tokensService.generateTokens(audience, userId);
    }

    public async changePassword(data: ChangePasswordData, user: User) {
        if (!(await this.comparePassword(data.oldPassword, user.password))) {
            this.logger.warn(`Change password failed for User with ID "${user.id}" - Reason: Incorrect old password`);
            throw new BadRequestException('Old password is incorrect');
        }
        user.password = await hashPassword(data.newPassword);
        await this.usersService.updatePassword(user);

        // TODO: Discard tokens and request authentication

        this.logger.log(`Change password successfully for User with ID "${user.id}"`);
    }

    private async comparePassword(password: string, hash: string) {
        if (!hash) return false;
        return await compare(password, hash);
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

    private async validateCodeChallenge(codeVerifier: string, storedCodeChallenge: string) {
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
}
