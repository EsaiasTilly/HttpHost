const path = require('path');
const fs = require('fs');
const sessions = require('./sessions');

/**
 * Handles uploading of user content
 * @param {*} req
 * @param {*} res
 */
const handleFileUpload = (req, res) => {
    // Check For Session Data
    if(req.cookies.sessionToken == undefined) { res.json(false); return; }
    const sessionData = sessions.getSessionInternal(req.cookies.sessionToken);
    if(!sessionData) { res.json(false); return; }

    // Check Provided Path
    if(req.body.path == undefined) { res.json(false); return; }
    if(!fs.existsSync(path.join(__dirname, '/user_content/', sessionData.id, req.body.path))) { res.json(false); return; }
    const relPath = req.body.path.replaceAll('.', '');

    try
    {
        // Move Files
        req.files.forEach(file => {
            const sourcePath = path.join(__dirname, '/tmp', file.filename);
            const fileName = file.originalname.replaceAll('/', '').replaceAll('\\', '');
            const destPath = path.join(__dirname, '/user_content/', sessionData.id, relPath, fileName);
            const source = fs.createReadStream(sourcePath);
            const dest = fs.createWriteStream(destPath);
            source.pipe(dest);
            source.on('error', e => console.error(e));
            source.on('end', () => {
                source.destroy();
                fs.unlink(sourcePath, e => {});
            });
        });

        // Respond
        res.json({ recieved: req.files });
    } catch (error) {
        // Respond If There Was An Error
        res.json(false);
    }
};

exports.handleFileUpload = handleFileUpload;

/**
 * Handles requests to create new directories
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const handleNewDirectoryRequest = (req, res) => {
    // Check For Session Data
    if(req.cookies.sessionToken == undefined) { res.json(false); return false; }
    const sessionData = sessions.getSessionInternal(req.cookies.sessionToken);
    if(!sessionData) { res.json(false); return false; }

    try {
        // Check If A Path Has Been Provided
        if(req.body.path == undefined) res.json(false);
        else {
            // Get Directory Listing
            const currentDirectory = path.join(__dirname, '/user_content/', sessionData.id);
            const newDirPath = path.join(currentDirectory, req.body.path.replaceAll('.', ''));
            fs.mkdirSync(newDirPath, { recursive: true });
            res.json(true);
        }
    } catch (error) {
        res.json(false);
    }
};

exports.handleNewDirectoryRequest = handleNewDirectoryRequest;

/**
 * Handle request for file structure
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const handleFileListRequest = (req, res) => {
    // Check For Session Data
    if(req.cookies.sessionToken == undefined) { res.json(false); return false; }
    const sessionData = sessions.getSessionInternal(req.cookies.sessionToken);
    if(!sessionData) { res.json(false); return false; }

    // Get Directory Listing
    const currentDirectory = path.join(__dirname, '/user_content/', sessionData.id);
    res.json(getDirListing(currentDirectory));
};

exports.handleFileListRequest = handleFileListRequest;

/**
 * Gets an array of all files in a directory
 * @param {String} searchPath Path to directory to search
 * @returns {Array}
 */
const getDirListing = searchPath => {
    const files = [];
    files.push(getFileInfo(searchPath + '/', searchPath));
    const walk = dir => {
        fs.readdirSync(dir).forEach(file => {
            const absolute = path.join(dir, file);
            if(fs.statSync(absolute).isDirectory()) walk(absolute);
            return files.push(getFileInfo(absolute, searchPath));
        });
    };
    walk(searchPath);
    return files.sort((a, b) => a.path.localeCompare(b));
};

/**
 * Gets info about a file
 * @param {String} filePath Absolute path to the file
 * @returns {Object}
 */
const getFileInfo = (filePath, basePath) => {
    const fileStatus = fs.statSync(filePath);
    const fileInfo = {
        isDirectory: fileStatus.isDirectory(),
        isFile: fileStatus.isFile(),
        size: fileStatus.size,
        path: filePath.substr(basePath.length).replaceAll('\\', '/')
    }
    if(fileInfo.isDirectory && fileInfo.path.lastIndexOf('/') < fileInfo.path.length - 1)
    { fileInfo.path += '/'; }
    return fileInfo;
};