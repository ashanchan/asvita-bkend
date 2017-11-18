'use strict';
const express = require('express');
let router = express.Router();
//=======================================================
router.post('/login', function(req, res, next) {
    console.log('login accessed');
});
//=======================================================
module.exports = router;