import { BadRequestException, Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { DmaLogger } from '../logging';
import { User, UsersService } from '../users';
import { hashPassword } from '../utils';
import { ChangePasswordData, LoginData, SignUpData } from './models';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly usersService: UsersService,
        private readonly logger: DmaLogger
    ) {
        this.logger.setContext('AuthenticationService');
    }

    public async login(loginData: LoginData) {
        try {
            const user = await this.usersService.getByUsername(loginData.username);

            if (!user) {
                this.logger.warn(
                    `Authentication failed for username "${loginData.username}" - Reason: User does not exist`
                );
                throw new Error();
            }
            if (await this.comparePassword(loginData.password, user.password)) {
                this.logger.log(`Login successful for username "${user.username}"`);
                return user;
            }
            this.logger.warn(`Authentication failed for username "${user.username}" - Reason: Incorrect password`);
            throw new Error();
        } catch {
            throw new BadRequestException('Wrong username or password');
        }
    }

    public async signUp(signUpData: SignUpData) {
        const createdUser = await this.usersService.create(signUpData);
        this.logger.log(`User account created successfully for username "${createdUser.username}"`);

        return createdUser;
    }

    public async changePassword(data: ChangePasswordData, user: User) {
        if (!(await this.comparePassword(data.oldPassword, user.password))) {
            this.logger.warn(`Change password failed for User with ID "${user.id}" - Reason: Incorrect old password`);
            throw new BadRequestException('Old password is incorrect');
        }
        user.password = await hashPassword(data.newPassword);
        await this.usersService.updatePassword(user);

        this.logger.log(`Change password successfully for User with ID "${user.id}"`);
    }

    private async comparePassword(password: string, hash: string) {
        if (!hash) return false;
        return await compare(password, hash);
    }
}
