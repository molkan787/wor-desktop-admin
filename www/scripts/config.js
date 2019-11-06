const config = {

    // =====================================
    devMode: true,
    useLocalServer: true,
    // =====================================

    appVersion: 10008,
    appVersionName: '1.0.8',

    appNameShort: 'WOR Admin',

    // Dev config
    dev: {
        firstPage: 'categories',
        firstPageParam: '0'
    },
    // =====================================
    dataAgentRetryTimeout: 5000,
}

Object.freeze(config);
