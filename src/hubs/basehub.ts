import { EventEmitter } from "events";

import { IBLEAbstraction } from "../interfaces";

import { ColorDistanceSensor } from "../devices/colordistancesensor";
import { CurrentSensor } from "../devices/currentsensor";
import { Device } from "../devices/device";

import { DuploTrainBaseColorSensor } from "../devices/duplotrainbasecolorsensor";
import { DuploTrainBaseMotor } from "../devices/duplotrainbasemotor";
import { DuploTrainBaseSpeaker } from "../devices/duplotrainbasespeaker";
import { DuploTrainBaseSpeedometer } from "../devices/duplotrainbasespeedometer";

import { HubLED } from "../devices/hubled";
import { Light } from "../devices/light";
import { MarioAccelerometer } from "../devices/marioaccelerometer";
import { MarioBarcodeSensor } from "../devices/mariobarcodesensor";
import { MarioPantsSensor } from "../devices/mariopantssensor";
import { MediumLinearMotor } from "../devices/mediumlinearmotor";
import { MotionSensor } from "../devices/motionsensor";
import { MoveHubMediumLinearMotor } from "../devices/movehubmediumlinearmotor";
import { MoveHubTiltSensor } from "../devices/movehubtiltsensor";
import { PiezoBuzzer } from "../devices/piezobuzzer";
import { RemoteControlButton } from "../devices/remotecontrolbutton";
import { SimpleMediumLinearMotor } from "../devices/simplemediumlinearmotor";
import { TechnicColorSensor } from "../devices/techniccolorsensor";
import { TechnicDistanceSensor } from "../devices/technicdistancesensor";
import { TechnicForceSensor } from "../devices/technicforcesensor";
import { TechnicLargeAngularMotor } from "../devices/techniclargeangularmotor";
import { TechnicLargeLinearMotor } from "../devices/techniclargelinearmotor";
import { TechnicSmallAngularMotor } from "../devices/technicsmallangularmotor";
import { TechnicMediumAngularMotor } from "../devices/technicmediumangularmotor";
import { TechnicMediumHubAccelerometerSensor } from "../devices/technicmediumhubaccelerometersensor";
import { TechnicMediumHubGyroSensor } from "../devices/technicmediumhubgyrosensor";
import { TechnicMediumHubTiltSensor } from "../devices/technicmediumhubtiltsensor";
import { TechnicXLargeLinearMotor } from "../devices/technicxlargelinearmotor";
import { TiltSensor } from "../devices/tiltsensor";
import { TrainMotor } from "../devices/trainmotor";
import { VoltageSensor } from "../devices/voltagesensor";

import * as Consts from "../consts";

import Debug = require("debug");
import { Technic3x3ColorLightMatrix } from "../devices/technic3x3colorlightmatrix";
const debug = Debug("basehub");


/**
 * @class BaseHub
 * @extends EventEmitter
 */
export class BaseHub extends EventEmitter {

    protected _attachedDevices: {[portId: number]: Device} = {};

    protected _name: string = "";
    protected _firmwareVersion: string = "0.0.00.0000";
    protected _hardwareVersion: string = "0.0.00.0000";
    protected _primaryMACAddress: string = "00:00:00:00:00:00";
    protected _batteryLevel: number = 100;
    protected _rssi: number = -60;
    protected _portMap: {[portName: string]: number} = {};
    protected _virtualPorts: number[] = [];

    protected _bleDevice: IBLEAbstraction;

    private _type: Consts.HubType;
    private _attachCallbacks: ((device: Device) => boolean)[] = [];

    constructor (bleDevice: IBLEAbstraction, portMap: {[portName: string]: number} = {}, type: Consts.HubType = Consts.HubType.UNKNOWN) {
        super();
        this.setMaxListeners(23); // Technic Medium Hub has 9 built in devices + 4 external ports. Node.js throws a warning after 10 attached event listeners.
        this._type = type;
        this._bleDevice = bleDevice;
        this._portMap = Object.assign({}, portMap);
        bleDevice.on("disconnect", () => {
            /**
             * Emits when the hub is disconnected.
             * @event Hub#disconnect
             */
            this.emit("disconnect");
        });
    }


    /**
     * @readonly
     * @property {string} name Name of the hub
     */
    public get name () {
        return this._bleDevice.name;
    }


    /**
     * @readonly
     * @property {string} connected Connected status
     */
     public get connected () {
        return this._bleDevice.connected;
    }


    /**
     * @readonly
     * @property {string} connecting Connecting status
     */
     public get connecting () {
        return this._bleDevice.connecting;
    }


    /**
     * @readonly
     * @property {string} type Hub type
     */
    public get type () {
        return this._type;
    }


    /**
     * @readonly
     * @property {string[]} ports Array of port names
     */
    public get ports () {
        return Object.keys(this._portMap);
    }


    /**
     * @readonly
     * @property {string} firmwareVersion Firmware version of the hub
     */
    public get firmwareVersion () {
        return this._firmwareVersion;
    }


    /**
     * @readonly
     * @property {string} hardwareVersion Hardware version of the hub
     */
    public get hardwareVersion () {
        return this._hardwareVersion;
    }


    /**
     * @readonly
     * @property {string} primaryMACAddress Primary MAC address of the hub
     */
    public get primaryMACAddress () {
        return this._primaryMACAddress;
    }


    /**
     * @readonly
     * @property {string} uuid UUID of the hub
     */
    public get uuid () {
        return this._bleDevice.uuid;
    }


    /**
     * @readonly
     * @property {number} batteryLevel Battery level of the hub (Percentage between 0-100)
     */
    public get batteryLevel () {
        return this._batteryLevel;
    }


    /**
     * @readonly
     * @property {number} rssi Signal strength of the hub
     */
    public get rssi () {
        return this._rssi;
    }


    /**
     * Connect to the Hub.
     * @method Hub#connect
     * @returns {Promise} Resolved upon successful connect.
     */
    public connect () {
        if (this._bleDevice.connecting) {
            throw new Error("Already connecting");
        } else if (this._bleDevice.connected) {
            throw new Error("Already connected");
        }
        return this._bleDevice.connect();
    }


    /**
     * Disconnect the Hub.
     * @method Hub#disconnect
     * @returns {Promise} Resolved upon successful disconnect.
     */
    public disconnect () {
        return this._bleDevice.disconnect();
    }


    /**
     * Retrieves the device attached to a given port.
     * @method Hub#getDeviceAtPort
     * @param {string} portName The name of the port to retrieve the device from.
     * @returns {Device | undefined} The device attached to the port.
     */
    public getDeviceAtPort (portName: string) {
        const portId = this._portMap[portName];
        if (portId !== undefined) {
            return this._attachedDevices[portId];
        } else {
            return undefined;
        }
    }


    /**
     * Retrieves the device attached to a given port, waiting until one is attached if there isn't one.
     *
     * Note: If a device is never attached, the returned promise may never resolve.
     * @method Hub#waitForDeviceAtPort
     * @param {string} portName The name of the port to retrieve the device from.
     * @returns {Promise} Resolved once a device is attached, or resolved immediately if a device is already attached.
     */
    public waitForDeviceAtPort (portName: string) {
        return new Promise((resolve) => {
            const existingDevice = this.getDeviceAtPort(portName);
            if (existingDevice) {
                return resolve(existingDevice);
            }
            this._attachCallbacks.push((device) => {
                if (device.portName === portName) {
                    resolve(device);
                    return true;
                } else {
                    return false;
                }
            });
        });
    }


    /**
     * Retrieves all attached devices.
     * @method Hub#getDevices
     * @returns {Device[]} Array of all attached devices.
     */
    public getDevices () {
        return Object.values(this._attachedDevices);
    }


    /**
     * Retrieves an array of devices of the specified type.
     * @method Hub#getDevicesByType
     * @param {number} deviceType The device type to lookup.
     * @returns {Device[]} Array of all devices of the specified type.
     */
    public getDevicesByType (deviceType: number) {
        return this.getDevices().filter((device) => device.type === deviceType);
    }


    /**
     * Retrieves the first device attached of the specified type, waiting until one is attached if there isn't one.
     *
     * Note: If a device is never attached, the returned promise may never resolve.
     * @method Hub#waitForDeviceByType
     * @param {number} deviceType The device type to lookup.
     * @returns {Promise} Resolved once a device is attached, or resolved immediately if a device is already attached.
     */
    public waitForDeviceByType (deviceType: number) {
        return new Promise((resolve) => {
            const existingDevices = this.getDevicesByType(deviceType);
            if (existingDevices.length >= 1) {
                return resolve(existingDevices[0]);
            }
            this._attachCallbacks.push((device) => {
                if (device.type === deviceType) {
                    resolve(device);
                    return true;
                } else {
                    return false;
                }
            });
        });
    }


    public getPortNameForPortId (portId: number) {
        for (const port of Object.keys(this._portMap)) {
            if (this._portMap[port] === portId) {
                return port;
            }
        }
        return;
    }


    public isPortVirtual (portId: number) {
        return (this._virtualPorts.indexOf(portId) > -1);
    }


    /**
     * Sleep a given amount of time.
     *
     * Note: This is a helper method to make it easier to add delays into a chain of commands.
     * @method Hub#sleep
     * @param {number} delay How long to sleep (in milliseconds).
     * @returns {Promise} Resolved after the delay is finished.
     */
    public sleep (delay: number) {
        return new Promise((resolve) => {
            global.setTimeout(resolve, delay);
        });
    }


    /**
     * Wait until a given list of concurrently running commands are complete.
     *
     * Note: This is a helper method to make it easier to wait for concurrent commands to complete.
     * @method Hub#wait
     * @param {Array<Promise<any>>} commands Array of executing commands.
     * @returns {Promise} Resolved after the commands are finished.
     */
    public wait (commands: Promise<any>[]) {
        return Promise.all(commands);
    }


    public send (message: Buffer, uuid: string) {
        return Promise.resolve();
    }


    public subscribe (portId: number, deviceType: number, mode: number) {
        // NK Do nothing here
    }


    public unsubscribe (portId: number, deviceType: number, mode: number) {
        // NK Do nothing here
    }


    public manuallyAttachDevice(deviceType: number, portId: number) {
        if (!this._attachedDevices[portId]) {
            debug(`No device attached to portId ${portId}, creating and attaching device type ${deviceType}`);
            const device = this._createDevice(deviceType, portId);
            this._attachDevice(device);
            return device;
        } else {
            if (this._attachedDevices[portId].type === deviceType) {
                debug(`Device of ${deviceType} already attached to portId ${portId}, returning existing device`);
                return this._attachedDevices[portId];
            } else {
                throw new Error(`Already a different type of device attached to portId ${portId}. Only use this method when you are certain what's attached.`);
            }
        }
    }


    protected _attachDevice (device: Device) {
        if (this._attachedDevices[device.portId] && this._attachedDevices[device.portId].type === device.type) {
            return;
        }
        this._attachedDevices[device.portId] = device;

        /**
         * Emits when a device is attached to the Hub.
         * @event Hub#attach
         * @param {Device} device
         */
        this.emit("attach", device);
        debug(`Attached device type ${device.type} (${Consts.DeviceTypeNames[device.type]}) on port ${device.portName} (${device.portId})`);

        let i = this._attachCallbacks.length;
        while (i--) {
            const callback = this._attachCallbacks[i];
            if (callback(device)) {
                this._attachCallbacks.splice(i, 1);
            }
        }
    }


    protected _detachDevice (device: Device) {
        delete this._attachedDevices[device.portId];
        /**
         * Emits when a device is detached from the Hub.
         * @event Hub#detach
         * @param {Device} device
         */
        this.emit("detach", device);
        debug(`Detached device type ${device.type} (${Consts.DeviceTypeNames[device.type]}) on port ${device.portName} (${device.portId})`);
    }


    protected _createDevice (deviceType: number, portId: number) {
        let constructor;

        // NK TODO: This needs to go in a better place
        const deviceConstructors: {[type: number]: typeof Device} = {
            [Consts.DeviceType.LIGHT]: Light,
            [Consts.DeviceType.TRAIN_MOTOR]: TrainMotor,
            [Consts.DeviceType.SIMPLE_MEDIUM_LINEAR_MOTOR]: SimpleMediumLinearMotor,
            [Consts.DeviceType.MOVE_HUB_MEDIUM_LINEAR_MOTOR]: MoveHubMediumLinearMotor,
            [Consts.DeviceType.MOTION_SENSOR]: MotionSensor,
            [Consts.DeviceType.TILT_SENSOR]: TiltSensor,
            [Consts.DeviceType.MOVE_HUB_TILT_SENSOR]: MoveHubTiltSensor,
            [Consts.DeviceType.PIEZO_BUZZER]: PiezoBuzzer,
            [Consts.DeviceType.TECHNIC_COLOR_SENSOR]: TechnicColorSensor,
            [Consts.DeviceType.TECHNIC_DISTANCE_SENSOR]: TechnicDistanceSensor,
            [Consts.DeviceType.TECHNIC_FORCE_SENSOR]: TechnicForceSensor,
            [Consts.DeviceType.TECHNIC_MEDIUM_HUB_TILT_SENSOR]: TechnicMediumHubTiltSensor,
            [Consts.DeviceType.TECHNIC_MEDIUM_HUB_GYRO_SENSOR]: TechnicMediumHubGyroSensor,
            [Consts.DeviceType.TECHNIC_MEDIUM_HUB_ACCELEROMETER]: TechnicMediumHubAccelerometerSensor,
            [Consts.DeviceType.MEDIUM_LINEAR_MOTOR]: MediumLinearMotor,
            [Consts.DeviceType.TECHNIC_SMALL_ANGULAR_MOTOR]: TechnicSmallAngularMotor,
            [Consts.DeviceType.TECHNIC_MEDIUM_ANGULAR_MOTOR]: TechnicMediumAngularMotor,
            [Consts.DeviceType.TECHNIC_LARGE_ANGULAR_MOTOR]: TechnicLargeAngularMotor,
            [Consts.DeviceType.TECHNIC_LARGE_LINEAR_MOTOR]: TechnicLargeLinearMotor,
            [Consts.DeviceType.TECHNIC_XLARGE_LINEAR_MOTOR]: TechnicXLargeLinearMotor,
            [Consts.DeviceType.COLOR_DISTANCE_SENSOR]: ColorDistanceSensor,
            [Consts.DeviceType.VOLTAGE_SENSOR]: VoltageSensor,
            [Consts.DeviceType.CURRENT_SENSOR]: CurrentSensor,
            [Consts.DeviceType.REMOTE_CONTROL_BUTTON]: RemoteControlButton,
            [Consts.DeviceType.HUB_LED]: HubLED,
            [Consts.DeviceType.DUPLO_TRAIN_BASE_COLOR_SENSOR]: DuploTrainBaseColorSensor,
            [Consts.DeviceType.DUPLO_TRAIN_BASE_MOTOR]: DuploTrainBaseMotor,
            [Consts.DeviceType.DUPLO_TRAIN_BASE_SPEAKER]: DuploTrainBaseSpeaker,
            [Consts.DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER]: DuploTrainBaseSpeedometer,
            [Consts.DeviceType.MARIO_ACCELEROMETER]: MarioAccelerometer,
            [Consts.DeviceType.MARIO_BARCODE_SENSOR]: MarioBarcodeSensor,
            [Consts.DeviceType.MARIO_PANTS_SENSOR]: MarioPantsSensor,
            [Consts.DeviceType.TECHNIC_MEDIUM_ANGULAR_MOTOR_GREY]: TechnicMediumAngularMotor,
            [Consts.DeviceType.TECHNIC_LARGE_ANGULAR_MOTOR_GREY]: TechnicLargeAngularMotor,
            [Consts.DeviceType.TECHNIC_3X3_COLOR_LIGHT_MATRIX]: Technic3x3ColorLightMatrix,
        };

        constructor = deviceConstructors[deviceType as Consts.DeviceType];

        if (constructor) {
            return new constructor(this, portId, undefined, deviceType);
        } else {
            return new Device(this, portId, undefined, deviceType);
        }

    }


    protected _getDeviceByPortId (portId: number) {
        return this._attachedDevices[portId];
    }


}
