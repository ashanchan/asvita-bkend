'use strict';
const express = require('express');
const apiRoutes = express.Router();
const { jwt } = require('./../../framework').modules;

apiRoutes.use(function(req, res, next) {
    console.log('jai hanuman ');
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token);
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});
//=======================================================
module.exports = apiRoutes;
//=======================================================