const express = require('express');
const path = require('path');
const app = express();
const port = 5454;

// Serve Landing Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/root/index.html'));
});

// Serve User Content
app.get('/c/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/user_content', req.path.substr(3)));
});

// Start Listening
app.listen(port, () => {
    console.log('HttpHost is successfully working and listens at port ' + port);
});