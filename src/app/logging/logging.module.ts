import { Global, Module } from '@nestjs/common';
import { DmaLogger } from './dma.logger';

@Global()
@Module({
    providers: [DmaLogger],
    exports: [DmaLogger],
})
export class LoggingModule {}
