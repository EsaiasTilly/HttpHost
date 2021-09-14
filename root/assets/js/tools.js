const Tools = {
    /**
     * Request the content from a url
     * @param url The url to the requested page
     * @param callback The callback function to send requested content to
     */
    httpGet: (url, callback) => {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        };
        xmlHttp.open('GET', url, true);
        xmlHttp.send(null);
    },
    /**
     * Posts data to the url and requests the response
     * @param url The url to the requested page
     * @param params The post data params
     * @param callback The callback function to send response to
     */
    httpPost: (url, params, callback) => {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        };
        xmlHttp.open('POST', url);
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlHttp.send(params);
    },
    /**
     * Checks if a string is valid JSON
     * @param {String} json String to check
     * @param {Boolean} returnValue Indicades if the parsed value should be returnd in case of valid JSON
     * @returns {*} Returns true or false indicating the validity of the provided data. May return the value if returnValue is true
     */
    validJSON: (json, returnValue = false) => {
        try {
            let parsed = JSON.parse(json);
            if(returnValue) return parsed;
            delete parsed;
            return true;
        } catch (error) { return false; }
    },
    /**
     * Takes a number of bytes and generates a formatted string
     * @param {Number} bytes Number of bytes
     * @returns {String}
     */
    parseBytes: bytes => {
        const prefixes = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
        let prefix = 'B';
        for(let i = 0; i < prefixes.length && bytes >= 1024; i++) {
            prefix = prefixes[i];
            bytes = Math.round(bytes / 1024 * 10) / 10;
        }
        return bytes + ' ' + prefix;
    },
    /**
     * Parses a string for use in HTML
     * @param {String} str Unsafe string
     * @returns Safe HTML string
     */
    htmlParse: str => {
        const dummy = document.createElement('div');
        dummy.innerText = str;
        return dummy.innerHTML;
    }
};