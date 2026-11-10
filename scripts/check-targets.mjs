import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));

const targets = [
  data._objectsArrays[13]['709'],
  data._objectsArrays[4]['1218'],
  data._objectsArrays[14]['238'],
  data._objectsArrays[15]['436'],
];

for (const t of targets) {
  if (t) console.log(t._id, t._name, t._class, Object.keys(t));
}

