export class User {
    public id: string;
    public username: string;
}

export type CreateUserData = Exclude<User, 'id'>;
