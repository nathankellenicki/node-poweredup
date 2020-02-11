/**
 * @typedef HubType
 * @property {number} UNKNOWN 0
 * @property {number} WEDO2_SMART_HUB 1
 * @property {number} MOVE_HUB 2
 * @property {number} POWERED_UP_HUB 3
 * @property {number} POWERED_UP_REMOTE 4
 * @property {number} DUPLO_TRAIN_HUB 5
 * @property {number} CONTROL_PLUS_HUB 6
 */
export enum HubType {
    UNKNOWN = 0,
    WEDO2_SMART_HUB = 1,
    MOVE_HUB = 2,
    HUB = 3,
    REMOTE_CONTROL = 4,
    DUPLO_TRAIN_BASE = 5,
    TECHNIC_MEDIUM_HUB = 6
}


// tslint:disable-next-line
export const HubTypeNames = HubType;


/**
 * @typedef DeviceType
 * @property {number} UNKNOWN 0
 * @property {number} SIMPLE_MEDIUM_LINEAR_MOTOR 1
 * @property {number} TRAIN_MOTOR 2
 * @property {number} LED_LIGHTS 8
 * @property {number} VOLTAGE 20
 * @property {number} CURRENT 21
 * @property {number} PIEZO_TONE 22
 * @property {number} RGB_LIGHT 23
 * @property {number} WEDO2_TILT 34
 * @property {number} WEDO2_DISTANCE 35
 * @property {number} COLOR_DISTANCE_SENSOR 37
 * @property {number} MEDIUM_LINEAR_MOTOR 38
 * @property {number} MOVE_HUB_MEDIUM_LINEAR_MOTOR 39
 * @property {number} BOOST_TILT 40
 * @property {number} DUPLO_TRAIN_BASE_MOTOR 41
 * @property {number} DUPLO_TRAIN_BASE_SPEAKER 42
 * @property {number} DUPLO_TRAIN_BASE_COLOR 43
 * @property {number} DUPLO_TRAIN_BASE_SPEEDOMETER 44
 * @property {number} CONTROL_PLUS_LARGE_MOTOR 46
 * @property {number} CONTROL_PLUS_XLARGE_MOTOR 47
 * @property {number} POWERED_UP_REMOTE_BUTTON 55
 * @property {number} RSSI 56
 * @property {number} CONTROL_PLUS_ACCELEROMETER 58
 * @property {number} CONTROL_PLUS_TILT 59
 */
export enum DeviceType {
    UNKNOWN = 0,
    SIMPLE_MEDIUM_LINEAR_MOTOR = 1,
    TRAIN_MOTOR = 2,
    LIGHT = 8,
    VOLTAGE_SENSOR = 20,
    CURRENT_SENSOR = 21,
    PIEZO_BUZZER = 22,
    HUB_LED = 23,
    TILT_SENSOR = 34,
    MOTION_SENSOR = 35,
    COLOR_DISTANCE_SENSOR = 37,
    MEDIUM_LINEAR_MOTOR = 38,
    MOVE_HUB_MEDIUM_LINEAR_MOTOR = 39,
    MOVE_HUB_TILT_SENSOR = 40,
    DUPLO_TRAIN_BASE_MOTOR = 41,
    DUPLO_TRAIN_BASE_SPEAKER = 42,
    DUPLO_TRAIN_BASE_COLOR_SENSOR = 43,
    DUPLO_TRAIN_BASE_SPEEDOMETER = 44,
    TECHNIC_LARGE_LINEAR_MOTOR = 46, // Technic Control+
    TECHNIC_XLARGE_LINEAR_MOTOR = 47, // Technic Control+
    TECHNIC_MEDIUM_ANGULAR_MOTOR = 48, // Spike Prime
    TECHNIC_LARGE_ANGULAR_MOTOR = 49, // Spike Prime
    TECHNIC_MEDIUM_HUB_GEST_SENSOR = 54,
    REMOTE_CONTROL_BUTTON = 55,
    REMOTE_CONTROL_RSSI = 56,
    TECHNIC_MEDIUM_HUB_ACCELEROMETER = 57,
    TECHNIC_MEDIUM_HUB_GYRO_SENSOR = 58,
    TECHNIC_MEDIUM_HUB_TILT_SENSOR = 59,
    TECHNIC_MEDIUM_HUB_TEMPERATURE_SENSOR = 60,
    TECHNIC_COLOR_SENSOR = 61, // Spike Prime
    TECHNIC_DISTANCE_SENSOR = 62, // Spike Prime
    TECHNIC_FORCE_SENSOR = 63 // Spike Prime
}


// tslint:disable-next-line
export const DeviceTypeNames = DeviceType;


/**
 * @typedef Color
 * @property {number} BLACK 0
 * @property {number} PINK 1
 * @property {number} PURPLE 2
 * @property {number} BLUE 3
 * @property {number} LIGHT_BLUE 4
 * @property {number} CYAN 5
 * @property {number} GREEN 6
 * @property {number} YELLOW 7
 * @property {number} ORANGE 8
 * @property {number} RED 9
 * @property {number} WHITE 10
 * @property {number} NONE 255
 */
export enum Color {
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


// tslint:disable-next-line
export const ColorNames = Color;


/**
 * @typedef ButtonState
 * @property {number} PRESSED 0
 * @property {number} RELEASED 1
 * @property {number} UP 2
 * @property {number} DOWN 3
 * @property {number} STOP 4
 */
export enum ButtonState {
    PRESSED = 2,
    RELEASED = 0,
    UP = 1,
    DOWN = 255,
    STOP = 127
}


/**
 * @typedef BrakingStyle
 * @property {number} HOLD 127
 * @property {number} BRAKE 128
 */
export enum BrakingStyle {
    FLOAT = 0,
    HOLD = 126,
    BRAKE = 127
}


/**
 * @typedef DuploTrainBaseSound
 * @property {number} BRAKE 3
 * @property {number} STATION_DEPARTURE 5
 * @property {number} WATER_REFILL 7
 * @property {number} HORN 9
 * @property {number} STEAM 10
 */
export enum DuploTrainBaseSound {
    BRAKE = 3,
    STATION_DEPARTURE = 5,
    WATER_REFILL = 7,
    HORN = 9,
    STEAM = 10
}


export enum BLEManufacturerData {
    DUPLO_TRAIN_BASE_ID = 32,
    MOVE_HUB_ID = 64,
    HUB_ID = 65,
    REMOTE_CONTROL_ID = 66,
    TECHNIC_MEDIUM_HUB = 128
}


export enum BLEService {
    WEDO2_SMART_HUB = "00001523-1212-efde-1523-785feabcd123",
    WEDO2_SMART_HUB_2 = "00004f0e-1212-efde-1523-785feabcd123",
    WEDO2_SMART_HUB_3 = "2a19",
    WEDO2_SMART_HUB_4 = "180f",
    WEDO2_SMART_HUB_5 = "180a",
    LPF2_HUB = "00001623-1212-efde-1623-785feabcd123"
}


export enum BLECharacteristic {
    WEDO2_BATTERY = "2a19",
    WEDO2_FIRMWARE_REVISION = "2a26",
    WEDO2_BUTTON = "00001526-1212-efde-1523-785feabcd123", // "1526"
    WEDO2_PORT_TYPE = "00001527-1212-efde-1523-785feabcd123", // "1527" // Handles plugging and unplugging of devices on WeDo 2.0 Smart Hub
    WEDO2_LOW_VOLTAGE_ALERT = "00001528-1212-efde-1523-785feabcd123", // "1528"
    WEDO2_HIGH_CURRENT_ALERT = "00001529-1212-efde-1523-785feabcd123", // "1529"
    WEDO2_LOW_SIGNAL_ALERT = "0000152a-1212-efde-1523-785feabcd123", // "152a",
    WEDO2_DISCONNECT = "0000152b-1212-efde-1523-785feabcd123", // "152b"
    WEDO2_SENSOR_VALUE = "00001560-1212-efde-1523-785feabcd123", // "1560"
    WEDO2_VALUE_FORMAT = "00001561-1212-efde-1523-785feabcd123", // "1561"
    WEDO2_PORT_TYPE_WRITE = "00001563-1212-efde-1523-785feabcd123", // "1563"
    WEDO2_MOTOR_VALUE_WRITE = "00001565-1212-efde-1523-785feabcd123", // "1565"
    WEDO2_NAME_ID = "00001524-1212-efde-1523-785feabcd123", // "1524"
    LPF2_ALL = "00001624-1212-efde-1623-785feabcd123"
}
