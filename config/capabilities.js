const path = require('path');

const appPath = path.resolve(__dirname, '..', 'apk', 'app.apk');

module.exports = [
  {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:app': appPath,
    'appium:autoGrantPermissions': true,
    'appium:noReset': true,
    'appium:newCommandTimeout': 300
  }
];
