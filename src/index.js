'use strict';

let spawnp = require('spawnp');

let {
    adbCon, install
} = require('android-yard');

let sleep = (duration) => {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
};

/**
 * android recorder
 *
 * 1. start recorder emulator
 *
 * 2. launch command server
 *
 * 3. reinstall test apk
 *
 * 4. deploy yard-dex.jar
 *
 * 5. launch apk
 */

module.exports = ({
    apkPath,
    packageName,
    mainActivity,
    channel,
    yardDir
}, {
    recieveEvent
}) => {
    // TODO start recorder emulator
    let {
        connect
    } = adbCon();

    connect(channel, {
        feedEvent: (ev) => {
            recieveEvent(ev);
            return true;
        }
    });

    // reinstall test apk
    return spawnp([
        'adb root',
        `adb uninstall ${packageName}`,
        `adb install ${apkPath}`
    ], [], {
        stdio: 'inherit'
    }).then(() => {
        // deploy yard-dex.jar
        return install(yardDir);
    }).then(() => {
        return spawnp([
            `adb shell am force-stop ${packageName}`,
            `adb shell am start -n ${packageName}/${packageName}.${mainActivity}`
        ]);
    }).then(() => {
        return sleep(2000);
    });
};
