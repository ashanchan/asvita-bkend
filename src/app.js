'use strict';
const express = require('express');
const app = express();
const path = require('path');
const { modules } = require('./framework');
let publicDir = require('path').join(__dirname, '/public');

app.use(express.static(publicDir));
app.init = modules.init;

app.start = app.listen.bind(app);
module.exports = app;