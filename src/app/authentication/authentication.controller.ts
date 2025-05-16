import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
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

    @Post('/sign-up')
    public async signUp(@Body() signUpData: SignUpData, @Res({ passthrough: true }) response: FastifyReply) {
        this.logger.log(`User registration initiated for username "${signUpData.username}"`);
        const responseData = await this.authenticationService.signUp(signUpData);

        response.headers({
            Location: `${response.request.url.replace('/auth/sign-up', `/users/${responseData.id}`)}`,
        });

        return responseData;
    }

    @Post('/authorize')
    public async authorize(@Body() data: AuthorizeRequest, @Res() response: FastifyReply) {
        this.logger.log('Authorize attempt initialized');
        await this.authenticationService.authorize(data);

        this.logger.log('Authorize data stored. Redirecting to Login Page');
        response.status(HttpStatus.FOUND).redirect(`https://localhost.auth.dndmapp.net/app/login?state=${data.state}`);
    }

    @Post('/login')
    public async login(@Body() data: LoginData, @Res() response: FastifyReply) {
        this.logger.log(`Login attempt initiated for username "${data.username}"`);

        const { redirectUrl, authorizationCode } = await this.authenticationService.login(data);

        response
            .status(HttpStatus.FOUND)
            .redirect(`${redirectUrl}?authorizationCode=${authorizationCode}&state=${data.state}`);
    }

    @Post('/token')
    public async token(
        @Body() data: TokenRequestData,
        @Req() request: FastifyRequest,
        @Res({ passthrough: true }) response: FastifyReply
    ) {
        const receivedRefreshToken = retrieveSignedCookieValue(request, COOKIE_NAME_REFRESH_TOKEN, this.logger);
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

    @Post('/change-password')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthenticationGuard)
    public async changePassword(
        @Body() data: ChangePasswordData,
        @Req() request: FastifyRequest,
        @Res({ passthrough: true }) response: FastifyReply
    ) {
        this.logger.log(`Change password initiated for username "${request.authenticatedUser.username}"`);
        await this.authenticationService.changePassword(data, request.authenticatedUser);

        response.clearCookie(COOKIE_NAME_ACCESS_TOKEN).clearCookie(COOKIE_NAME_REFRESH_TOKEN);
    }
}
