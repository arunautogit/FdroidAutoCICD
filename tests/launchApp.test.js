const fs = require('fs');
const path = require('path');
const allure = require('@wdio/allure-reporter').default;

describe('Launch F-Droid APK', () => {
  it('should install and open the app then capture a screenshot', async () => {
    // Step 1-3: Start session and wait for main screen
    await driver.pause(5000);

    // Validate session is alive by checking the current package
    const currentPackage = await driver.getCurrentPackage();
    if (!currentPackage) {
      throw new Error('App did not start correctly: no current package reported.');
    }

    // Step 4-6: Capture screenshot and attach to report
    const screenshotPath = path.join(process.cwd(), 'screenshots', 'app-launch.png');
    const image = await browser.takeScreenshot();
    fs.writeFileSync(screenshotPath, image, 'base64');
    allure.addAttachment('App Launch Screenshot', Buffer.from(image, 'base64'), 'image/png');

    // Step 7: Mark test as passed by completing without error
  });
});
