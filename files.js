const path = require('path');
const fs = require('fs');
const sessions = require('./sessions');

const handleFileUpload = (req, res) => {
    // Check For Session Data
    if(req.cookies.sessionToken == undefined) { res.json(false); return false; }
    const sessionData = sessions.getSessionInternal(req.cookies.sessionToken);
    if(!sessionData) { res.json(false); return false; }

    // Check Provided Path
    if(req.body.path == undefined) { res.json(false); return false; }
    if(!fs.existsSync(path.join(__dirname, '/user_content/', sessionData.id, req.body.path))) { res.json(false); return false; }

    try
    {
        // Move Files
        req.files.forEach(file => {
            const sourcePath = path.join(__dirname, '/tmp', file.filename);
            const destPath = path.join(__dirname, '/user_content/', sessionData.id, req.body.path, file.originalname);
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
            const newDirPath = path.join(currentDirectory, req.body.path);
            fs.mkdirSync(newDirPath, { recursive: true });
            res.json(true);
        }
    } catch (error) {
        res.json(false);
    }
};

exports.handleNewDirectoryRequest = handleNewDirectoryRequest;

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
    return fileInfo;
};