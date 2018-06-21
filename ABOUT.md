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

|                                 |  Type  | WeDo 2.0 Smart Hub | Boost Move Hub | Powered Up Hub |
| ------------------------------- | ------ | ------------------ | -------------- | -------------- |
| WeDo 2.0 Tilt Sensor            | Sensor |         Yes        |       Yes      |       Yes      |
| WeDo 2.0 Distance Sensor        | Sensor |         Yes        |       Yes      |       Yes      |
| WeDo 2.0 Medium Motor           | Motor  |         Yes        |       Yes      |       Yes      |
| Boost Color and Distance Sensor | Sensor |      *Some (<a href="#compatibility-note-1">1</a>)*    |       Yes      |       Yes      |
| Boost Interactive Medium Motor  | Motor  |      *Some (<a href="#compatibility-note-2">2</a>)*    |       Yes      |       Yes      |
| Powered Up Train Motor          | Motor  |         Yes        |       Yes      |       Yes      |

<a name="compatibility-note-1"></a><sub>(1) Only color mode is supported on the WeDo 2.0 Smart Hub at this point.</sub>

<a name="compatibility-note-2"></a><sub>(2) Only basic motor functionality is supported on the WeDo 2.0 Smart Hub at this point. No interactive functionality. In short, it functions like the WeDo 2.0 Medium Motor.</sub>

### Usage

```javascript
const LPF2 = require("node-lpf2").LPF2;
const lpf2 = new LPF2();
```

Examples are available in the "examples" directory.
