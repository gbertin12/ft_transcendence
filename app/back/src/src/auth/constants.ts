import { Buffer } from 'buffer';
import { getRandomValues } from 'crypto';

const secret = Buffer.alloc(42);
getRandomValues(secret);

export const authConstants = {
    secret: secret.toString(),
};
