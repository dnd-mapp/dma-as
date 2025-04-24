import { ValidationPipeOptions } from '@nestjs/common';

export const globalValidationOptions: ValidationPipeOptions = {
    exceptionFactory: (errors) => errors[0],
    forbidNonWhitelisted: true,
    stopAtFirstError: true,
    transform: true,
    transformOptions: {
        enableCircularCheck: true,
        enableImplicitConversion: true,
    },
    whitelist: true,
};
