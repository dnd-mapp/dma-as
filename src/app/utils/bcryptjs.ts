import { compare, genSalt, hash } from 'bcryptjs';

const SALT_ROUNDS = 16;

export async function createHash(value: string) {
    return await hash(value, await genSalt(SALT_ROUNDS));
}

export async function compareHashToValue(value: string, hashedValue: string) {
    return await compare(value, hashedValue);
}
