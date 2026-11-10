import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));

for (const arr of data._objectsArrays || []) {
  for (const k of Object.keys(arr)) {
    const item = arr[k];
    if (item && item._name === '前片' && item._class === 3066423086) {
      console.log('Front panel properties:');
      for (const prop of Object.keys(item)) {
        console.log(prop, ':', typeof item[prop] === 'object' ? JSON.stringify(item[prop]).slice(0, 100) : item[prop]);
      }
    }
  }
}

