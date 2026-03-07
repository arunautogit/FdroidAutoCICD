// Guard against globally injected loaders (e.g., ts-node via NODE_OPTIONS) that break WDIO.
delete process.env.NODE_OPTIONS;

const fs = require('fs');
const path = require('path');
const capabilities = require('./config/capabilities');
const allure = require('@wdio/allure-reporter').default;

const screenshotDir = path.resolve(__dirname, 'screenshots');
const allureResultsDir = path.resolve(__dirname, 'allure-results');

/**
 * Ensure required directories exist before run
 */
function ensureDirs() {
  [screenshotDir, allureResultsDir].forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
  });
}

exports.config = {
  runner: 'local',
  specs: ['./tests/**/*.test.js'],
  maxInstances: 1,
  capabilities,
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000
  },
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: allureResultsDir,
        disableWebdriverScreenshotsReporting: true,
        disableWebdriverStepsReporting: true
      }
    ]
  ],

  baseUrl: 'http://localhost',
  port: 4723,
  hostname: '127.0.0.1',
  path: '/',
  autoCompileOpts: {
    autoCompile: false
  },

  /**
   * Hooks
   */
  onPrepare() {
    ensureDirs();
  },

  beforeSession() {
    ensureDirs();
  },

  /**
   * Automatically capture screenshots on pass/fail.
   */
  async afterTest(test, context, { passed }) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${test.fullTitle.replace(/\s+/g, '_')}_${passed ? 'passed' : 'failed'}_${timestamp}.png`;
      const filePath = path.join(screenshotDir, fileName);
      const image = await browser.takeScreenshot();
      fs.writeFileSync(filePath, image, 'base64');
      allure.addAttachment(`AfterTest - ${test.title}`, Buffer.from(image, 'base64'), 'image/png');
    } catch (err) {
      // Avoid failing the run due to screenshot issues
      console.warn('afterTest screenshot failed:', err.message);
    }
  },

  onComplete() {
    console.log(`Screenshots saved to ${screenshotDir}`);
  }
};
