const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { remote } = require('webdriverio');
const { AllureRuntime, Status } = require('allure-js-commons');

delete process.env.NODE_OPTIONS; // avoid injected loaders

const caps = require('./config/capabilities')[0];
const screenshotDir = path.resolve(__dirname, 'screenshots');
const allureResultsDir = path.resolve(__dirname, 'reports', 'allure-results');

function ensureDirs() {
  [screenshotDir, allureResultsDir].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));
}

function writeAllureResult({ status, message, attachmentSource }) {
  const runtime = new AllureRuntime({ resultsDir: allureResultsDir });
  const start = Date.now();
  const stop = start + 1;
  const testUuid = crypto.randomUUID();
  runtime.writeResult({
    uuid: testUuid,
    name: 'Launch F-Droid APK',
    fullName: 'Launch F-Droid APK',
    status,
    statusDetails: message ? { message } : undefined,
    stage: 'finished',
    start,
    stop,
    attachments: attachmentSource
      ? [
          {
            name: 'App Launch Screenshot',
            type: 'image/png',
            source: attachmentSource
          }
        ]
      : []
  });
}

async function main() {
  ensureDirs();
  const client = await remote({
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    logLevel: 'info',
    capabilities: caps
  });

  let screenshotFileName;
  try {
    await client.pause(5000);
    const pngBase64 = await client.takeScreenshot();
    screenshotFileName = 'app-launch.png';
    const screenshotPath = path.join(screenshotDir, screenshotFileName);
    fs.writeFileSync(screenshotPath, pngBase64, 'base64');
    // also copy into allure results for attachment
    const allureAttachment = path.join(allureResultsDir, screenshotFileName);
    fs.writeFileSync(allureAttachment, Buffer.from(pngBase64, 'base64'));

    writeAllureResult({ status: Status.PASSED, attachmentSource: screenshotFileName });
    console.log('Test passed, screenshot saved and Allure result written.');
  } catch (err) {
    console.error('Test failed:', err.message);
    writeAllureResult({ status: Status.FAILED, message: err.message, attachmentSource: screenshotFileName });
    process.exitCode = 1;
  } finally {
    await client.deleteSession();
  }
}

main();
