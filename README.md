# Android Appium F-Droid Automation

Production-ready Android automation starter that launches an APK from F-Droid using WebdriverIO + Appium + Allure. Runs identically on a local machine and in GitHub Actions.

## Prerequisites
- Node.js 18+ and npm
- Java 17+
- Android SDK with an emulator named (or alias) `Android Emulator`
- AVD booted and Appium server listening on `http://127.0.0.1:4723`

## Project Layout
```
android-appium-fdroid-automation
├─ apk/                  # Place or download app.apk here
├─ config/capabilities.js
├─ tests/launchApp.test.js
├─ screenshots/          # Auto-created screenshots
├─ reports/              # Allure results + reports
├─ wdio.conf.js
├─ fetch-apk.js          # Helper to download F-Droid client APK
└─ .github/workflows/android-test.yml
```

## Installation
```bash
npm install
npm run fetch-apk   # downloads F-Droid client to apk/app.apk (optional if you supply your own)
```

## Local Execution
1. Start an Android emulator.
2. Start Appium: `npm run start-appium`
3. Run tests: `npm run test`
4. Generate HTML report: `npm run generate-report`
5. Open report in browser: `npm run open-report`

Expected results: the APK launches, `screenshots/app-launch.png` is saved, and `reports/allure-report/index.html` shows the test with embedded screenshots.  
Note: The test runner is a single-process WebdriverIO script (`standalone-test.js`) to avoid environments where child process spawning is blocked.

## Allure Reporting
- Raw results: `reports/allure-results/`
- Generated HTML: `reports/allure-report/`
- Screenshots are attached to each test and also stored under `screenshots/`.

## GitHub Actions CI
Workflow: `.github/workflows/android-test.yml`

Pipeline stages:
1. Checkout repository
2. Install Node.js and Java 17
3. Install Android SDK + create AVD + start emulator (headless)
4. Install Appium + UiAutomator2 driver
5. Download APK from F-Droid (`npm run fetch-apk`)
6. Run tests (`npm run test`)
7. Generate Allure report (`npm run generate-report`)
8. Upload artifacts: `screenshots` and `reports`

Artifacts are available in the workflow run summary under “Artifacts”.

## Notes
- Appium capabilities are defined in `config/capabilities.js`.
- If you want to use a different APK, place it at `apk/app.apk` or set `FDROID_APK_URL` before running `npm run fetch-apk`.
- Ensure emulator uses the same architecture as the system image installed in CI (x86_64).
