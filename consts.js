const Consts = {
    Hubs: {
        UNKNOWN: 0,
        WEDO2_SMART_HUB: 1,
        BOOST_MOVE_HUB: 2,
        POWERED_UP_HUB: 3
    },
    Devices: {
        WEDO2_MOTOR: 1,
        BOOST_LED: 22,
        WEDO2_TILT: 34,
        WEDO2_DISTANCE: 35,
        BOOST_DISTANCE: 37,
        BOOST_INTERACTIVE_MOTOR: 38,
        BOOST_MOVE_HUB_MOTOR: 39,
        BOOST_TILT: 40
    },
    BLE: {
        Name: {
            WEDO2_SMART_HUB_NAME: "LPF2 Smart Hub 2 I/O",
            BOOST_MOVE_HUB_NAME: "LEGO Move Hub"
        },
        Services: {
            WEDO2_SMART_HUB: "000015231212efde1523785feabcd123",
            BOOST_MOVE_HUB: "000016231212efde1623785feabcd123"
        },
        Characteristics: {
            WeDo2: {
                BATTERY: "2a19",
                BUTTON: "000015261212efde1523785feabcd123", // "1526"
                PORT_TYPE: "000015271212efde1523785feabcd123", // "1527" // Handles plugging and unplugging of devices on WeDo 2.0 Smart Hub
                LOW_VOLTAGE_ALERT: "000015281212efde1523785feabcd123", // "1528"
                HIGH_CURRENT_ALERT: "000015291212efde1523785feabcd123", // "1529"
                LOW_SIGNAL_ALERT: "0000152a1212efde1523785feabcd123", // "152a"
                SENSOR_VALUE: "000015601212efde1523785feabcd123", // "1560"
                VALUE_FORMAT: "000015611212efde1523785feabcd123", // "1561"
                PORT_TYPE_WRITE: "000015631212efde1523785feabcd123", // "1563"
                MOTOR_VALUE_WRITE: "000015651212efde1523785feabcd123", // "1565"
                NAME_ID: "000015241212efde1523785feabcd123", // "1524"
            },
            Boost: {
                ALL: "000016241212efde1623785feabcd123"
            }
        }
    }
}

module.exports = Consts;