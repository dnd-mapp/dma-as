import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { provideEmailTransporterConfig } from './providers';

@Global()
@Module({
    providers: [provideEmailTransporterConfig(), EmailService],
    exports: [EmailService],
})
export class EmailModule {}
