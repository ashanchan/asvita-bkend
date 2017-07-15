const bcrypt = require('bcrypt');
let saltRounds = 10;

function configure(config, callback) {
    saltRounds = Number(config.saltRounds);
    callback();
}

function encrypt(val) {
    return bcrypt.hashSync(val, saltRounds);
}

function decrypt(source, target) {
    return bcrypt.compareSync(source, target);
}

module.exports = {
    configure,
    encrypt,
    decrypt
}