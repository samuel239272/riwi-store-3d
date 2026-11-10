import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));

function findObj(id) {
  for (const arr of data._objectsArrays) {
    for (const k of Object.keys(arr)) {
      if (arr[k]?._id === id) return arr[k];
    }
  }
}

for (const id of [3861, 3862, 3863, 3864, 3865, 3866]) {
  const m = findObj(id);
  console.log('Material ID:', id, 'name:', m?._name);
  for (const k of ['diffuseTexture', 'normalTexture', 'roughnessTexture']) {
    if (m && m[k]) {
      const tex = findObj(m[k]);
      console.log(`  ${k}: id=${m[k]}, name=${tex?._name}, textureName=${tex?.textureName}, origin=${tex?.originTextureName}`);
    }
  }
}

