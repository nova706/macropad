var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
    name: 'Adafruit Macropad',
    description: 'Service for managing communication to/from the Adafruit Macropad.',
    script: require('path').join(__dirname, 'index.js')
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
});

svc.install();
