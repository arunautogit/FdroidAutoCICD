const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const sdkRoot = process.env.ANDROID_HOME || 'F:\\\\Android';
const buildToolsDir = path.join(sdkRoot, 'build-tools');
let buildToolsVersion = null;

if (fs.existsSync(buildToolsDir)) {
  const versions = fs
    .readdirSync(buildToolsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .reverse();
  buildToolsVersion = versions[0];
}

const env = { ...process.env };
env.ANDROID_HOME = sdkRoot;
if (buildToolsVersion) {
  const buildToolsPath = path.join(buildToolsDir, buildToolsVersion);
  env.PATH = [
    path.join(sdkRoot, 'platform-tools'),
    path.join(sdkRoot, 'emulator'),
    buildToolsPath,
    env.PATH
  ].join(path.delimiter);
  const aapt2Path = path.join(buildToolsPath, 'aapt2.exe');
  if (!fs.existsSync(aapt2Path)) {
    console.warn(`WARNING: aapt2.exe not found at ${aapt2Path}`);
  }
} else {
  console.warn('WARNING: No build-tools folder found under ANDROID_HOME; aapt2 will be missing.');
}

const appiumBin = path.resolve(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'appium.cmd' : 'appium');
const args = ['--allow-cors', '--log-level', 'info', '--log', 'appium.log'];

console.log(`Starting Appium with ANDROID_HOME=${env.ANDROID_HOME}`);
if (buildToolsVersion) {
  console.log(`Using build-tools version ${buildToolsVersion}`);
}

const child = spawn(appiumBin, args, { stdio: 'inherit', env });

child.on('exit', (code) => process.exit(code ?? 1));
