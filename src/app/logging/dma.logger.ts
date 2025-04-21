import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class DmaLogger extends ConsoleLogger {
    constructor() {
        super();

        this.options = {
            ...this.options,
            prefix: 'dma-as',
        };
    }
}
