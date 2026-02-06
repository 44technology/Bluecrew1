#!/usr/bin/env node
/**
 * Removes alpha channel from iOS app icon (Apple requires opaque icons).
 * Flattens onto white background and overwrites the source file.
 */
const sharp = require('sharp');
const path = require('path');

const iconPath = path.join(
  __dirname,
  '..',
  'ios',
  'BlueCrew',
  'Images.xcassets',
  'AppIcon.appiconset',
  'App-Icon-1024x1024@1x.png'
);

async function main() {
  await sharp(iconPath)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .removeAlpha()
    .png()
    .toFile(iconPath + '.tmp');
  const fs = require('fs');
  fs.renameSync(iconPath + '.tmp', iconPath);
  console.log('App icon alpha removed and saved.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
