import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));
const dm = data._objectsArrays[13]['186'];
console.log('DynamicMesh4 subMeshes IDs:', dm.subMeshes);

for (const subId of dm.subMeshes) {
  for (const arr of data._objectsArrays) {
    for (const k of Object.keys(arr)) {
      if (arr[k]?._id === subId) {
        const sm = arr[k];
        console.log('SubMesh ID:', subId, 'name:', sm._name, 'startFace:', sm.startFace, 'faceCount:', sm.faceCount, 'material:', sm.material);
        // Find material name
        for (const arrMat of data._objectsArrays) {
          for (const km of Object.keys(arrMat)) {
            if (arrMat[km]?._id === sm.material) {
              console.log('  -> Material:', arrMat[km]._name, arrMat[km].diffuseTexture);
            }
          }
        }
      }
    }
  }
}

