const fs = require('fs');
const path = require('path');
const sessions = {"l7yc5t84ynognglilodhudy3azmvagfy63ikg2nw":{"id":"u1k1fz","expiration":1734246006125}};
const sessionLength = 31 * 24 * 60 * 60 * 1000; // 31 Days

/**
 * Creates a new session for the user
 * @param {*} res Response object
 */
const createNewSession = (req, res) => {
    // Create A New Session
    const sessionToken = randomString(40).toLowerCase();
    const sessionId = randomString(6).toLowerCase();
    sessions[sessionToken] = { id: sessionId, expiration: (new Date()).getTime() + sessionLength };

    // Create User Content Directory
    const sessionPath = path.join(__dirname, '/user_content/', sessionId);
    if(!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    } else {
        // Delete Session And Create A New One
        delete sessions[sessionToken];
        createNewSession(req, res);
        return;
    }

    // Send Session Data To Client
    res.cookie('sessionToken', sessionToken, { httpOnly: true, secure: true });
    res.json({ token: sessionToken, ...sessions[sessionToken] });
};

exports.createNewSession = createNewSession;

/**
 * Gives client access to session data
 * @param {*} req Request object
 * @param {*} res Response object
 */
const getSession = (req, res) => {
    // Check If No Session Token Cookie Has Been Set
    if(req.cookies.sessionToken == undefined) res.json(false);

    // Request The Session Data And Return It
    const sessionToken = req.cookies.sessionToken;
    res.json(getSessionInternal(sessionToken));
};

exports.getSession = getSession;

/**
 * Internal function to get session data
 * @param {String} sessionToken The session token
 * @returns {*} Returns an object if an active session was found, otherwise false
 */
const getSessionInternal = sessionToken => {
    // Check If A Session With This Token Exists
    if(Object.keys(sessions).indexOf(sessionToken) < 0) return false;

    // Check If A Session Has Expired
    if(sessions[sessionToken].expiration < (new Date()).getTime()) return false;

    // Return The Session Data
    return { token: sessionToken, ...sessions[sessionToken] };
};

exports.getSessionInternal = getSessionInternal;

/**
 * Generates a random string with the supplied length
 * @param {Number} length The length of the generated string
 * @returns {String} A randomly generated string
 */
const randomString = length => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let string = '';
    do {
        string += charset.substr(Math.floor(Math.random() * charset.length), 1);
    } while(string.length < length);
    return string;
};

// req.cookies.sessionToken