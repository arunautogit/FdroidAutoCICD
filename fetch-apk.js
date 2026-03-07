const fs = require('fs');
const https = require('https');
const path = require('path');

const APK_URL = process.env.FDROID_APK_URL || 'https://f-droid.org/F-Droid.apk';
const targetPath = path.resolve(__dirname, 'apk', 'app.apk');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          // follow redirect
          return download(response.headers.location, dest).then(resolve).catch(reject);
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`Download failed with status ${response.statusCode}`));
        }
        response.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

(async () => {
  try {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    console.log(`Downloading APK from ${APK_URL}`);
    await download(APK_URL, targetPath);
    console.log(`APK saved to ${targetPath}`);
  } catch (err) {
    console.error('Failed to download APK:', err.message);
    process.exitCode = 1;
  }
})();
