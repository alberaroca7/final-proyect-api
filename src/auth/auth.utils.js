import crypto from 'crypto';

// created a key for the encryting
const salt = 'demo_final_proyect_secret';

/**
 * this function encrypts the received passw parameter and returns it encrypted  
 */

export const encodePassword = (pass) => {
    // use the cypto library to encript the passw and using 1000 iterations
    return crypto.pbkdf2Sync(pass, salt, 1000, 64, `sha512`).toString(`hex`);
}

/**
 * Generate a hexadecimal 128 bytes random token  
 */

export const generateValidationToken = () => {
    return crypto.randomBytes(128).toString('hex');
}