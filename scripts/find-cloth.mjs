import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));

for (const arr of data._objectsArrays || []) {
  for (const k of Object.keys(arr)) {
    const item = arr[k];
    if (item && item._name && (
      item._name.toLowerCase().includes('cloth') || 
      item._name.toLowerCase().includes('jacket') || 
      item._name.toLowerCase().includes('piece') ||
      item._name.includes('版片') || 
      item._name.includes('衣')
    )) {
      console.log('Cloth item:', item._name, 'class:', item._class, 'keys:', Object.keys(item).slice(0, 10));
    }
  }
}

