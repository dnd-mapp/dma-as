import { BeforeApplicationShutdown, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile, stat } from 'fs/promises';
import { createTransport, Transporter } from 'nodemailer';
import { Options } from 'nodemailer/lib/smtp-transport';
import { resolve } from 'path';
import { EmailSubject, getTemplateName, SendEmailParams } from './models';
import { TRANSPORTER_OPTIONS_NAME } from './providers';

@Injectable()
export class EmailService implements OnModuleInit, BeforeApplicationShutdown {
    private readonly transporter: Transporter;

    private readonly sender: string;

    private readonly baseTemplatesPath = resolve(__dirname, 'assets', 'mail');

    constructor(
        @Inject(TRANSPORTER_OPTIONS_NAME) private readonly transporterOptions: Options,
        private readonly configService: ConfigService
    ) {
        this.transporter = createTransport(this.transporterOptions);

        this.sender = this.configService.get<string>('email.sender');
    }

    public async onModuleInit() {
        await this.transporter.verify();
    }

    public beforeApplicationShutdown() {
        this.transporter.close();
    }

    public async sendEmail(params: SendEmailParams) {
        const { text, html } = await this.resolveEmailTemplateFromSubject(params.subject);

        // TODO: Add error handling
        await this.transporter.sendMail({
            from: this.sender,
            to: params.to,
            subject: params.subject,
            text: text,
            html: html,
        });
    }

    private async resolveEmailTemplateFromSubject(subject: EmailSubject) {
        const templateName = getTemplateName(subject);

        const htmlTemplate = await this.retrieveEmailTemplate(resolve(this.baseTemplatesPath, `${templateName}.html`));
        const textTemplate = await this.retrieveEmailTemplate(resolve(this.baseTemplatesPath, `${templateName}.txt`));

        // TODO: Replace variables with actual values
        return {
            text: textTemplate,
            html: htmlTemplate,
        };
    }

    private async retrieveEmailTemplate(filePath: string) {
        await stat(filePath);
        return await readFile(filePath, 'utf8');
    }
}
