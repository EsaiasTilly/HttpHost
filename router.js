const path = require('path');
const sessions = require('./sessions');

/**
 * Handles requests for static content for the landing page
 * @param {*} req Request object
 * @param {*} res Response object
 */
const handleLandingPageRoute = (req, res) => {
    let reqPath = req.path == '/' ? '/index.html' : decodeURIComponent(req.path);
    res.sendFile(path.join(__dirname, '/root/', reqPath));
}

exports.handleLandingPageRoute = handleLandingPageRoute;

/**
 * Handles requests for static content for user uploaded content
 * @param {*} req Request object
 * @param {*} res Response object
 */
const handleUserContentRoute = (req, res) => {
    let reqPath = decodeURIComponent(req.path.substr(2));
    if(reqPath == '/') reqPath = '/index.html';
    res.sendFile(path.join(__dirname, '/user_content/', reqPath));
}

exports.handleUserContentRoute = handleUserContentRoute;