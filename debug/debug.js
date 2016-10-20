'use strict';

let record = require('..');
let path = require('path');
let log = console.log; // eslint-disable-line

record({
    apkPath: path.join(__dirname, './TestApp/app/build/outputs/apk/app-debug.apk'),
    packageName: 'com.freekite.android.test.testapp',
    mainActivity: 'MainActivity',
    channel: '/data/user/0/com.freekite.android.test.testapp/files/aosp_hook/command.json',
    yardDir: '/data/user/0/com.freekite.android.test.testapp'
}, {
    recieveEvent: (ev) => {
        log(ev);
    }
});
