import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));
const obj = data._objectsArrays[13]['186'];
console.log('Object 186:', Object.keys(obj));
console.log('Name:', obj._name, 'class:', obj._class);
console.log('Sample properties:');
for (const k of Object.keys(obj)) {
  if (typeof obj[k] !== 'object' || Array.isArray(obj[k])) {
    console.log(k, ':', Array.isArray(obj[k]) ? `Array(${obj[k].length})` : obj[k]);
  }
}

