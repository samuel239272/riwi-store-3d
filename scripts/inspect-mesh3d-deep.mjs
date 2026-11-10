import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));

function findObj(id) {
  for (const arr of data._objectsArrays) {
    for (const k of Object.keys(arr)) {
      if (arr[k]?._id === id) return arr[k];
    }
  }
}

for (const arr of data._objectsArrays) {
  for (const k of Object.keys(arr)) {
    const item = arr[k];
    if (item && item._class === 1046017113) {
      console.log('Mesh3D found:', item._name, 'id:', item._id);
      console.log('  positions:', item.positions);
      console.log('  transform obj:', findObj(item.transform));
      console.log('  arrangeData obj:', findObj(item.arrangeData));
      break;
    }
  }
}

