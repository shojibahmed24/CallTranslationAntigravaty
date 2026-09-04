const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const tar = require('tar');

const url = 'https://registry.npmjs.org/expo-template-blank-typescript/-/expo-template-blank-typescript-51.0.44.tgz';
const targetDir = path.join(__dirname, 'native-app');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

https.get(url, (response) => {
  response.pipe(zlib.createGunzip()).pipe(tar.x({ cwd: targetDir, strip: 1 }))
    .on('finish', () => {
      console.log('Template extracted successfully.');
      // Update package name
      const pkgPath = path.join(targetDir, 'package.json');
      const pkg = require(pkgPath);
      pkg.name = 'native-app';
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log('Done.');
    })
    .on('error', (err) => {
      console.error('Error extracting tarball:', err);
    });
}).on('error', (err) => {
  console.error('Error downloading template:', err);
});
