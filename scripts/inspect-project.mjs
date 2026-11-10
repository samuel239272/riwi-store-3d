import fs from 'node:fs';

const text = fs.readFileSync('imported_assets/chaque/project.json', 'utf-8');
const data = JSON.parse(text);

function searchObjects(obj, targetKey, results = []) {
  if (!obj || typeof obj !== 'object') return results;
  for (const k of Object.keys(obj)) {
    if (k.toLowerCase().includes(targetKey.toLowerCase())) {
      results.push({ key: k, val: obj[k] });
    }
    if (typeof obj[k] === 'object') {
      searchObjects(obj[k], targetKey, results);
    }
  }
  return results;
}

const meshes = searchObjects(data, 'Mesh');
console.log('Found Mesh references:', meshes.length);
if (meshes.length > 0) {
  console.log('Sample Mesh reference:');
  console.log(JSON.stringify(meshes[0], null, 2).slice(0, 500));
}

const verts = searchObjects(data, 'vertices');
console.log('Found vertices references:', verts.length);
if (verts.length > 0) {
  console.log('Sample vertices reference:');
  console.log(JSON.stringify(verts[0], null, 2).slice(0, 500));
}

