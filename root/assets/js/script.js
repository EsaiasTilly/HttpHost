const session = { data: false };

/**
 * Inits. the website
 */
const init = () => {
    /**
     * Handle the response from session data requests
     * @param {String} res The response recieved
     */
    const requestSessionCallback = res => {
        // Check If A Session Was Found Or Created
        if(!!Tools.validJSON(res, true)) {
            session.data = { ...JSON.parse(res) };
            loadUI();
        } else {
            // Request A New Session
            Tools.httpGet('/s/new', requestSessionCallback);
        }
    };
    Tools.httpGet('/s/get', requestSessionCallback);
};

window.addEventListener('load', init);

/**
 * Loads the UI components of the website
 */
const loadUI = () => {
    // Set The Top Link
    const topSessionLink = document.getElementById('topSessionLink');
    const sessionLink = 'https://host.iammorethan.me/c/' + session.data.id;
    topSessionLink.innerText = session.data.id;
    topSessionLink.href = sessionLink;

    // Load The Filelist
    loadFilelist();
};

/**
 * Loads and updates the filelist
 */
const loadFilelist = () => {
    /**
     * Generates action buttons for a specific file
     * @param {Object} file File data object
     * @returns {String} Action buttons html
     */
    const fileActionButtons = file => {
        // Return No Actions On Root Directory
        if(file.path == '/') '';

        // Create Actions
        let actions = '';
        actions += '<button onClick="deleteFile(' + Tools.htmlParse(JSON.stringify(file.path).replaceAll('"', '\'')) + ');">Delete</button>';

        // Return Action Html
        return actions;
    };

    /**
     * Handles the request response for filelist
     * @param {String} res Response data from request
     */
    const filelistRequestCallback = res => {
        // Check For A Valid JSON Response
        if(!!Tools.validJSON(res, true)) {
            const baseUrl = 'https://host.iammorethan.me/c/' + session.data.id;
            const files = JSON.parse(res);
            const filelistBody = document.getElementById('filelistBody');
            filelistBody.innerHTML = '';

            files.forEach(file => {
                const fileRow = document.createElement('tr');
                fileRow.innerHTML = '<td></td><td><a></a></td><td></td><td></td>';
                fileRow.childNodes[0].innerHTML = '<img src="/assets/icons/' + (file.isDirectory ? 'dir' : 'file') + '.svg" />';
                fileRow.childNodes[1].childNodes[0].href = Tools.htmlParse(baseUrl + encodeURIComponent(file.path));
                fileRow.childNodes[1].childNodes[0].innerText = Tools.htmlParse(file.path);
                fileRow.childNodes[2].innerText = file.isFile ? Tools.htmlParse(Tools.parseBytes(file.size)) : '';
                fileRow.childNodes[3].innerHTML = fileActionButtons(file);
                filelistBody.appendChild(fileRow);
            });
        } else {
            alert('Could not fetch filelist data! Will not reload website.');
            location.href = location.href;
        }
    };
    Tools.httpGet('/f/all', filelistRequestCallback);
};

const requestNewDir = path => {
    if(path != '' && path != '/') {
        Tools.httpPost('/f/newDir', 'path=' + encodeURIComponent(path), loadFilelist);
    }
};

const deleteFile = path => {
    if(path != '' && path != '/') {
        Tools.httpPost('/f/del', 'path=' + encodeURIComponent(path), loadFilelist);
    }
};