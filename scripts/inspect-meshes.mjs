import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));

// Let's find all objects that have a property called 'faces' or 'vertices' or 'topology'
for (const arr of data._objectsArrays || []) {
  for (const k of Object.keys(arr)) {
    const item = arr[k];
    if (item && typeof item === 'object') {
      const keys = Object.keys(item);
      if (keys.some(k => k.includes('Mesh') || k.includes('mesh') || k.includes('face') || k.includes('Face') || k.includes('Topology'))) {
        console.log('Object', k, 'class:', item._class, 'name:', item._name, 'keys:', keys);
      }
    }
  }
}

