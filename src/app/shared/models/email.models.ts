export const EmailSubjects = {
    VERIFY_EMAIL: 'Verify email address',
} as const;

export type EmailSubject = (typeof EmailSubjects)[keyof typeof EmailSubjects];

export const SubjectsToTemplateNames: Record<EmailSubject, string> = {
    [EmailSubjects.VERIFY_EMAIL]: 'verify-email',
} as const;

export function getTemplateName(subject: EmailSubject) {
    return SubjectsToTemplateNames[subject];
}

export interface SendEmailParams {
    to: string;
    subject: EmailSubject;

    data?: Record<string, string | boolean | number>;
}
