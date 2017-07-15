'use strict';
const express = require('express');
const app = express();
const { modules } = require('./framework');

app.use(express.static('public/views'));
app.init = modules.init;

app.start = app.listen.bind(app);
module.exports = app;