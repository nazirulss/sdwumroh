const fs = require('fs');

const content = fs.readFileSync('js/admin-core.js', 'utf8');
const lines = content.split('\n');

const functions = [];
const funcRegex = /^\s*(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/;

lines.forEach((line, idx) => {
  const match = line.match(funcRegex);
  if (match) {
    functions.push({ name: match[1], line: idx + 1 });
  }
});

console.log(`Found ${functions.length} functions.`);
functions.forEach((f, idx) => {
  const nextLine = idx < functions.length - 1 ? functions[idx + 1].line - 1 : lines.length;
  console.log(`${f.name}: lines ${f.line} - ${nextLine} (${nextLine - f.line + 1} lines)`);
});
