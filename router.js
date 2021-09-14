const path = require('path');
const fs = require('fs');
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
    try {
        const reqPath = decodeURI(req.path.substr(2));
        let absPath = path.join(__dirname, '/user_content/', reqPath);
        const fsStat = fs.existsSync(absPath) ? fs.statSync(absPath) : false;
        if(fsStat && fsStat.isDirectory && fs.existsSync(path.join(absPath, 'index.html')))
        { absPath = path.join(absPath, 'index.html'); }

        if(!fs.existsSync(absPath) || !fs.statSync(absPath).isFile) {
            res.send('404 - File not found');
        } else {
            res.sendFile(absPath);
        }
    } catch (error) {
        console.error(error);
        res.send('502 - Internal server error!');
    }
}

exports.handleUserContentRoute = handleUserContentRoute;