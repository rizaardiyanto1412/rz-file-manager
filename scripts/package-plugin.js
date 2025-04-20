// scripts/package-plugin.js
// Node.js script to package your WordPress plugin into a zip, including all required files/folders
// Usage: node scripts/package-plugin.js

const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');

// CONFIG: List all files/folders you want to include in the zip
const INCLUDE = [
  'includes',
  'assets',
  'languages',
  'vendor',
  'readme.txt',
  'rz-file-manager.php',
  'uninstall.php',
  // Add more as needed
];

// CONFIG: Name of the plugin folder inside the zip
const PLUGIN_SLUG = 'rz-file-manager';
const TMP_DIR = path.join(__dirname, '..', '__tmp_pack');
const BUILD_DIR = path.join(__dirname, '..', 'build');
const ZIP_PATH = path.join(BUILD_DIR, `${PLUGIN_SLUG}.zip`);

// Folders inside vendor/phpmyadmin/phpmyadmin to strip from final package
const PRUNE_PMA = [
  'vendor/phpmyadmin/phpmyadmin/doc',
  'vendor/phpmyadmin/phpmyadmin/examples',
  'vendor/phpmyadmin/phpmyadmin/setup',
  'vendor/phpmyadmin/phpmyadmin/test',
  'vendor/phpmyadmin/phpmyadmin/tmp',
  'vendor/phpmyadmin/phpmyadmin/po', // translations – keep English in lang folder automatically bundled in phpMyAdmin core
  'vendor/phpmyadmin/phpmyadmin/sql',
];

// Keep only these at top-level vendor after copy
const VENDOR_WHITELIST = new Set(['autoload.php', 'composer', 'phpmyadmin']);

async function main() {
  try {
    // Clean up any previous temp/build folders
    await fs.remove(TMP_DIR);
    await fs.ensureDir(TMP_DIR);
    await fs.ensureDir(BUILD_DIR);

    // Copy all includes
    for (const item of INCLUDE) {
      const src = path.join(__dirname, '..', item);
      const dest = path.join(TMP_DIR, PLUGIN_SLUG, item);
      if (await fs.pathExists(src)) {
        await fs.copy(src, dest);
      } else {
        console.warn(`Warning: ${item} does not exist and will not be included.`);
      }
    }

    // Remove any vendor packages we don't need (everything except whitelist)
    const vendorRoot = path.join(TMP_DIR, PLUGIN_SLUG, 'vendor');
    if (await fs.pathExists(vendorRoot)) {
      const vendorEntries = await fs.readdir(vendorRoot);
      for (const entry of vendorEntries) {
        if (!VENDOR_WHITELIST.has(entry)) {
          await fs.remove(path.join(vendorRoot, entry));
        }
      }
    }

    // Prune large unnecessary directories to shrink package size
    for (const rel of PRUNE_PMA) {
      const target = path.join(TMP_DIR, PLUGIN_SLUG, rel);
      await fs.remove(target);
    }

    // Create zip
    await zipDirectory(
      path.join(TMP_DIR, PLUGIN_SLUG),
      ZIP_PATH
    );
    console.log(`\nPackaged plugin to: ${ZIP_PATH}`);
  } catch (err) {
    console.error('Packaging failed:', err);
    process.exit(1);
  } finally {
    // Clean up temp dir
    await fs.remove(TMP_DIR);
  }
}

function zipDirectory(sourceDir, outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, PLUGIN_SLUG);
    archive.finalize();
  });
}

main();
