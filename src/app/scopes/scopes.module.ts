import { Module } from '@nestjs/common';
import { ScopesController } from './scopes.controller';
import { ScopesRepository } from './scopes.repository';
import { ScopesService } from './scopes.service';

@Module({
    controllers: [ScopesController],
    providers: [ScopesService, ScopesRepository],
    exports: [ScopesService],
})
export class ScopesModule {}
