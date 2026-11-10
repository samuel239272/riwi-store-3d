import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));

for (const arr of data._objectsArrays || []) {
  if (arr['586']) {
    console.log('586:', arr['586']);
    const geoMeshId = arr['586'].geoMesh;
    console.log('geoMesh ID:', geoMeshId);
    // Find object with _id === geoMeshId
    for (const arr2 of data._objectsArrays) {
      for (const k of Object.keys(arr2)) {
        if (arr2[k]?._id === geoMeshId) {
          console.log('Found geoMesh object:', arr2[k]);
        }
      }
    }
  }
}

