/**
 * @typedef HubType
 * @property {number} UNKNOWN 0
 * @property {number} WEDO2_SMART_HUB 1
 * @property {number} MOVE_HUB 2
 * @property {number} HUB 3
 * @property {number} REMOTE_CONTROL 4
 * @property {number} DUPLO_TRAIN_BASE 5
 * @property {number} TECHNIC_MEDIUM_HUB 6
 * @property {number} MARIO 7
 * @property {number} TECHNIC_SMALL_HUB 8
 */
export enum HubType {
    UNKNOWN = 0,
    WEDO2_SMART_HUB = 1,
    MOVE_HUB = 2,
    HUB = 3,
    REMOTE_CONTROL = 4,
    DUPLO_TRAIN_BASE = 5,
    TECHNIC_MEDIUM_HUB = 6,
    MARIO = 7,
    TECHNIC_SMALL_HUB = 8,
}


// tslint:disable-next-line
export const HubTypeNames = HubType;


/**
 * @typedef DeviceType
 * @property {number} UNKNOWN 0
 * @property {number} SIMPLE_MEDIUM_LINEAR_MOTOR 1
 * @property {number} TRAIN_MOTOR 2
 * @property {number} LIGHT 8
 * @property {number} VOLTAGE_SENSOR 20
 * @property {number} CURRENT_SENSOR 21
 * @property {number} PIEZO_BUZZER 22
 * @property {number} HUB_LED 23
 * @property {number} TILT_SENSOR 34
 * @property {number} MOTION_SENSOR 35
 * @property {number} COLOR_DISTANCE_SENSOR 37
 * @property {number} MEDIUM_LINEAR_MOTOR 38
 * @property {number} MOVE_HUB_MEDIUM_LINEAR_MOTOR 39
 * @property {number} MOVE_HUB_TILT_SENSOR 40
 * @property {number} DUPLO_TRAIN_BASE_MOTOR 41
 * @property {number} DUPLO_TRAIN_BASE_SPEAKER 42
 * @property {number} DUPLO_TRAIN_BASE_COLOR_SENSOR 43
 * @property {number} DUPLO_TRAIN_BASE_SPEEDOMETER 44
 * @property {number} TECHNIC_LARGE_LINEAR_MOTOR 46
 * @property {number} TECHNIC_XLARGE_LINEAR_MOTOR 47
 * @property {number} TECHNIC_MEDIUM_ANGULAR_MOTOR 48
 * @property {number} TECHNIC_LARGE_ANGULAR_MOTOR 49
 * @property {number} TECHNIC_MEDIUM_HUB_GEST_SENSOR 54
 * @property {number} REMOTE_CONTROL_BUTTON 55
 * @property {number} REMOTE_CONTROL_RSSI 56
 * @property {number} TECHNIC_MEDIUM_HUB_ACCELEROMETER 57
 * @property {number} TECHNIC_MEDIUM_HUB_GYRO_SENSOR 58
 * @property {number} TECHNIC_MEDIUM_HUB_TILT_SENSOR 59
 * @property {number} TECHNIC_MEDIUM_HUB_TEMPERATURE_SENSOR 60
 * @property {number} TECHNIC_COLOR_SENSOR 61
 * @property {number} TECHNIC_DISTANCE_SENSOR 62
 * @property {number} TECHNIC_FORCE_SENSOR 63
 * @property {number} TECHNIC_3X3_COLOR_LIGHT_MATRIX 64
 * @property {number} TECHNIC_SMALL_ANGULAR_MOTOR 65
 * @property {number} MARIO_ACCELEROMETER 71
 * @property {number} MARIO_BARCODE_SENSOR 73
 * @property {number} MARIO_PANTS_SENSOR 74
 * @property {number} TECHNIC_MEDIUM_ANGULAR_MOTOR_GREY 75
 * @property {number} TECHNIC_LARGE_ANGULAR_MOTOR_GREY 76
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
    TECHNIC_FORCE_SENSOR = 63, // Spike Prime
    TECHNIC_3X3_COLOR_LIGHT_MATRIX = 64, // Spike Essential
    TECHNIC_SMALL_ANGULAR_MOTOR = 65, // Spike Essential
    MARIO_ACCELEROMETER = 71,
    MARIO_BARCODE_SENSOR = 73,
    MARIO_PANTS_SENSOR = 74,
    TECHNIC_MEDIUM_ANGULAR_MOTOR_GREY = 75, // Mindstorms
    TECHNIC_LARGE_ANGULAR_MOTOR_GREY = 76, // Technic Control+
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
 * @property {number} PRESSED 2
 * @property {number} RELEASED 0
 * @property {number} UP 1
 * @property {number} DOWN 255
 * @property {number} STOP 127
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
 * @property {number} FLOAT 0
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
    MARIO_ID = 67,
    TECHNIC_MEDIUM_HUB_ID = 128,
    TECHNIC_SMALL_HUB_ID = 131
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


/**
 * @typedef MessageType
 * @property {number} HUB_PROPERTIES 0x01
 * @property {number} HUB_ACTIONS 0x02
 * @property {number} HUB_ALERTS 0x03
 * @property {number} HUB_ATTACHED_IO 0x04
 * @property {number} GENERIC_ERROR_MESSAGES 0x05
 * @property {number} HW_NETWORK_COMMANDS 0x08
 * @property {number} FW_UPDATE_GO_INTO_BOOT_MODE 0x10
 * @property {number} FW_UPDATE_LOCK_MEMORY 0x11
 * @property {number} FW_UPDATE_LOCK_STATUS_REQUEST 0x12
 * @property {number} FW_LOCK_STATUS 0x13
 * @property {number} PORT_INFORMATION_REQUEST 0x21
 * @property {number} PORT_MODE_INFORMATION_REQUEST 0x22
 * @property {number} PORT_INPUT_FORMAT_SETUP_SINGLE 0x41
 * @property {number} PORT_INPUT_FORMAT_SETUP_COMBINEDMODE 0x42
 * @property {number} PORT_INFORMATION 0x43
 * @property {number} PORT_MODE_INFORMATION 0x44
 * @property {number} PORT_VALUE_SINGLE 0x45
 * @property {number} PORT_VALUE_COMBINEDMODE 0x46
 * @property {number} PORT_INPUT_FORMAT_SINGLE 0x47
 * @property {number} PORT_INPUT_FORMAT_COMBINEDMODE 0x48
 * @property {number} VIRTUAL_PORT_SETUP 0x61
 * @property {number} PORT_OUTPUT_COMMAND 0x81
 * @property {number} PORT_OUTPUT_COMMAND_FEEDBACK 0x82
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#message-types
 */
export enum MessageType {
    HUB_PROPERTIES = 0x01,
    HUB_ACTIONS = 0x02,
    HUB_ALERTS = 0x03,
    HUB_ATTACHED_IO = 0x04,
    GENERIC_ERROR_MESSAGES = 0x05,
    HW_NETWORK_COMMANDS = 0x08,
    FW_UPDATE_GO_INTO_BOOT_MODE = 0x10,
    FW_UPDATE_LOCK_MEMORY = 0x11,
    FW_UPDATE_LOCK_STATUS_REQUEST = 0x12,
    FW_LOCK_STATUS = 0x13,
    PORT_INFORMATION_REQUEST = 0x21,
    PORT_MODE_INFORMATION_REQUEST = 0x22,
    PORT_INPUT_FORMAT_SETUP_SINGLE = 0x41,
    PORT_INPUT_FORMAT_SETUP_COMBINEDMODE = 0x42,
    PORT_INFORMATION = 0x43,
    PORT_MODE_INFORMATION = 0x44,
    PORT_VALUE_SINGLE = 0x45,
    PORT_VALUE_COMBINEDMODE = 0x46,
    PORT_INPUT_FORMAT_SINGLE = 0x47,
    PORT_INPUT_FORMAT_COMBINEDMODE = 0x48,
    VIRTUAL_PORT_SETUP = 0x61,
    PORT_OUTPUT_COMMAND = 0x81,
    PORT_OUTPUT_COMMAND_FEEDBACK = 0x82,
}


/**
 * @typedef HubPropertyReference
 * @param {number} ADVERTISING_NAME 0x01
 * @param {number} BUTTON 0x02
 * @param {number} FW_VERSION 0x03
 * @param {number} HW_VERSION 0x04
 * @param {number} RSSI 0x05
 * @param {number} BATTERY_VOLTAGE 0x06
 * @param {number} BATTERY_TYPE 0x07
 * @param {number} MANUFACTURER_NAME 0x08
 * @param {number} RADIO_FIRMWARE_VERSION 0x09
 * @param {number} LEGO_WIRELESS_PROTOCOL_VERSION 0x0A
 * @param {number} SYSTEM_TYPE_ID 0x0B
 * @param {number} HW_NETWORK_ID 0x0C
 * @param {number} PRIMARY_MAC_ADDRESS 0x0D
 * @param {number} SECONDARY_MAC_ADDRESS 0x0E
 * @param {number} HARDWARE_NETWORK_FAMILY 0x0F
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#hub-property-reference
 */
export enum HubPropertyReference {
    ADVERTISING_NAME = 0x01,
    BUTTON = 0x02,
    FW_VERSION = 0x03,
    HW_VERSION = 0x04,
    RSSI = 0x05,
    BATTERY_VOLTAGE = 0x06,
    BATTERY_TYPE = 0x07,
    MANUFACTURER_NAME = 0x08,
    RADIO_FIRMWARE_VERSION = 0x09,
    LEGO_WIRELESS_PROTOCOL_VERSION = 0x0A,
    SYSTEM_TYPE_ID = 0x0B,
    HW_NETWORK_ID = 0x0C,
    PRIMARY_MAC_ADDRESS = 0x0D,
    SECONDARY_MAC_ADDRESS = 0x0E,
    HARDWARE_NETWORK_FAMILY = 0x0F,
}


/**
 * @typedef HubPropertyOperation
 * @param {number} SET_DOWNSTREAM 0x01
 * @param {number} ENABLE_UPDATES_DOWNSTREAM 0x02
 * @param {number} DISABLE_UPDATES_DOWNSTREAM 0x03
 * @param {number} RESET_DOWNSTREAM 0x04
 * @param {number} REQUEST_UPDATE_DOWNSTREAM 0x05
 * @param {number} UPDATE_UPSTREAM 0x06
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#hub-property-reference
 */
export enum HubPropertyOperation {
    SET_DOWNSTREAM = 0x01,
    ENABLE_UPDATES_DOWNSTREAM = 0x02,
    DISABLE_UPDATES_DOWNSTREAM = 0x03,
    RESET_DOWNSTREAM = 0x04,
    REQUEST_UPDATE_DOWNSTREAM = 0x05,
    UPDATE_UPSTREAM = 0x06,
}


/**
 * @typedef HubPropertyPayload
 * @param {number} ADVERTISING_NAME 0x01
 * @param {number} BUTTON_STATE 0x02
 * @param {number} FW_VERSION 0x03
 * @param {number} HW_VERSION 0x04
 * @param {number} RSSI 0x05
 * @param {number} BATTERY_VOLTAGE 0x06
 * @param {number} BATTERY_TYPE 0x07
 * @param {number} MANUFACTURER_NAME 0x08
 * @param {number} RADIO_FIRMWARE_VERSION 0x09
 * @param {number} LWP_PROTOCOL_VERSION 0x0A
 * @param {number} SYSTEM_TYPE_ID 0x0B
 * @param {number} HW_NETWORK_ID 0x0C
 * @param {number} PRIMARY_MAC_ADDRESS 0x0D
 * @param {number} SECONDARY_MAC_ADDRESS 0x0E
 * @param {number} HW_NETWORK_FAMILY 0x0F
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#hub-property-reference
 */
export enum HubPropertyPayload {
    ADVERTISING_NAME = 0x01,
    BUTTON_STATE = 0x02,
    FW_VERSION = 0x03,
    HW_VERSION = 0x04,
    RSSI = 0x05,
    BATTERY_VOLTAGE = 0x06,
    BATTERY_TYPE = 0x07,
    MANUFACTURER_NAME = 0x08,
    RADIO_FIRMWARE_VERSION = 0x09,
    LWP_PROTOCOL_VERSION = 0x0A,
    SYSTEM_TYPE_ID = 0x0B,
    HW_NETWORK_ID = 0x0C,
    PRIMARY_MAC_ADDRESS = 0x0D,
    SECONDARY_MAC_ADDRESS = 0x0E,
    HW_NETWORK_FAMILY = 0x0F,
}


/**
 * @typedef ActionType
 * @param {number} SWITCH_OFF_HUB 0x01
 * @param {number} DISCONNECT 0x02
 * @param {number} VCC_PORT_CONTROL_ON 0x03
 * @param {number} VCC_PORT_CONTROL_OFF 0x04
 * @param {number} ACTIVATE_BUSY_INDICATION 0x05
 * @param {number} RESET_BUSY_INDICATION 0x06
 * @param {number} SHUTDOWN 0x2F
 * @param {number} HUB_WILL_SWITCH_OFF 0x30
 * @param {number} HUB_WILL_DISCONNECT 0x31
 * @param {number} HUB_WILL_GO_INTO_BOOT_MODE 0x32
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#action-types
 */
export enum ActionType {
    SWITCH_OFF_HUB = 0x01,
    DISCONNECT = 0x02,
    VCC_PORT_CONTROL_ON = 0x03,
    VCC_PORT_CONTROL_OFF = 0x04,
    ACTIVATE_BUSY_INDICATION = 0x05,
    RESET_BUSY_INDICATION = 0x06,
    SHUTDOWN = 0x2F,
    HUB_WILL_SWITCH_OFF = 0x30,
    HUB_WILL_DISCONNECT = 0x31,
    HUB_WILL_GO_INTO_BOOT_MODE = 0x32,
}


/**
 * @typedef AlertType
 * @param {number} LOW_VOLTAGE 0x01
 * @param {number} HIGH_CURRENT 0x02
 * @param {number} LOW_SIGNAL_STRENGTH 0x03
 * @param {number} OVER_POWER_CONDITION 0x04
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#alert-type
 */
export enum AlertType {
    LOW_VOLTAGE = 0x01,
    HIGH_CURRENT = 0x02,
    LOW_SIGNAL_STRENGTH = 0x03,
    OVER_POWER_CONDITION = 0x04,
}


/**
 * @typedef AlertOperation
 * @param {number} ENABLE_UPDATE 0x01
 * @param {number} DISABLE_UPDATE 0x02
 * @param {number} REQUEST_UPDATE 0x03
 * @param {number} UPDATE 0x04
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#alert-operation
 */
export enum AlertOperation {
    LOW_VOLTAGE = 0x01,
    HIGH_CURRENT = 0x02,
    LOW_SIGNAL_STRENGTH = 0x03,
    OVER_POWER_CONDITION = 0x04,
}


/**
 * @typedef AlertPayload
 * @param {number} STATUS_OK 0x00
 * @param {number} ALERT 0xFF
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#alert-payload
 */
export enum AlertPayload {
    STATUS_OK = 0x00,
    ALERT = 0xFF,
}


/**
 * @typedef Event
 * @param {number} DETACHED_IO 0x00
 * @param {number} ATTACHED_IO 0x01
 * @param {number} ATTACHED_VIRTUAL_IO 0x02
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#event
 */
export enum Event {
    DETACHED_IO = 0x00,
    ATTACHED_IO = 0x01,
    ATTACHED_VIRTUAL_IO = 0x02,
}


/**
 * @typedef IOTypeID
 * @param {number} MOTOR 0x0001
 * @param {number} SYSTEM_TRAIN_MOTOR 0x0002
 * @param {number} BUTTON 0x0005
 * @param {number} LED_LIGHT 0x0008
 * @param {number} VOLTAGE 0x0014
 * @param {number} CURRENT 0x0015
 * @param {number} PIEZO_TONE_SOUND 0x0016
 * @param {number} RGB_LIGHT 0x0017
 * @param {number} EXTERNAL_TILT_SENSOR 0x0022
 * @param {number} MOTION_SENSOR 0x0023
 * @param {number} VISION_SENSOR 0x0025
 * @param {number} EXTERNAL_MOTOR 0x0026
 * @param {number} INTERNAL_MOTOR 0x0027
 * @param {number} INTERNAL_TILT 0x0028
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#io-type-id
 */
export enum IOTypeID {
    MOTOR = 0x0001,
    SYSTEM_TRAIN_MOTOR = 0x0002,
    BUTTON = 0x0005,
    LED_LIGHT = 0x0008,
    VOLTAGE = 0x0014,
    CURRENT = 0x0015,
    PIEZO_TONE_SOUND = 0x0016,
    RGB_LIGHT = 0x0017,
    EXTERNAL_TILT_SENSOR = 0x0022,
    MOTION_SENSOR = 0x0023,
    VISION_SENSOR = 0x0025,
    EXTERNAL_MOTOR = 0x0026,
    INTERNAL_MOTOR = 0x0027,
    INTERNAL_TILT = 0x0028,
}


/**
 * @typedef ErrorCode
 * @param {number} ACK 0x01
 * @param {number} MACK 0x02
 * @param {number} BUFFER_OVERFLOW 0x03
 * @param {number} TIMEOUT 0x04
 * @param {number} COMMAND_NOT_RECOGNIZED 0x05
 * @param {number} INVALID_USE 0x06
 * @param {number} OVERCURRENT 0x07
 * @param {number} INTERNAL_ERROR 0x08
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#error-codes
 */
export enum ErrorCode {
    ACK = 0x01,
    MACK = 0x02,
    BUFFER_OVERFLOW = 0x03,
    TIMEOUT = 0x04,
    COMMAND_NOT_RECOGNIZED = 0x05,
    INVALID_USE = 0x06,
    OVERCURRENT = 0x07,
    INTERNAL_ERROR = 0x08,
}


/**
 * @typedef HWNetWorkCommandType
 * @param {number} CONNECTION_REQUEST 0x02
 * @param {number} FAMILY_REQUEST 0x03
 * @param {number} FAMILY_SET 0x04
 * @param {number} JOIN_DENIED 0x05
 * @param {number} GET_FAMILY 0x06
 * @param {number} FAMILY 0x07
 * @param {number} GET_SUBFAMILY 0x08
 * @param {number} SUBFAMILY 0x09
 * @param {number} SUBFAMILY_SET 0x0A
 * @param {number} GET_EXTENDED_FAMILY 0x0B
 * @param {number} EXTENDED_FAMILY 0x0C
 * @param {number} EXTENDED_FAMILY_SET 0x0D
 * @param {number} RESET_LONG_PRESS_TIMING 0x0E
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#h-w-network-command-type
 */
export enum HWNetWorkCommandType {
    CONNECTION_REQUEST = 0x02,
    FAMILY_REQUEST = 0x03,
    FAMILY_SET = 0x04,
    JOIN_DENIED = 0x05,
    GET_FAMILY = 0x06,
    FAMILY = 0x07,
    GET_SUBFAMILY = 0x08,
    SUBFAMILY = 0x09,
    SUBFAMILY_SET = 0x0A,
    GET_EXTENDED_FAMILY = 0x0B,
    EXTENDED_FAMILY = 0x0C,
    EXTENDED_FAMILY_SET = 0x0D,
    RESET_LONG_PRESS_TIMING = 0x0E,
}


/**
 * @typedef HWNetworkFamily
 * @param {number} GREEN 0x01
 * @param {number} YELLOW 0x02
 * @param {number} RED 0x03
 * @param {number} BLUE 0x04
 * @param {number} PURPLE 0x05
 * @param {number} LIGHT_BLUE 0x06
 * @param {number} TEAL 0x07
 * @param {number} PINK 0x08
 * @param {number} WHITE 0x00
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#h-w-network-family
 */
export enum HWNetworkFamily {
    GREEN = 0x01,
    YELLOW = 0x02,
    RED = 0x03,
    BLUE = 0x04,
    PURPLE = 0x05,
    LIGHT_BLUE = 0x06,
    TEAL = 0x07,
    PINK = 0x08,
    WHITE = 0x00,
}


/**
 * @typedef HWNetworkSubFamily
 * @param {number} ONE_FLASH 0x01
 * @param {number} TWO_FLASHES 0x02
 * @param {number} THREE_FLASHES 0x03
 * @param {number} FOUR_FLASHES 0x04
 * @param {number} FIVE_FLASHES 0x05
 * @param {number} SIX_FLASHES 0x06
 * @param {number} SEVEN_FLASHES 0x07
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#h-w-network-sub-family
 */
export enum HWNetworkSubFamily {
    ONE_FLASH = 0x01,
    TWO_FLASHES = 0x02,
    THREE_FLASHES = 0x03,
    FOUR_FLASHES = 0x04,
    FIVE_FLASHES = 0x05,
    SIX_FLASHES = 0x06,
    SEVEN_FLASHES = 0x07,
}


/**
 * @typedef ModeInformationType
 * @param {number} NAME 0x00
 * @param {number} RAW 0x01
 * @param {number} PCT 0x02
 * @param {number} SI 0x03
 * @param {number} SYMBOL 0x04
 * @param {number} MAPPING 0x05
 * @param {number} USED_INTERNALLY 0x06
 * @param {number} MOTOR_BIAS 0x07
 * @param {number} CAPABILITY_BITS 0x08
 * @param {number} VALUE_FORMAT 0x80
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#mode-information-types
 */
export enum ModeInformationType {
    NAME = 0x00,
    RAW = 0x01,
    PCT = 0x02,
    SI = 0x03,
    SYMBOL = 0x04,
    MAPPING = 0x05,
    USED_INTERNALLY = 0x06,
    MOTOR_BIAS = 0x07,
    CAPABILITY_BITS = 0x08,
    VALUE_FORMAT = 0x80,
}


/**
 * @typedef PortInputFormatSetupSubCommand
 * @param {number} SET_MODEANDDATASET_COMBINATIONS 0x01
 * @param {number} LOCK_LPF2_DEVICE_FOR_SETUP 0x02
 * @param {number} UNLOCKANDSTARTWITHMULTIUPDATEENABLED 0x03
 * @param {number} UNLOCKANDSTARTWITHMULTIUPDATEDISABLED 0x04
 * @param {number} NOT_USED 0x05
 * @param {number} RESET_SENSOR 0x06
 * @description https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#port-input-format-setup-sub-commands
 */
export enum PortInputFormatSetupSubCommand {
    SET_MODEANDDATASET_COMBINATIONS = 0x01,
    LOCK_LPF2_DEVICE_FOR_SETUP = 0x02,
    UNLOCKANDSTARTWITHMULTIUPDATEENABLED = 0x03,
    UNLOCKANDSTARTWITHMULTIUPDATEDISABLED = 0x04,
    NOT_USED = 0x05,
    RESET_SENSOR = 0x06,
}


/**
 * @typedef MarioPantsType
 * @param {number} NONE 0x00
 * @param {number} PROPELLER 0x06
 * @param {number} CAT 0x11
 * @param {number} FIRE 0x12
 * @param {number} NORMAL 0x21
 * @param {number} BUILDER 0x22
 */
export enum MarioPantsType {
    NONE = 0x00,
    PROPELLER = 0x06,
    CAT = 0x11,
    FIRE = 0x12,
    NORMAL = 0x21,
    BUILDER = 0x22,
}


/**
 * @typedef MarioColor
 * @param {number} WHITE 0x1300
 * @param {number} RED 0x1500
 * @param {number} BLUE 0x1700
 * @param {number} YELLOW 0x1800
 * @param {number} BLACK 0x1a00
 * @param {number} GREEN 0x2500
 * @param {number} BROWN 0x6a00
 * @param {number} CYAN 0x4201
 */
export enum MarioColor {
    WHITE = 0x1300,
    RED = 0x1500,
    BLUE = 0x1700,
    YELLOW = 0x1800,
    BLACK = 0x1a00,
    GREEN = 0x2500,
    BROWN = 0x6a00,
    CYAN = 0x4201,
}
