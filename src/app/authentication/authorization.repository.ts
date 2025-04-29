import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database';
import { Authorization, AuthorizeRequest } from '../shared';

@Injectable()
export class AuthorizationRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public getAuthorizationByState = async (state: string) =>
        plainToInstance(Authorization, await this.databaseService.authorization.findFirst({ where: { state: state } }));

    public getAuthorizationByAuthorizationCode = async (authorizationCode: string) =>
        plainToInstance(
            Authorization,
            await this.databaseService.authorization.findFirst({ where: { authorizationCode: authorizationCode } })
        );

    public storeCodeChallenge = async (data: AuthorizeRequest) =>
        plainToInstance(
            Authorization,
            await this.databaseService.authorization.create({
                data: { codeChallenge: data.codeChallenge, state: data.state, redirectUrl: data.redirectUrl },
            })
        );

    public update = async (authorization: Authorization) =>
        plainToInstance(
            Authorization,
            await this.databaseService.authorization.update({
                where: { authorizationCode: authorization.authorizationCode },
                data: authorization,
            })
        );

    public async remove(authorizationCode: string) {
        await this.databaseService.authorization.delete({ where: { authorizationCode: authorizationCode } });
    }
}
