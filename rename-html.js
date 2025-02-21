const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const oldFile = path.join(buildDir, 'index.html');
const newFile = path.join(buildDir, 'FGOCanItFarmReactApp.html');

fs.rename(oldFile, newFile, (err) => {
  if (err) throw err;
  console.log('index.html has been renamed to FGOCanItFarmReactApp.html');
});