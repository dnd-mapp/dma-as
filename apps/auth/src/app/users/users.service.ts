import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { EmailService } from '../email';
import { DmaLogger } from '../logging';
import { RolesService } from '../roles';
import { CreateUserData, EMAIL_VERIFICATION_EXPIRY, EmailSubjects, Role, Roles, UpdateUserData, User } from '../shared';
import { createHash } from '../utils';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
    constructor(
        private readonly logger: DmaLogger,
        private readonly usersRepository: UsersRepository,
        private readonly rolesService: RolesService,
        private readonly emailService: EmailService
    ) {
        this.logger.setContext('UsersService');
    }

    public async getAll() {
        return await this.usersRepository.findAll();
    }

    public async getById(userId: string) {
        return await this.usersRepository.findOneById(userId);
    }

    public async getByUsername(username: string) {
        return await this.usersRepository.findOneByUsername(username);
    }

    public async update(data: UpdateUserData) {
        const { id, username, roles } = data;
        try {
            await this.validateUserExists(id, `Can't update User. User with ID "${id}" does not exist.`);
            await this.validateUsername(username, `Can't update User. Username "${username}" cannot be used.`, id);
            await this.validateRolesExist(roles, `Can't create User - Reason: Role with ID "$ID" does not exist.`);

            return await this.usersRepository.update(data);
        } catch (error) {
            if (error instanceof NotFoundException && error.message.includes('does not exist')) {
                this.logger.warn(`Failed to update User account with ID "${id}" - Reason: not found`);
            }
            if (error instanceof BadRequestException && error.message.includes('cannot be used')) {
                this.logger.warn(
                    `Failed to update User account with ID "${id}" - Reason: duplicate username "${username}"`
                );
            }
            throw error;
        }
    }

    public async updatePassword(user: User) {
        return await this.usersRepository.updatePassword(user);
    }

    public async create(data: CreateUserData, redirectUrl: string) {
        let code: string;

        try {
            await this.validateUsername(
                data.username,
                `Can't create User. Username "${data.username}" cannot be used.`
            );
            await this.validateRolesExist(data.roles, `Can't create User - Reason: Role with ID "$ID" does not exist.`);
            data.password = await createHash(data.password);

            if (!data.emailVerified) {
                code = randomBytes(32).toString('hex');

                data.emailVerificationCode = await createHash(code);
                data.emailVerificationCodeExpiry = new Date(new Date().getTime() + EMAIL_VERIFICATION_EXPIRY);
            }
            const created = await this.usersRepository.create(data);

            if (created.emailVerified) return created;
            return this.sendVerifyEmailAddressEmail(created, redirectUrl);
        } catch (error) {
            if (error instanceof BadRequestException && error.message.includes('cannot be used')) {
                this.logger.warn(
                    `Failed to create User account with username "${data.username}" - Reason: Duplicate username`
                );
            }
            throw error;
        }
    }

    public async sendVerifyEmailAddressEmail(user: User, redirectUrl: string) {
        const code = randomBytes(32).toString('hex');

        user.emailVerified = false;
        user.emailVerificationCode = await createHash(code);
        user.emailVerificationCodeExpiry = new Date(new Date().getTime() + EMAIL_VERIFICATION_EXPIRY);

        user = await this.update(user);

        await this.emailService.sendEmail({
            to: user.email,
            subject: EmailSubjects.VERIFY_EMAIL,
            data: {
                homeLink: redirectUrl,
                verifyLink: `${redirectUrl}/verify-email?token=${Buffer.from(`${user.username}:${code}`).toString('base64url')}`,
            },
        });

        return user;
    }

    public async removeById(userId: string) {
        try {
            const user = await this.validateUserExists(
                userId,
                `Can't remove User. User with ID "${userId}" does not exist.`
            );

            if (user.hasRole(Roles.SUPER_ADMIN)) {
                throw new BadRequestException(`Can't remove User. Reason: User is a "${Roles.SUPER_ADMIN}"`);
            }
            await this.usersRepository.removeById(userId);
        } catch (error) {
            if (error instanceof NotFoundException && error.message.includes('does not exist')) {
                this.logger.warn(`Failed to remove User with ID "${userId}" - Reason: Does not exist`);
            }
            throw error;
        }
    }

    private async validateUserExists(userId: string, errorMessage: string) {
        const query = await this.getById(userId);

        if (query) return query;
        throw new NotFoundException(errorMessage);
    }

    private async validateUsername(username: string, errorMessage: string, userId?: string) {
        const query = await this.getByUsername(username);

        if (query && (!userId || userId !== query.id)) throw new BadRequestException(errorMessage);
    }

    private async validateRolesExist(roles: Set<Role>, message: string) {
        await Promise.all([...roles].map((role) => this.validateRoleExist(role, message)));
    }

    private async validateRoleExist(role: Role, message: string) {
        const query = await this.rolesService.getById(role.id);

        if (query) return;
        throw new BadRequestException(message.replace('$ID', role.id));
    }
}
