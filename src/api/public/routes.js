'use strict';
const login = require('./controllers/login');
const { communicator, bcrypt } = require('./../../framework').modules;

exports.load = function(app) {
    app.get('/', function(req, res) {
        res.render('views/index.html');
    });

    app.post('/', function(req, res) {
        res.render('views/index.html');
    });

    app.use('/login', login);

    app.get('/test', function(req, res) {
        communicator.send(res, "/test", 200, true, { "data": "Testing Ping" });
    });
};