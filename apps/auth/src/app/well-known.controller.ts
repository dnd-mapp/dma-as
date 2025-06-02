import { Controller, Get } from '@nestjs/common';
import { KeysService } from './keys';

@Controller('.well-known')
export class WellKnownController {
    constructor(private readonly keysService: KeysService) {}

    @Get('jwks.json')
    public getJwks() {
        return this.keysService.getKeys();
    }
}
