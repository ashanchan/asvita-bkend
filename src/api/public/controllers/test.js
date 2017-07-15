'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const requestIp = require('request-ip');
const { nconf, bcrypt, communicator } = require('./../../../framework').modules;
const collection = require('../models/collection');

let router = express.Router();

let validateToken = function() {
    return (req, res, next) => {
        if (req.headers['x-access-token'] === nconf.get('access_token')) {
            next();
        } else {
            res.status(200).jsonp({ error_message: nconf.get('messages:errors:access_token') });
        }
    };
};

router.use(
    validateToken(),
    function(req, res, next) {
        next();
    }
);

router.get('/', function(req, res) {
    res.redirect('/');
});

router.post('/', function(req, res) {
    let body = JSON.parse(req.body) || {};
    console.log('new Ip ', requestIp.getClientIp(req));
    console.log(body)
    let newUser = new collection.USER({
        //email: bcrypt.encrypt(body.email),
        //pwd: bcrypt.encrypt(body.password),
        email: body.email,
        pwd: body.password,
        registered: requestIp.getClientIp(req),
        accessed: requestIp.getClientIp(req)
    });

    //=== presave 

    newUser.save((err, data) => {
        if (err) {
            console.log('error occured ', err.errmsg);
            res.status(200).jsonp({ error_message: nconf.get('messages:errors:access_token') });

        } else {
            if (err.code === 11000 || err.code === 11001) {
                return res.send(Boom.forbidden("please provide another user email"));
            } else {
                return res.send(Boom.forbidden(err)); // HTTP 403
            }
            console.log('success occured');
            res.status(200).jsonp({ error_message: nconf.get('messages:errors:access_token') });
        }
    });
});

module.exports = router;


'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const requestIp = require('request-ip');
const { nconf, bcrypt, communicator } = require('./../../../framework').modules;
const collection = require('../models/collection');

let router = express.Router();

router.post('/', function(req, res) {
            let body = JSON.parse(req.body) || {};
            let encEmail = body.email;
            let encPwd = body.password;
            console.log(encEmail, encPwd);
            try {
                let newUser = new collection.USER();
                User.findOne({ userName: req.params.userName }, function(err, user) {

                        if (err)
                            res.send(err);

                        //this user now lives in your memory, you can manually edit it
                        user.username = "somename";
                        user.competitorAnalysis.firstObservation = "somethingelse";

                        // after you finish editing, you can save it to database or send it to client
                        user.save(function(err) {
                            if (err)
                                return res.send(err);

                            return res.json({ message: 'User updated!' });
                        })

                    } catch (err) {
                        communicator.send(res, "/login", 500, false, { "data": 'Error occured while fetching data ' + err });
                    }
                });

            module.exports = router;


            //==== working
            'use strict';

            const express = require('express');
            const jwt = require('jsonwebtoken');
            const requestIp = require('request-ip');
            const { nconf, bcrypt, communicator } = require('./../../../framework').modules;
            const collection = require('../models/collection');

            let router = express.Router();

            router.post('/', function(req, res) {
                let body = JSON.parse(req.body) || {};
                let encEmail = body.email;
                let encPwd = body.password;
                console.log(encEmail, encPwd);
                collection.USER.find({ "email": encEmail })
                    .then((data) => {
                        if (data.length === 1) {
                            if (body.password === data[0].pwd) {
                                let token = jwt.sign({ "email": encEmail }, nconf.get('secret'));
                                communicator.send(res, "/login", 200, true, { "data": token });
                            } else {
                                communicator.send(res, "/login", 204, false, { "data": 'Wrong email Id / Password' });
                            }
                        } else {
                            communicator.send(res, "/login", 204, false, { "data": 'No match found' });
                        }
                    })
                    .catch((err) => {
                        communicator.send(res, "/login", 500, false, { "data": 'Error occured while fetching data' });
                    })
            });

            module.exports = router;