const fs = require('fs');
const ncp = require('ncp');
const nodemon = require('nodemon');

const checkSamples = () => new Promise(resolve => {
  fs.exists('./panel-generated', exists => {
    if (!exists) resolve(false);
    else
      fs.readdir('./panel-generated', (err, files) => resolve(files.length > 0));
  })
});

const prepare = () => new Promise(resolve => {
  checkSamples().then(exists => {
    if (exists) resolve();
    else {
      console.log('==> POPULATING SAMPLES');
      ncp('./samples', './panel-generated', () => resolve());
    }
  });
});

const run = () => {
  console.log('==> RUNNING PLATFORM');
  nodemon({
    script: 'index.js',
    signal: "SIGTERM"
  });

  nodemon.on('start', () => console.log('starting the platform ...'));
  nodemon.on('crash', () => process.exit(0));
}

prepare().then(run);
