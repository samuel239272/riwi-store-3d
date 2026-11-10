import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));

for (const arr of data._objectsArrays || []) {
  for (const k of Object.keys(arr)) {
    const item = arr[k];
    if (item && item._id === 2490) {
      console.log('Object 2490 found! class:', item._class, 'name:', item._name, item);
    }
  }
}

