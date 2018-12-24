export enum Hubs {
    UNKNOWN = 0,
    WEDO2_SMART_HUB = 1,
    BOOST_MOVE_HUB = 2,
    POWERED_UP_HUB = 3,
    POWERED_UP_REMOTE = 4,
    DUPLO_TRAIN_HUB = 5
}


export enum Devices {
    UNKNOWN = 0,
    BASIC_MOTOR = 1,
    TRAIN_MOTOR = 2,
    LED_LIGHTS = 8,
    BOOST_LED = 22,
    WEDO2_TILT = 34,
    WEDO2_DISTANCE = 35,
    BOOST_DISTANCE = 37,
    BOOST_TACHO_MOTOR = 38,
    BOOST_MOVE_HUB_MOTOR = 39,
    BOOST_TILT = 40,
    DUPLO_TRAIN_BASE_MOTOR = 41,
    DUPLO_TRAIN_BASE_SPEAKER = 42,
    DUPLO_TRAIN_BASE_COLOR = 43,
    DUPLO_TRAIN_BASE_SPEEDOMETER = 44,
    POWERED_UP_REMOTE_BUTTON = 55
}


export enum Colors {
    BLACK = 0,
    PINK = 1,
    PURPLE = 2,
    BLUE = 3,
    LIGHT_BLUE = 4,
    CYAN = 5,
    GREEN = 6,
    YELLOW = 7,
    ORANGE = 8,
    RED = 9,
    WHITE = 10,
    NONE = 255
}


export enum ButtonStates {
    PRESSED = 0,
    RELEASED = 1,
    UP = 2,
    DOWN = 3,
    STOP = 4
}


export enum DuploTrainBaseSounds {
    BREAK = 3,
    STATION_DEPARTURE = 5,
    WATER_REFILL = 7,
    HORN = 9,
    STEAM = 10
}


export enum BLEManufacturerData {
    BOOST_MOVE_HUB_ID = 64,
    POWERED_UP_HUB_ID = 65,
    POWERED_UP_REMOTE_ID = 66,
    DUPLO_TRAIN_HUB_ID = 32
}


export enum BLEServices {
    WEDO2_SMART_HUB = "00001523-1212-efde-1523-785feabcd123",
    LPF2_HUB = "00001623-1212-efde-1623-785feabcd123"
}


export enum BLECharacteristics {
    WEDO2_BATTERY = "2a19",
    WEDO2_BUTTON = "00001526-1212-efde-1523-785feabcd123", // "1526"
    WEDO2_PORT_TYPE = "00001527-1212-efde-1523-785feabcd123", // "1527" // Handles plugging and unplugging of devices on WeDo 2.0 Smart Hub
    WEDO2_LOW_VOLTAGE_ALERT = "00001528-1212-efde-1523-785feabcd123", // "1528"
    WEDO2_HIGH_CURRENT_ALERT = "00001529-1212-efde-1523-785feabcd123", // "1529"
    WEDO2_LOW_SIGNAL_ALERT = "0000152a-1212-efde-1523-785feabcd123", // "152a"
    WEDO2_SENSOR_VALUE = "00001560-1212-efde-1523-785feabcd123", // "1560"
    WEDO2_VALUE_FORMAT = "00001561-1212-efde-1523-785feabcd123", // "1561"
    WEDO2_PORT_TYPE_WRITE = "00001563-1212-efde-1523-785feabcd123", // "1563"
    WEDO2_MOTOR_VALUE_WRITE = "00001565-1212-efde-1523-785feabcd123", // "1565"
    WEDO2_NAME_ID = "00001524-1212-efde-1523-785feabcd123", // "1524"
    LPF2_ALL = "00001624-1212-efde-1623-785feabcd123"
}
