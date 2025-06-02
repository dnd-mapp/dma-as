import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyException extends HttpException {
    constructor(message: string) {
        super(
            {
                message: message,
                status: HttpStatus.TOO_MANY_REQUESTS,
                error: 'Too Many Requests',
                timestamp: new Date(),
            },
            HttpStatus.TOO_MANY_REQUESTS
        );
    }
}
