/**
 * Syntax and structural verification for the 13 backend .gs files
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const backendFiles = [
  '00_Config.gs',
  '01_Utils.gs',
  '02_AuditLogger.gs',
  '03_ApiRouter.gs',
  '04_AuthRbacService.gs',
  '05_CrmSalesService.gs',
  '06_PackagesDepartures.gs',
  '07_RegistrationsPilgrims.gs',
  '08_FinanceEscrowService.gs',
  '09_OperationsFieldService.gs',
  '10_CertificatesBadalService.gs',
  '11_ProfileInstitutional.gs',
  '12_ContactSocialHelpdesk.gs',
  '99_DatabaseSetup.gs'
];

console.log('Testing syntax of', backendFiles.length, 'Apps Script files...');

let hasErrors = false;

backendFiles.forEach(file => {
  const filePath = path.join('backend', file);
  if (!fs.existsSync(filePath)) {
    console.error('❌ File missing:', filePath);
    hasErrors = true;
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    // Check syntax with Node VM
    new vm.Script(content, { filename: file });
    console.log('✅ Syntax OK:', file, '(' + (content.length / 1024).toFixed(1) + ' KB)');
  } catch (err) {
    console.error('❌ Syntax Error in', file, ':', err.message);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('\n💥 Syntax check failed!');
  process.exit(1);
} else {
  console.log('\n🎉 ALL 14 BACKEND FILES PASSED SYNTAX CHECK 100%!');
}
