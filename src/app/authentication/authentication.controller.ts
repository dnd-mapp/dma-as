import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Res,
    UseInterceptors,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { DmaLogger } from '../logging';
import { valueToBase64 } from '../utils';
import { AuthenticationService } from './authentication.service';
import { LoginData, SignUpData } from './models';

@Controller('/auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly logger: DmaLogger
    ) {
        this.logger.setContext('AuthenticationController');
    }

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    public async login(@Body() loginData: LoginData, @Res({ passthrough: true }) response: FastifyReply) {
        this.logger.log(`Login attempt initiated for username "${loginData.username}"`);

        const authenticatedUser = await this.authenticationService.login(loginData);
        const { username, password } = loginData;

        // TODO - Replace with a generated JWT token and cookies instead of base64 encoded username and password.
        response.headers({ Authorization: `Basic ${valueToBase64(`${username}:${password}`)}` });
        return authenticatedUser;
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
}
