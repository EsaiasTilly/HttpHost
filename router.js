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
        const reqPath = decodeURI(req.path);
        const reqAbs = path.join(__dirname, '/user_content/', reqPath.substr(2));
        const reqFs = fs.existsSync(reqAbs) ? fs.statSync(reqAbs) : false;

        // Provide File If Found
        if(reqFs && reqFs.isFile()) { res.sendFile(reqAbs); return; }

        // Check If An Uncompleted Directory Url Was Requested
        if(reqFs && reqFs.isDirectory() && reqPath.lastIndexOf('/') < reqPath.length - 1)
        { res.redirect(reqPath + '/'); return; }

        // Search For Default Documents
        if(reqFs && reqFs.isDirectory()) {
            const defaultDocuments = ['index.html', 'index.htm'];
            for(let i = 0; i < defaultDocuments.length; i++) {
                const docName = defaultDocuments[i];
                const docAbs = path.join(reqAbs, docName);
                const docFs = fs.existsSync(docAbs) ? fs.statSync(docAbs) : false;
                if(docFs && docFs.isFile()) { res.sendFile(docAbs); return; }
                console.log(docName, docFs && docFs.isFile());
            }
        }

        // If No File Was Found
        res.sendStatus(404);
    } catch (error) {
        console.error(error);
        res.sendStatus(502);
    }
}

exports.handleUserContentRoute = handleUserContentRoute;