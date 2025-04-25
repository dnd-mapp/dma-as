import { genSalt, hash } from 'bcryptjs';

export const valueToBase64 = (plain: string) => Buffer.from(plain).toString('base64url');

export const base64ToValue = (encoded: string) => Buffer.from(encoded, 'base64url').toString('utf8');

export const hashPassword = async (password: string) => await hash(password, await genSalt(16));
