const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../archive/raw-assets');
const ASSETS_DIR = path.join(__dirname, '../assets');

async function optimizeAll() {
  console.log('=== STARTING HIGH-EFFICIENCY IMAGE OPTIMIZATION ===\n');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    throw new Error('Backup directory does not exist! Aborting to prevent data loss.');
  }

  const tasks = [
    {
      file: 'hero-haram.png',
      width: 1920,
      generateWebp: true,
      webpQuality: 82,
      pngQuality: 85
    },
    {
      file: 'hero-twilight.jpg',
      width: 1440,
      generateWebp: true,
      webpQuality: 82,
      isJpeg: true,
      jpegQuality: 82
    },
    {
      file: 'pkg-hemat.png',
      width: 1200,
      generateWebp: true,
      webpQuality: 82,
      pngQuality: 85
    },
    {
      file: 'pkg-plus-turki.png',
      width: 1200,
      generateWebp: true,
      webpQuality: 82,
      pngQuality: 85
    },
    {
      file: 'pkg-ramadhan.png',
      width: 1200,
      generateWebp: true,
      webpQuality: 82,
      pngQuality: 85
    },
    {
      file: 'pkg-reguler-syawal.png',
      width: 1200,
      generateWebp: true,
      webpQuality: 82,
      pngQuality: 85
    },
    {
      file: 'pkg-vip-khidmat.png',
      width: 1200,
      generateWebp: true,
      webpQuality: 82,
      pngQuality: 85
    },
    {
      file: 'sdw-logo.png',
      width: 800,
      generateWebp: true,
      webpQuality: 85,
      pngQuality: 90
    },
    {
      file: 'icon-512.png',
      width: 512,
      generateWebp: false,
      pngQuality: 90
    },
    {
      file: 'icon-maskable.png',
      width: 512,
      generateWebp: false,
      pngQuality: 90
    },
    {
      file: 'icon-192.png',
      width: 192,
      generateWebp: false,
      pngQuality: 90
    }
  ];

  let totalBefore = 0;
  let totalAfter = 0;

  for (const t of tasks) {
    const srcPath = path.join(BACKUP_DIR, t.file);
    const destPath = path.join(ASSETS_DIR, t.file);

    if (!fs.existsSync(srcPath)) {
      console.warn('Source file not found:', srcPath);
      continue;
    }

    const beforeSize = fs.statSync(srcPath).size;
    totalBefore += beforeSize;

    // 1. Generate WebP if requested
    if (t.generateWebp) {
      const webpName = t.file.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      const webpDest = path.join(ASSETS_DIR, webpName);
      await sharp(srcPath)
        .resize({ width: t.width, withoutEnlargement: true })
        .webp({ quality: t.webpQuality, effort: 6 })
        .toFile(webpDest);
      const webpSize = fs.statSync(webpDest).size;
      console.log(`  ✓ Created ${webpName.padEnd(24)} : ${(webpSize / 1024).toFixed(1)} KB`);
    }

    // 2. Optimize original format in place
    if (t.isJpeg) {
      const tmpJpeg = destPath + '.tmp';
      await sharp(srcPath)
        .resize({ width: t.width, withoutEnlargement: true })
        .jpeg({ quality: t.jpegQuality, mozjpeg: true })
        .toFile(tmpJpeg);
      fs.renameSync(tmpJpeg, destPath);
    } else {
      const tmpPng = destPath + '.tmp';
      await sharp(srcPath)
        .resize({ width: t.width, withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: true, quality: t.pngQuality })
        .toFile(tmpPng);
      fs.renameSync(tmpPng, destPath);
    }

    const afterSize = fs.statSync(destPath).size;
    totalAfter += afterSize;
    const savings = ((1 - (afterSize / beforeSize)) * 100).toFixed(1);
    console.log(`  ✓ Optimized ${t.file.padEnd(22)} : ${(beforeSize / 1024).toFixed(1)} KB -> ${(afterSize / 1024).toFixed(1)} KB (-${savings}%)`);
  }

  console.log('\n======================================================');
  console.log(`TOTAL ASSET SIZE BEFORE : ${(totalBefore / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`TOTAL ASSET SIZE AFTER  : ${(totalAfter / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`BANDWIDTH SAVINGS       : ${((1 - (totalAfter / totalBefore)) * 100).toFixed(1)}%`);
  console.log('======================================================\n');
}

optimizeAll().catch(err => {
  console.error('Optimization failed:', err);
  process.exit(1);
});

