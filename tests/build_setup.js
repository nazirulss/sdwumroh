const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.resolve('backend');
const ARCHIVE_CODE = path.resolve('archive/backend_monolith/Code.gs');
const ARCHIVE_SETUP = path.resolve('archive/backend_monolith/Setup.gs');

const code = fs.readFileSync(ARCHIVE_CODE, 'utf8');
const setup = fs.readFileSync(ARCHIVE_SETUP, 'utf8');

const codeLines = code.split('\n');
function sliceCode(start, end) {
  return codeLines.slice(start - 1, end).join('\n');
}

// Extract seedKloter27Oktober2026 from Code.gs (lines 88 to 262)
const kloterSeedCode = sliceCode(87, 262);

// Setup.gs full contents
const file99 = `/**
 * ============================================================================
 * SDW UMROH — DATABASE INFRASTRUCTURE & 23-SHEET CANONICAL SETUP
 * File: 99_DatabaseSetup.gs
 * Version: 2.5.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

` + kloterSeedCode + `

` + setup;

fs.writeFileSync(path.join(BACKEND_DIR, '99_DatabaseSetup.gs'), file99, 'utf8');
console.log('✅ Created 99_DatabaseSetup.gs');
