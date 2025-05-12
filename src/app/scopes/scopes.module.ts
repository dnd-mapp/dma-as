import { Module } from '@nestjs/common';
import { RolesModule } from '../roles';
import { ScopesController } from './scopes.controller';
import { ScopesRepository } from './scopes.repository';
import { ScopesService } from './scopes.service';

@Module({
    imports: [RolesModule],
    controllers: [ScopesController],
    providers: [ScopesService, ScopesRepository],
    exports: [ScopesService],
})
export class ScopesModule {}
