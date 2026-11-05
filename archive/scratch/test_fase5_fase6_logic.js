/**
 * Prototype & Verification of Fase 5 & Fase 6 functions
 */

const assert = require('assert');

// 1. Data Masking Test
const unmaskedRecords = new Set();
function formatMaskedNIK(nik, regId) {
    if (!nik) return '••••••••••••••••';
    if (unmaskedRecords.has(regId)) return nik;
    const str = String(nik);
    if (str.length < 8) return '••••••••';
    return str.substring(0, 4) + ' •••• •••• ' + str.substring(str.length - 4);
}

const masked = formatMaskedNIK('3276011205800001', 'REG-SDW-2701');
console.log('Masked NIK:', masked);
assert.strictEqual(masked, '3276 •••• •••• 0001');

unmaskedRecords.add('REG-SDW-2701');
const unmasked = formatMaskedNIK('3276011205800001', 'REG-SDW-2701');
console.log('Unmasked NIK:', unmasked);
assert.strictEqual(unmasked, '3276011205800001');

// 2. Severity Categorization Test
function inferSeverity(action) {
    const act = String(action).toUpperCase();
    if (act.includes('VERIFY_PAYMENT') || act.includes('UNMASK') || act.includes('LOCK') || act.includes('SECURITY') || act.includes('INIT_DB')) {
        return 'CRITICAL';
    } else if (act.includes('REJECT') || act.includes('RESET') || act.includes('ASSIGN') || act.includes('BATCH')) {
        return 'WARNING';
    } else {
        return 'INFO';
    }
}

assert.strictEqual(inferSeverity('UNMASK_SENSITIVE_DATA'), 'CRITICAL');
assert.strictEqual(inferSeverity('VERIFY_PAYMENT'), 'CRITICAL');
assert.strictEqual(inferSeverity('REJECT_DOCUMENT'), 'WARNING');
assert.strictEqual(inferSeverity('CREATE_LEAD'), 'INFO');
console.log('Severity inference passed!');

// 3. Logistics Calculation Test
const sampleLogistics = [
  { regId: 'REG-1', koper: true, kabin: true, ihram: true, batik: true, bukuId: true },
  { regId: 'REG-2', koper: false, kabin: true, ihram: true, batik: true, bukuId: true }
];
const lengkapCount = sampleLogistics.filter(l => l.koper && l.kabin && l.ihram && l.batik && l.bukuId).length;
console.log('Lengkap count:', lengkapCount, 'of', sampleLogistics.length);
assert.strictEqual(lengkapCount, 1);

console.log('All logic prototype tests passed 100%!');

