'use strict';
const nodemailer = require('nodemailer')
var smtpTransport = '' //require('nodemailer-smtp-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
let mailOptions, cb;

var readHTMLFile = function(path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
        if (err) {
            callback(err);
        } else {
            callback(null, html);
        }
    });
};

function configure(config, callback) {
    smtpTransport = nodemailer.createTransport(config.smtp);
    mailOptions = {
        from: config.from, // sender address
        to: config.to, // list of receivers
        replyTo: config.replyTo || config.from
    };

    cb = (err) => {
        if (err) logger.info(err.message);
    };
    callback();
};

function send(mOption) {
    try {
        let fileName = path.join(__dirname, '../../', 'public/views/mail.html');

        readHTMLFile(fileName, function(err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                user: mOption.to,
                activationLink: mOption.link,
                password: mOption.pwd,
                userId: mOption.userId
            };
            var htmlToSend = template(replacements);
            mailOptions = {
                to: mOption.to,
                subject: mOption.subject,
                html: htmlToSend
            };
            smtpTransport.sendMail(mailOptions, function(err, response) {
                if (err) logger.info(err.message + ' - ' + mOption.to);

            });
        })
    } catch (err) {
        logger.info(err.message);
    }
};

module.exports = {
    configure,
    send
}