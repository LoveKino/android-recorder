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
 *
 * @param store
 *      1. receiveAction
 *      2. receiveState
 */
module.exports = ({
    receiveAction
}) => {
    return {
        start: ({
            apkPath,
            packageName,
            mainActivity,
            channel,
            commandDir,
            yardDir,
            rootId
        }) => {
            // TODO start recorder emulator
            let {
                connect
            } = adbCon();

            let call = connect(channel, commandDir, {
                // TODO complete informations
                feedEvent: (ev, source) => {
                    receiveAction({
                        rootId,
                        winId: rootId
                    }, {
                        winId: rootId,
                        event: ev,
                        extra: {},
                        source: source,
                        time: new Date().getTime(),
                        platform: 'android'
                    });
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
                // TODO support detect
                return sleep(8000);
            }).then(() => {
                return call('startRecord');
            });
        },

        stop: ({
            packageName
        }) => {
            return spawnp(`adb shell am force-stop ${packageName}`);
        }
    };
};
