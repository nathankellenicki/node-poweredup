[![Drone](https://drone.kellenicki.com/api/badges/nkellenicki/node-poweredup/status.svg)](https://drone.kellenicki.com/nkellenicki/node-poweredup)
[![NPM Version](https://img.shields.io/npm/v/node-poweredup.svg?style=flat)](https://www.npmjs.com/package/node-poweredup)

# **node-poweredup** - A Javascript module to interface with LEGO Powered Up components.

### Introduction

LEGO Powered Up is the successor to Power Functions, the system for adding electronics to LEGO models. Powered Up is a collection of ranges - starting with LEGO WeDo 2.0 released in 2016, LEGO Boost released in 2017, LEGO Powered Up released in 2018, and LEGO Technic CONTROL+ released in 2019. It also includes the 2018 Duplo App-Controlled Train sets.

This library allows communication and control of Powered Up devices and peripherals via Javascript, both from Node.js and from the browser using Web Bluetooth.

### Node.js Installation

Node.js v8.0 required.

```javascript
npm install node-poweredup --save
```

node-poweredup uses the Noble BLE library by Sandeep Mistry. On macOS everything should function out of the box. On Linux and Windows there are [certain dependencies which may need installed first](https://github.com/noble/noble#prerequisites).

Note: node-poweredup has been tested on macOS 10.13 and Debian/Raspbian on the Raspberry Pi 3 Model B.

### Compatibility

While most Powered Up components and Hubs are compatible with each other, there are exceptions. For example, there is limited backwards compatibility between newer components and the WeDo 2.0 Smart Hub. However WeDo 2.0 components are fully forwards compatible with newer Hubs.

| Device Name                     | Product Code | Type          | WeDo 2.0 Smart Hub | Boost Move Hub | Powered Up Hub | Control+ Hub | Availability |
| ------------------------------- | ------------ | ------------- | ------------------ | -------------- | -------------- | ------------ | ----- |
| WeDo 2.0 Tilt Sensor            | <a href="https://brickset.com/sets/45305-1/">45305</a>        | Sensor        |         Yes        |       Yes      |       Yes      | Yes | <a href="https://brickset.com/sets/45300-1/">45300</a> |
| WeDo 2.0 Motion Sensor          | <a href="https://brickset.com/sets/45304-1/">45304</a>        | Sensor        |         Yes        |       Yes      |       Yes      | Yes | <a href="https://brickset.com/sets/45300-1/">45300</a> |
| WeDo 2.0 Medium Motor           | <a href="https://brickset.com/sets/45303-1/">45303</a>        | Motor         |         Yes        |       Yes      |       Yes      | Yes | <a href="https://brickset.com/sets/45300-1/">45300</a><br /> <a href="https://brickset.com/sets/76112-1/">76112</a> |
| Boost Color and Distance Sensor | <a href="https://brickset.com/sets/88007-1/">88007</a>        | Sensor        |     *Partial*    |       Yes      |       Yes      | Yes | <a href="https://brickset.com/sets/17101-1/">17101</a> |
| Boost Tacho Motor               | <a href="https://brickset.com/sets/88008-1/">88008</a>        | Motor/Sensor  |     *Partial*    |       Yes      |       Yes      | Yes | <a href="https://brickset.com/sets/17101-1/">17101</a> |
| Powered Up Train Motor          | <a href="https://brickset.com/sets/88011-1/">88011</a>        | Motor         |         Yes        |       Yes      |       Yes      | Yes | <a href="https://brickset.com/sets/60197-1/">60197</a><br /><a href="https://brickset.com/sets/60198-1/">60198</a> |
| Powered Up LED Lights           | <a href="https://brickset.com/sets/88005-1/">88005</a>        | Light         |       Yes      |     Yes    |     Yes    | Yes | <a href="https://brickset.com/sets/88005-1/">88005</a> |
| Control+ Large Motor            | 22169        | Motor/Sensor  |       *Partial*      |     No    |     Yes    | Yes | <a href="https://brickset.com/sets/42099-1/">42099</a><br /><a href="https://brickset.com/sets/42100-1/">42100</a> |
| Control+ XLarge Motor            | 22172        | Motor/Sensor  |       *Partial*      |     No    |     Yes    | Yes | <a href="https://brickset.com/sets/42099-1/">42099</a><br /><a href="https://brickset.com/sets/42100-1/">42100</a> |

In addition, the Hubs themselves have certain built-in features which this library exposes.

| Hub Name           | Product Code | Built-In Features      | Availability |
| ------------------ | ------------ | ---------------------- | ------------ |
| WeDo 2.0 Smart hub | <a href="https://brickset.com/sets/45301-1/">45301</a> | RGB LED<br />Piezo Buzzer<br />Button                  | <a href="https://brickset.com/sets/45300-1/">45300</a> |
| Boost Move Hub     | <a href="https://brickset.com/sets/88006-1/">88006</a> | RGB LED<br />Tilt Sensor<br />2x Tacho Motors<br />Button               | <a href="https://brickset.com/sets/17101-1/">17101</a> |
| Powered Up Hub     | <a href="https://brickset.com/sets/88009-1/">88009</a> | RGB LED<br />Button                                                     | <a href="https://brickset.com/sets/60197-1/">60197</a><br /><a href="https://brickset.com/sets/60198-1/">60198</a><br /><a href="https://brickset.com/sets/76112-1/">76112</a> |
| Powered Up Remote  | <a href="https://brickset.com/sets/88010-1/">88010</a> | RGB LED<br />Left and Right Control Buttons<br />Button                 | <a href="https://brickset.com/sets/60197-1/">60197</a><br /><a href="https://brickset.com/sets/60198-1/">60198</a> |
| Duplo Train Base   | 28743 | RGB LED/Headlights<br />Speaker<br />Speedometer<br />Motor<br />Color and Distance Sensor<br />Button | <a href="https://brickset.com/sets/10874-1/">10874</a><br /><a href="https://brickset.com/sets/10875-1/">10875</a> |
| Control+ Hub     | 22127 | RGB LED<br />Button<br />Tilt Sensor<br />Accelerometer                                                     | <a href="https://brickset.com/sets/42099-1/">42099</a><br /><a href="https://brickset.com/sets/42100-1/">42100</a> |

### Known Issues and Limitations

* The Boost Color and Distance sensor only works in color mode with the WeDo 2.0 Smart Hub.

* When used with the WeDo 2.0 Smart Hub, the Boost Tacho Motor and Control+ Motors do not support rotating the motor by angle.

* When used with the Boost Move Hub, the Control+ Motors do not currently accept commands.

### Documentation

[Full documentation is available here.](https://nathankellenicki.github.io/node-poweredup/)

### Node.js Sample Usage

```javascript
const PoweredUP = require("node-poweredup");
const poweredUP = new PoweredUP.PoweredUP();

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    console.log(`Discovered ${hub.name}!`);
    await hub.connect(); // Connect to the Hub
    console.log("Connected");
    await hub.sleep(3000); // Sleep for 3 seconds before starting

    while (true) { // Repeat indefinitely
        console.log("Running motor B at speed 75");
        hub.setMotorSpeed("B", 75); // Start a motor attached to port B to run a 3/4 speed (75) indefinitely
        console.log("Running motor A at speed 100 for 2 seconds");
        await hub.setMotorSpeed("A", 100,  2000); // Run a motor attached to port A for 2 seconds at maximum speed (100) then stop
        await hub.sleep(1000); // Do nothing for 1 second
        console.log("Running motor A at speed -50 for 1 seconds");
        await hub.setMotorSpeed("A", -50,  1000); // Run a motor attached to port A for 1 second at 1/2 speed in reverse (-50) then stop
        await hub.sleep(1000); // Do nothing for 1 second
    }
});

poweredUP.scan(); // Start scanning for Hubs
console.log("Scanning for Hubs...");
```

More examples are available in the "examples" directory.

### Credits

Thanks go to Jorge Pereira ([@JorgePe](https://github.com/JorgePe)), Sebastian Raff ([@hobbyquaker](https://github.com/hobbyquaker)), Valentin Heun ([@vheun](https://github.com/vheun)), Johan Korten ([@jakorten](https://github.com/jakorten)), and Andrey Pokhilko ([@undera](https://github.com/undera)) for their various works, contributions, and assistance on figuring out the LEGO Boost, WeDo 2.0, and Powered Up protocols.

