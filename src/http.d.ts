declare module 'http' {
    interface IncomingMessage {
        authenticatedUser?: {
            id: string;
            username: string;
            password: string;
        };
    }
}
