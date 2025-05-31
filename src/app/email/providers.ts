import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Options } from 'nodemailer/lib/smtp-transport';

export const TRANSPORTER_OPTIONS_NAME = 'EMAIL_TRANSPORTER_OPTIONS';

export const provideEmailTransporterConfig: () => FactoryProvider<Options> = () => ({
    provide: TRANSPORTER_OPTIONS_NAME,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        service: 'gmail',
        auth: {
            user: configService.get<string>('email.user'),
            pass: configService.get<string>('email.password'),
        },
    }),
});
