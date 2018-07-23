# **node-lpf2** - A Node.js module to interface with LEGO Power Functions 2.0 components.

### Installation

Node.js v8.0+ required.

```javascript
npm install node-lpf2 --save
```

node-lpf2 uses the Noble BLE library by Sandeep Mistry. On macOS everything should function out of the box. On Linux and Windows there are [certain dependencies which may need installed first](https://github.com/noble/noble#prerequisites).

Note: node-lpf2 has been tested on macOS 10.13 and Debian/Raspbian on the Raspberry Pi 3 Model B.

### Compatibility

While most LPF2 components and Hubs are compatible with each other, there are exceptions. There is limited backwards compatibility between newer components and the WeDo 2.0 Smart Hub. However WeDo 2.0 components are fully forwards compatible with newer Hubs.

| Name                            | Type          | WeDo 2.0 Smart Hub | Boost Move Hub | Powered Up Hub | Availability |
| ------------------------------- | ------------- | ------------------ | -------------- | -------------- | ------------ |
| WeDo 2.0 Tilt Sensor            | Sensor        |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/45300-1/">45300</a> |
| WeDo 2.0 Motion Sensor          | Sensor        |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/45300-1/">45300</a> |
| WeDo 2.0 Medium Motor           | Motor         |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/45300-1/">45300</a><br /> <a href="https://brickset.com/sets/76112-1/">76112</a> |
| Boost Color and Distance Sensor | Sensor        |     *Partial*    |       Yes      |       Yes      | <a href="https://brickset.com/sets/17101-1/">17101</a> |
| Boost Interactive Motor  | Motor/Sensor  |     *Partial*    |       Yes      |       No      | <a href="https://brickset.com/sets/17101-1/">17101</a> |
| Powered Up Train Motor          | Motor         |         Yes        |       Yes      |       Yes      | <a href="https://brickset.com/sets/60197-1/">60197</a><br /><a href="https://brickset.com/sets/60198-1/">60198</a> |
| Powered Up LED Lights           | Light         |       Unknown      |     Unknown    |     Unknown    | <a href="https://brickset.com/sets/88005-1/">88005</a> |


<a name="compatibility-note-2"></a><sub>(2) When used with the WeDo 2.0 Smart Hub, the Boost Interactive Medium Motor functions like the WeDo 2.0 Medium Motor - that is, only basic constant speed is possible. However the rotation sensing functionality is supported.</sub>

### Known Issues and Limitations

* The Powered Up Remote is compatible with this library for the purpose of detecting button presses, however unlike other Hubs, it is currently not possible to change the color of the LED light.

* The Boost Color and Distance sensor only works in color mode with the WeDo 2.0 Smart Hub.

* When used with the WeDo 2.0 Smart Hub, the Boost Interactive Motor does not support rotating the motor by angle or by time. Only constant speed is supported. However angle detection is supported.

* The Boost Interactive Motor does not currently function with the Powered Up Hub in any fashion.

### Usage

```javascript
const LPF2 = require("node-lpf2").LPF2;
const lpf2 = new LPF2();
```

Examples are available in the "examples" directory.

### Credits

Thanks go to Jorge Pereira ([@JorgePe](https://github.com/JorgePe)), Sebastian Raff ([@hobbyquaker](https://github.com/hobbyquaker)), Valentin Heun ([@vheun](https://github.com/vheun)), and Johan Korten ([@jakorten](https://github.com/jakorten)) for their various works and assistance on figuring out the LEGO Boost, WeDo 2.0, and Powered Up protocols.

