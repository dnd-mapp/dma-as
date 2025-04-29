import { genSalt, hash } from 'bcryptjs';
import { createHash } from 'crypto';

export const valueToBase64 = (plain: string) => Buffer.from(plain).toString('base64url');

export const base64ToValue = (encoded: string) => Buffer.from(encoded, 'base64url').toString('utf8');

export const valueToSHA256 = (value: string) => createHash('sha256').update(value).digest();

export const hashPassword = async (password: string) => await hash(password, await genSalt(16));
