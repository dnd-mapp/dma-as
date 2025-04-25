import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class DmaLogger extends ConsoleLogger {
    constructor() {
        super();

        this.options = {
            ...this.options,
            prefix: 'dma-as',
        };
    }
}
