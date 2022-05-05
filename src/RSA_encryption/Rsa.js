const RSA = require('node-rsa');
const fs = require('fs');

const publicKey = new RSA();
const privateKey = new RSA();

const publicRsaKey = fs.readFileSync('./Keys/public.pem', 'utf8');
const privateRsaKey = fs.readFileSync('./Keys/private.pem', 'utf8');

publicKey.importKey(publicRsaKey);
privateKey.importKey(privateRsaKey);

const encrypt = (text) => privateKey.encryptPrivate(text, 'base64');

const decrypt = (hash) => publicKey.decryptPublic(hash, 'utf8');

module.exports = { encrypt, decrypt };
