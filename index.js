const platform = require('connect-platform');


let exposePanel = true;

let port = 4000;
if( process.env.CONNECT_PORT ) {
  port = process.env.CONNECT_PORT;
}

if(
  process.env.CONNECT_PANEL_HIDE &&
  process.env.CONNECT_PANEL_HIDE.toLowerCase() === 'true'
) {
  exposePanel = false;
}

 //
 // lets configure the platform with some presets.
 //
platform
  .configure({
    //
    // set the root directory to current directory.
    //
    root: __dirname,

    //
    // run it by default on port 4000. you can also change this value
    // from within the panel.
    //
    port: port,

    //
    // lets expose the panel to be able to access it.
    //
    panel: {
      expose: exposePanel
    },

    //
    // loading some basic platform modules.
    //
    nodes: {
      module: [
        //
        // this one is the bindings for the panel, and without it the panel
        // would not work properly.
        //
        'connect-platform/platform/bind/panel',

        //
        // this one has some basic utility nodes in it that will come in handy.
        //
        'connect-platform/platform/bind/utils',

        //
        // this one is the stuff generated using the panel, so we obviously need
        // to load them as well.
        //
        'panel-generated',
      ]
    }
  });

//
// lets do some configuration from environment.
// these configurations can be overriden via the platform.
//

//
// lets configure the remote shell.
//
platform.configure({
  'remote-shell': {
    enabled: (process.env.CONNECT_REMOTE_SHELL_ENABLED?
            process.env.CONNECT_REMOTE_SHELL_ENABLED.toLowerCase()=='true':false),
    path: process.env.CONNECT_REMOTE_SHELL_PATH || undefined,
  }
});

//
// now lets try to load the configuration set by the panel.
//
try {
  let panelconf = require('./panel-generated/platform-config');
  platform.configure(panelconf);
} catch(err) {}

//
// and run the configuration script set by the panel.
//
try {
  require('./panel-generated/platform-config.script');
} catch(err) {}

//
// and in case we are running in production environment, lets
// also load the production config overrides.
//
try {
  if (process.env.CONNECT_PRODUCTION_MODE) {
    let prodconf = require('./panel-generated/platform-config.prod');
    platform.configure(prodconf);
  }
} catch(err) {}

//
// set a secret for panel if dictated by the environment variables.
//
if (process.env.CONNECT_PANEL_SECRET)
  platform.configure({
    panel: {
      secret: process.env.CONNECT_PANEL_SECRET
    }
  });

//
// also if the instance is given a name by environment variables, lets
// set it too.
//
if (process.env.CONNECT_PROJECT_NAME)
  platform.configure({
    name: process.env.CONNECT_PROJECT_NAME
  });

//
// in some environments we would need the instance to go to sleep after
// some time of inactivity.
//
if (process.env.CONNECT_INSTANCE_AUTO_SLEEP)
  platform.configure({
    instance_auto_sleep: process.env.CONNECT_INSTANCE_AUTO_SLEEP
  });

//
// finally, start the platform.
//
platform.start()
  .then(server => {
    console.log(`running on http://${server.address().address}` +
                `:${server.address().port}`);
  });
