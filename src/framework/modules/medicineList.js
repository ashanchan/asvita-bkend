'use strict';
let medicineName;

function configure(config, callback) {
    let fs = require('fs');
    try {
        fs.readFile('src/http-header.json', 'utf8', function(err, data) {
            if (err) {
                callback(err);
            } else {
                medicineName = JSON.parse(data);
                console.log('medicine list set ho gaya', medicineName);
                callback();
            }
        });
    } catch (e) {
        callback();
    }
}

function getMedicineList(medName) {
    return medicineName;
}


module.exports = {
    configure,
    getMedicineList
}