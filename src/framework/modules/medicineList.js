'use strict';
let medicineName = [];

function configure(config, callback) {
    let fs = require('fs');
    try {
        fs.readFile('src/medicineList.json', 'utf8', function(err, data) {
            if (err) {
                callback(err);
            } else {
                medicineName = JSON.parse(data).name;
                console.log('medicine list set ho gaya', medicineName);
                callback();
            }
        });
    } catch (e) {
        callback();
    }
}

function getMedicineList(medName) {
    let filteredMedicine = medicineName.filter(function(medName) {
        return medName.includes('nt');
    });

    return filteredMedicine;
}


module.exports = {
    configure,
    getMedicineList
}