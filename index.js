const express = require('express');
const path = require('path');
const app = express();
const port = 5454;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/root/index.html'));
});

app.listen(port, () => {
    console.log('HttpHost is successfully working and listens at port ' + port);
});