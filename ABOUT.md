# node-lpf2 - A Node.js module to interface with Lego Power Functions 2.0 components.

### Installation

Node.js v8.0+ required.

```javascript
npm install node-lpf2 --save
```

node-lpf2 uses the Noble BLE library by Sandeep Mistry. On macOS everything should function out of the box. On Linux and Windows there are [certain dependencies which may need installed first](https://github.com/sandeepmistry/noble#prerequisites).

Note: node-lpf2 has been tested on macOS 10.11 and Debian/Raspbian on the Raspberry Pi 3 Model B.

### Usage

```javascript
const LPF2 = require("node-lpf2").LPF2;
const lpf2 = new LPF2();
```

Examples are available in the "examples" directory.