# **node-poweredup** - A Node.js module to interface with LEGO Powered UP components.

### Installation

Node.js v8.0+ required.

```javascript
npm install node-poweredup --save
```

node-poweredup uses the Noble BLE library by Sandeep Mistry. On macOS everything should function out of the box. On Linux and Windows there are [certain dependencies which may need installed first](https://github.com/noble/noble#prerequisites).

Note: node-poweredup has been tested on macOS 10.13 and Debian/Raspbian on the Raspberry Pi 3 Model B.

### Compatibility

While most Powered UP components and Hubs are compatible with each other, there are exceptions. For example, there is limited backwards compatibility between newer components and the WeDo 2.0 Smart Hub. However WeDo 2.0 components are fully forwards compatible with newer Hubs.

| Name                            | Type          | WeDo 2.0 Smart Hub | Boost Move Hub | Powered Up Hub | Availability |
| ------------------------------- | ------------- | ------------------ | -------------- | -------------- | ------------ |
| WeDo 2.0 Tilt Sensor            | Sensor        |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/45300-1/">45300</a> |
| WeDo 2.0 Motion Sensor          | Sensor        |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/45300-1/">45300</a> |
| WeDo 2.0 Medium Motor           | Motor         |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/45300-1/">45300</a><br /> <a href="https://brickset.com/sets/76112-1/">76112</a> |
| Boost Color and Distance Sensor | Sensor        |     *Partial*    |       Yes      |       Yes      | <a href="https://brickset.com/sets/17101-1/">17101</a> |
| Boost Tacho Motor  | Motor/Sensor  |     *Partial*    |       Yes      |       *Partial*      | <a href="https://brickset.com/sets/17101-1/">17101</a> |
| Powered Up Train Motor          | Motor         |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/60197-1/">60197</a><br /><a href="https://brickset.com/sets/60198-1/">60198</a> |
| Powered Up LED Lights           | Light         |       Unknown      |     Unknown    |     Unknown    | <a href="https://brickset.com/sets/88005-1/">88005</a> |


### Known Issues and Limitations

* The Boost Color and Distance sensor only works in color mode with the WeDo 2.0 Smart Hub.

* When used with the WeDo 2.0 Smart Hub, the Boost Interactive Motor does not support rotating the motor by angle.

* When used with the Powered Up Hub, the Boost Interactive Motor does not support rotating the motor by angle. It also does not support rotation detection.

* Plugging two Boost Interactive Motors into the Powered Up Hub will crash the Hub (This requires a firmware update from LEGO to fix).

### Usage

```javascript
const PoweredUP = require("node-poweredup");
const pup = new PoweredUP.PoweredUP();
```

Examples are available in the "examples" directory.

### Credits

Thanks go to Jorge Pereira ([@JorgePe](https://github.com/JorgePe)), Sebastian Raff ([@hobbyquaker](https://github.com/hobbyquaker)), Valentin Heun ([@vheun](https://github.com/vheun)), Johan Korten ([@jakorten](https://github.com/jakorten)), and Andrey Pokhilko ([@undera](https://github.com/undera)) for their various works, contributions, and assistance on figuring out the LEGO Boost, WeDo 2.0, and Powered Up protocols.

