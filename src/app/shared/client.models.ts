import { PickType } from '@nestjs/mapped-types';

export class RedirectURL {
    url: string;
}

export class Client {
    id: string;
    audience: string;
    redirectURLs: RedirectURL[];
}

export class CreateClientData extends PickType(Client, ['audience', 'redirectURLs'] as const) {}
