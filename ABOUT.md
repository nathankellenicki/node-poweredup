[![CircleCI](https://circleci.com/gh/nathankellenicki/node-poweredup.svg?style=shield)](https://circleci.com/gh/nathankellenicki/node-poweredup)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/node-poweredup?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
![NPM Version](https://img.shields.io/npm/v/node-poweredup.svg?style=flat)

# **node-poweredup** - A Node.js module to interface with LEGO Powered UP components.

### Introduction

LEGO Powered UP is the successor to Power Functions, the system for adding electronics to LEGO models. Powered UP is a collection of ranges - starting with LEGO WeDo 2.0 released in 2016, LEGO Boost released in 2017, and LEGO Powered UP released in 2018. It also includes the 2018 Duplo App-Controlled Train sets.

Powered UP has a few improvements over Power Functions:

1. The use of Bluetooth Low Energy makes it easy to control from a computer, and even write code for.

2. The ability to use sensors to react to events happening in the real world opens up a whole new world of possibilities.

3. As Powered UP hubs and remotes pair with each other, the system allows for a near unlimited number of independently controlled models in the same room. Power Functions was limited to 8 due to the use of infra-red for communication.

### Installation

Node.js v8.0 required.

```javascript
npm install node-poweredup --save
```

node-poweredup uses the Noble BLE library by Sandeep Mistry. On macOS everything should function out of the box. On Linux and Windows there are [certain dependencies which may need installed first](https://github.com/noble/noble#prerequisites).

Note: node-poweredup has been tested on macOS 10.13 and Debian/Raspbian on the Raspberry Pi 3 Model B.

### Compatibility

While most Powered UP components and Hubs are compatible with each other, there are exceptions. For example, there is limited backwards compatibility between newer components and the WeDo 2.0 Smart Hub. However WeDo 2.0 components are fully forwards compatible with newer Hubs.

| Name                            | Type          | WeDo 2.0 Smart Hub | Boost Move Hub | Powered UP Hub | Availability |
| ------------------------------- | ------------- | ------------------ | -------------- | -------------- | ------------ |
| WeDo 2.0 Tilt Sensor            | Sensor        |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/45300-1/">45300</a> |
| WeDo 2.0 Motion Sensor          | Sensor        |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/45300-1/">45300</a> |
| WeDo 2.0 Medium Motor           | Motor         |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/45300-1/">45300</a><br /> <a href="https://brickset.com/sets/76112-1/">76112</a> |
| Boost Color and Distance Sensor | Sensor        |     *Partial*    |       Yes      |       Yes      | <a href="https://brickset.com/sets/17101-1/">17101</a> |
| Boost Tacho Motor  | Motor/Sensor  |     *Partial*    |       Yes      |       *Partial*      | <a href="https://brickset.com/sets/17101-1/">17101</a> |
| Powered UP Train Motor          | Motor         |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/60197-1/">60197</a><br /><a href="https://brickset.com/sets/60198-1/">60198</a> |
| Powered UP LED Lights           | Light         |       Yes      |     Yes    |     Yes    | <a href="https://brickset.com/sets/88005-1/">88005</a> |


### Known Issues and Limitations

* The Boost Color and Distance sensor only works in color mode with the WeDo 2.0 Smart Hub.

* When used with the WeDo 2.0 Smart Hub, the Boost Tacho Motor does not support rotating the motor by angle.

* When used with the Powered UP Hub, the Boost Tacho Motor does not support rotating the motor by angle. It also does not support rotation detection.

* Plugging two Boost Tacho Motors into the Powered UP Hub will crash the Hub (This requires a firmware update from LEGO to fix).

### Usage

```javascript
const PoweredUP = require("node-poweredup");
const poweredUP = new PoweredUP.PoweredUP();

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    await hub.connect(); // Connect to the Hub
    await hub.sleep(3000); // Sleep for 3 seconds before starting

    while (true) { // Repeat indefinitely
        hub.setMotorSpeed("B", 75); // Start a motor attached to port B to run a 3/4 speed (75) indefinitely
        await hub.setMotorSpeed("A", 100,  2000); // Run a motor attached to port A for 2 seconds at maximum speed (100) then stop
        await hub.sleep(1000); // Do nothing for 1 second
        await hub.setMotorSpeed("A", -50,  1000); // Run a motor attached to port A for 1 second at 1/2 speed in reverse (-50) then stop
        await hub.sleep(1000); // Do nothing for 1 second
    }
});

poweredUP.scan(); // Start scanning for Hubs
```

More examples are available in the "examples" directory.

### Credits

Thanks go to Jorge Pereira ([@JorgePe](https://github.com/JorgePe)), Sebastian Raff ([@hobbyquaker](https://github.com/hobbyquaker)), Valentin Heun ([@vheun](https://github.com/vheun)), Johan Korten ([@jakorten](https://github.com/jakorten)), and Andrey Pokhilko ([@undera](https://github.com/undera)) for their various works, contributions, and assistance on figuring out the LEGO Boost, WeDo 2.0, and Powered UP protocols.

