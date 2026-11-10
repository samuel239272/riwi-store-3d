import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));

function findObj(id) {
  for (const arr of data._objectsArrays) {
    for (const k of Object.keys(arr)) {
      if (arr[k]?._id === id) return arr[k];
    }
  }
}

// Find references to dynamic meshes
const dynamicMeshIds = [9798, 9799, 9800, 9801, 9802, 9803, 9805, 9319, 9589];

for (const arr of data._objectsArrays) {
  for (const k of Object.keys(arr)) {
    const item = arr[k];
    if (!item) continue;
    for (const prop of Object.keys(item)) {
      if (dynamicMeshIds.includes(item[prop])) {
        console.log(`Referenced by ${item._name} (${item._class}) via ${prop}:`, item.transform ? findObj(item.transform) : 'no tf');
      }
    }
  }
}

