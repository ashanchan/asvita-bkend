'use strict';
const crypto = require('crypto');
let algorithm;
let password;

function configure(config, callback) {
    algorithm = String(config.algorithm);
    password = String(config.password);
    callback();
}

function encrypt(text) {
    let cipher = crypto.createCipher(algorithm, password)
    let crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    let decipher = crypto.createDecipher(algorithm, password)
    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

module.exports = {
    configure,
    encrypt,
    decrypt
}