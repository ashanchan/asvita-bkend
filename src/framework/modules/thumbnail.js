'use strict';
const thumb = require('node-thumbnail').thumb;

function createThumbnail(path) {
    thumb({
        source: path + '/profile.jpg',
        destination: path,
        width: 75,
        concurrency: 1,
        hashingType: 'md5',

        overwrite: true
    }).then(function() {
        console.log('Success');
    }).catch(function(e) {
        console.log('Error', e.toString());
    });
}

module.exports = {
    createThumbnail
}