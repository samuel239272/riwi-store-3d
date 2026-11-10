import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));

for (const arr of data._objectsArrays || []) {
  for (const k of Object.keys(arr)) {
    const item = arr[k];
    if (item && item._class === 3066423086) {
      console.log('Piece:', item._name, 'coarseMesh:', item.coarseMesh);
      // Find object for coarseMesh
      for (const arr2 of data._objectsArrays) {
        for (const k2 of Object.keys(arr2)) {
          if (arr2[k2]?._id === item.coarseMesh) {
            console.log('  -> coarseMesh obj:', arr2[k2]);
          }
        }
      }
      break;
    }
  }
}

