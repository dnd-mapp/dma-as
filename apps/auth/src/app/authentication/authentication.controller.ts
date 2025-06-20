import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { authenticationThrottlerOptions } from '../config';
import { DmaLogger } from '../logging';
import {
    AuthenticationGuard,
    AuthorizeRequest,
    ChangePasswordData,
    CLIENT_ID_HEADER,
    COOKIE_NAME_ACCESS_TOKEN,
    COOKIE_NAME_REFRESH_TOKEN,
    HasScope,
    LoginData,
    retrieveSignedCookieValue,
    ScopeGuard,
    ScopeNames,
    SignUpData,
    TokenRequestData,
    VerifyEmailData,
} from '../shared';
import { AuthenticationService } from './authentication.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly logger: DmaLogger
    ) {
        this.logger.setContext('AuthenticationController');
    }

    @Throttle(authenticationThrottlerOptions)
    @Post('/sign-up')
    public async signUp(
        @Body() signUpData: SignUpData,
        @Req() request: FastifyRequest,
        @Res({ passthrough: true }) response: FastifyReply
    ) {
        this.logger.log(`User registration initiated for username "${signUpData.username}"`);
        const responseData = await this.authenticationService.signUp({
            ...signUpData,
            clientId: request.headers[CLIENT_ID_HEADER] as string,
        });

        response.headers({
            Location: `${response.request.url.replace('/auth/sign-up', `/users/${responseData.id}`)}`,
        });

        return responseData;
    }

    @Throttle(authenticationThrottlerOptions)
    @Post('/authorize')
    public async authorize(@Body() data: AuthorizeRequest, @Res() response: FastifyReply) {
        this.logger.log('Authorize attempt initialized');
        await this.authenticationService.authorize(data);

        this.logger.log('Authorize data stored. Redirecting to Login Page');
        response.status(HttpStatus.FOUND).redirect(`https://localhost.auth.dndmapp.net/app/login?state=${data.state}`);
    }

    @Throttle(authenticationThrottlerOptions)
    @Post('/login')
    public async login(@Body() data: LoginData, @Res() response: FastifyReply) {
        this.logger.log(`Login attempt initiated for username "${data.username}"`);

        const { redirectUrl, authorizationCode } = await this.authenticationService.login(data);

        response
            .status(HttpStatus.FOUND)
            .redirect(`${redirectUrl}?authorizationCode=${authorizationCode}&state=${data.state}`);
    }

    @Throttle(authenticationThrottlerOptions)
    @Post('/token')
    public async token(
        @Body() data: TokenRequestData,
        @Req() request: FastifyRequest,
        @Res({ passthrough: true }) response: FastifyReply
    ) {
        let receivedRefreshToken: string = null;

        if (data.useRefreshToken) {
            receivedRefreshToken = retrieveSignedCookieValue(request, COOKIE_NAME_REFRESH_TOKEN, this.logger);
        }
        const { tokens, clientId } = await this.authenticationService.requestToken(data, receivedRefreshToken);

        response
            .status(HttpStatus.OK)
            .headers({ [CLIENT_ID_HEADER]: clientId })
            .setCookie(`${COOKIE_NAME_ACCESS_TOKEN}-${clientId}`, tokens.accessToken.token, {
                expires: tokens.accessToken.expirationTime,
                path: '/',
            })
            .setCookie(COOKIE_NAME_REFRESH_TOKEN, tokens.refreshToken.token, {
                expires: tokens.refreshToken.expirationTime,
                path: '/',
            });
    }

    @Post('/verify-email')
    public async verifyEmail(@Body() data: VerifyEmailData, @Res({ passthrough: true }) response: FastifyReply) {
        this.logger.log('Verify email initiated');
        await this.authenticationService.verifyEmail(data.token, data.redirectUrl);

        response.status(HttpStatus.OK);
    }

    @Post('/reset-verify-email')
    public async resendVerifyEmail(@Body() data: VerifyEmailData, @Res({ passthrough: true }) response: FastifyReply) {
        this.logger.log('Resend "Verify email" email initiated');
        await this.authenticationService.resendVerifyEmail(data.token, data.redirectUrl);

        response.status(HttpStatus.OK);
    }

    @UseGuards(AuthenticationGuard, ScopeGuard)
    @HasScope(ScopeNames.CHANGE_PASSWORD)
    @Post('/change-password')
    public async changePassword(
        @Body() data: ChangePasswordData,
        @Req() request: FastifyRequest,
        @Res({ passthrough: true }) response: FastifyReply
    ) {
        this.logger.log(`Change password initiated for username "${request.authenticatedUser.username}"`);
        await this.authenticationService.changePassword(data, request.authenticatedUser);

        response.status(HttpStatus.OK).clearCookie(COOKIE_NAME_ACCESS_TOKEN).clearCookie(COOKIE_NAME_REFRESH_TOKEN);
    }
}
