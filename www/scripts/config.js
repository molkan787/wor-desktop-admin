const packageJSON = require('../package.json');
const config = {

    // =====================================
    devMode: false,
    useLocalServer: false,
    // =====================================

    appVersion: packageJSON.versionCode,
    appVersionName: packageJSON.version,

    appNameShort: 'WOR Admin',

    // Dev config
    dev: {
        firstPage: 'stores',
        firstPageParam: ''
    },
    // =====================================
    dataAgentRetryTimeout: 5000,
}

Object.freeze(config);
