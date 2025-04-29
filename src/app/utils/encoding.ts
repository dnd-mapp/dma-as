import { genSalt, hash } from 'bcryptjs';
import { createHash } from 'crypto';

export const valueToBase64 = (value: string | Buffer<ArrayBufferLike>) =>
    (typeof value === 'string' ? Buffer.from(value) : value).toString('base64url');

export const base64ToValue = (encoded: string) => Buffer.from(encoded, 'base64url').toString('utf8');

export const valueToSHA256 = (value: string) => createHash('sha256').update(value).digest();

export const hashPassword = async (password: string) => await hash(password, await genSalt(16));
