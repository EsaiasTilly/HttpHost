const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const router = require('./router');
const sessions = require('./sessions');
const files = require('./files');
const multer = require('multer');
const upload = multer({ dest: 'tmp/' });
const app = express();
const port = 5454;

// Enable Cookies
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Landing Page
app.get('/', router.handleLandingPageRoute);
app.get('/assets/*', router.handleLandingPageRoute);

// Serve User Content
app.get('/c/*', router.handleUserContentRoute);

// User Sessions
app.get('/s/new', sessions.createNewSession);
app.get('/s/get', sessions.getSession);

// Serve User Content
app.get('/f/all', files.handleFileListRequest);
app.post('/f/upload', upload.array('content'), files.handleFileUpload);
app.post('/f/newDir', files.handleNewDirectoryRequest);

// Start Listening
app.listen(port, () => {
    console.log('HttpHost is successfully working and listens at port ' + port);
});