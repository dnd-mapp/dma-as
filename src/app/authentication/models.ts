import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginData {
    @IsString()
    @IsNotEmpty()
    public username: string;

    @IsString()
    @IsNotEmpty()
    public password: string;
}

export class SignUpData {
    @IsString()
    @IsNotEmpty()
    public username: string;

    @IsString()
    @IsNotEmpty()
    public password: string;
}

export class ChangePasswordData {
    @IsString()
    @IsNotEmpty()
    public oldPassword: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(12)
    public newPassword: string;
}
