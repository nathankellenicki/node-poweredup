export enum Hubs {
    UNKNOWN = 0,
    WEDO2_SMART_HUB = 1,
    BOOST_MOVE_HUB = 2,
    POWERED_UP_HUB = 3,
    POWERED_UP_REMOTE = 4
}

export enum Devices {
    BASIC_MOTOR = 1,
    BOOST_LED = 22,
    WEDO2_TILT = 34,
    WEDO2_DISTANCE = 35,
    BOOST_DISTANCE = 37,
    BOOST_INTERACTIVE_MOTOR = 38,
    BOOST_MOVE_HUB_MOTOR = 39,
    BOOST_TILT = 40
}

export enum Colors {
    NONE = 0,
    PINK = 1,
    PURPLE = 2,
    BLUE = 3,
    LIGHT_BLUE = 4,
    CYAN = 5,
    GREEN = 6,
    YELLOW = 7,
    ORANGE = 8,
    RED = 9,
    WHITE = 10
}

export enum ButtonStates {
    PRESSED = 0,
    RELEASED = 1
}

export enum BLENames {
    WEDO2_SMART_HUB_NAME = "LPF2 Smart Hub 2 I/O",
    BOOST_MOVE_HUB_NAME = "LEGO Move Hub",
    POWERED_UP_HUB_NAME = "HUB NO.4",
    POWERED_UP_REMOTE_NAME = "Handset"
}

export enum BLEServices {
    WEDO2_SMART_HUB = "000015231212efde1523785feabcd123",
    BOOST_MOVE_HUB = "000016231212efde1623785feabcd123"
}


export enum BLECharacteristics {
    WEDO2_BATTERY = "2a19",
    WEDO2_BUTTON = "000015261212efde1523785feabcd123", // "1526"
    WEDO2_PORT_TYPE = "000015271212efde1523785feabcd123", // "1527" // Handles plugging and unplugging of devices on WeDo 2.0 Smart Hub
    WEDO2_LOW_VOLTAGE_ALERT = "000015281212efde1523785feabcd123", // "1528"
    WEDO2_HIGH_CURRENT_ALERT = "000015291212efde1523785feabcd123", // "1529"
    WEDO2_LOW_SIGNAL_ALERT = "0000152a1212efde1523785feabcd123", // "152a"
    WEDO2_SENSOR_VALUE = "000015601212efde1523785feabcd123", // "1560"
    WEDO2_VALUE_FORMAT = "000015611212efde1523785feabcd123", // "1561"
    WEDO2_PORT_TYPE_WRITE = "000015631212efde1523785feabcd123", // "1563"
    WEDO2_MOTOR_VALUE_WRITE = "000015651212efde1523785feabcd123", // "1565"
    WEDO2_NAME_ID = "000015241212efde1523785feabcd123", // "1524"
    BOOST_ALL = "000016241212efde1623785feabcd123"
}
