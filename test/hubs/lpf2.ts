import { strictEqual, ok } from "assert";

import { FakeBLEDevice } from "../utils/fakebledevice";
import { getAttachMessage, includeMessage } from "../utils/commons";

import { LPF2Hub } from "../../src/hubs/lpf2hub";
import * as Consts from "../../src/consts";

import { Device } from "../../src/devices/device"
import { ColorDistanceSensor } from "../../src/devices/colordistancesensor"
import { SimpleMediumLinearMotor } from "../../src/devices/simplemediumlinearmotor";
import { TrainMotor } from "../../src/devices/trainmotor";
import { Light } from "../../src/devices/light";
import { VoltageSensor } from "../../src/devices/voltagesensor";
import { CurrentSensor } from "../../src/devices/currentsensor";
import { PiezoBuzzer } from "../../src/devices/piezobuzzer";
import { HubLED } from "../../src/devices/hubled";
import { TiltSensor } from "../../src/devices/tiltsensor";
import { MotionSensor } from "../../src/devices/motionsensor";
import { MediumLinearMotor } from "../../src/devices/mediumlinearmotor";
import { MoveHubMediumLinearMotor } from "../../src/devices/movehubmediumlinearmotor";
import { MoveHubTiltSensor } from "../../src/devices/movehubtiltsensor";
import { DuploTrainBaseMotor } from "../../src/devices/duplotrainbasemotor";
import { DuploTrainBaseSpeaker } from "../../src/devices/duplotrainbasespeaker";
import { DuploTrainBaseColorSensor } from "../../src/devices/duplotrainbasecolorsensor";
import { DuploTrainBaseSpeedometer } from "../../src/devices/duplotrainbasespeedometer";
import { TechnicLargeLinearMotor } from "../../src/devices/techniclargelinearmotor";
import { TechnicLargeAngularMotor } from "../../src/devices/techniclargeangularmotor";
import { TechnicMediumAngularMotor } from "../../src/devices/technicmediumangularmotor";
import { TechnicXLargeLinearMotor } from "../../src/devices/technicxlargelinearmotor";
import { RemoteControlButton } from "../../src/devices/remotecontrolbutton";
import { TechnicMediumHubAccelerometerSensor } from "../../src/devices/technicmediumhubaccelerometersensor";
import { TechnicMediumHubGyroSensor } from "../../src/devices/technicmediumhubgyrosensor";
import { TechnicMediumHubTiltSensor } from "../../src/devices/technicmediumhubtiltsensor";
import { TechnicColorSensor } from "../../src/devices/techniccolorsensor";
import { TechnicDistanceSensor } from "../../src/devices/technicdistancesensor";
import { TechnicForceSensor } from "../../src/devices/technicforcesensor";

export default function lpf2Hub() {
    let bleDevice: FakeBLEDevice
    let hub: LPF2Hub;

    function deviceAttach(type: number, Constructor: typeof Device) {
        return () => {
        it("should emit an 'attach' event with device", done => {
            hub.on("attach", device => {
            strictEqual(device.type, type);
            ok(device instanceof Constructor);
            done();
            });

            bleDevice.send(getAttachMessage(0, type));
        });

        it("should resolve 'waitForDeviceByType'", done => {
            hub.waitForDeviceByType(type).then((d) => {
            const device = d as Device;
            strictEqual(device.type, type);
            ok(device instanceof Constructor);
            done();
            });

            bleDevice.send(getAttachMessage(0, type));
        });
        };
    }

    beforeEach(async () => {
        bleDevice = new FakeBLEDevice("fakebledevice", "LPF2 Hub");
        hub = new LPF2Hub(bleDevice, {A: 0, B: 1});
        await hub.connect()
    });

    describe("attach", () => {
        describe("waitForDeviceAtPort", () => {
            it("should resolve with already attached device", async () => {
                await bleDevice.send(getAttachMessage(0, Consts.DeviceType.UNKNOWN));
                const device = await hub.waitForDeviceAtPort("A") as Device;

                strictEqual(device.type, Consts.DeviceType.UNKNOWN);
                ok(device instanceof Device);
                return;
            });

            it("should resolve when device attached", done => {
                hub.waitForDeviceAtPort("A").then(d=> {
                const device = d  as Device;
                strictEqual(device.type, Consts.DeviceType.UNKNOWN);
                ok(device instanceof Device);
                done();
                });
                bleDevice.send(getAttachMessage(0, Consts.DeviceType.UNKNOWN));
            });
        });

        describe("Simple Medium Linear Motor",  deviceAttach(Consts.DeviceType.SIMPLE_MEDIUM_LINEAR_MOTOR, SimpleMediumLinearMotor));
        describe("Train Motor",  deviceAttach(Consts.DeviceType.TRAIN_MOTOR, TrainMotor));
        describe("Light",  deviceAttach(Consts.DeviceType.LIGHT, Light));
        describe("Voltage sensor",  deviceAttach(Consts.DeviceType.VOLTAGE_SENSOR, VoltageSensor));
        describe("Current sensor",  deviceAttach(Consts.DeviceType.CURRENT_SENSOR, CurrentSensor));
        describe("Piezzo buzzer",  deviceAttach(Consts.DeviceType.PIEZO_BUZZER, PiezoBuzzer));
        describe("Hub LED",  deviceAttach(Consts.DeviceType.HUB_LED, HubLED));
        describe("Tilt sensor",  deviceAttach(Consts.DeviceType.TILT_SENSOR, TiltSensor));
        describe("Motion sensor",  deviceAttach(Consts.DeviceType.MOTION_SENSOR, MotionSensor));
        describe("Color and distance sensor",  deviceAttach(Consts.DeviceType.COLOR_DISTANCE_SENSOR, ColorDistanceSensor));
        describe("Medium linear motor",  deviceAttach(Consts.DeviceType.MEDIUM_LINEAR_MOTOR, MediumLinearMotor));
        describe("Move hub medium linear motor",  deviceAttach(Consts.DeviceType.MOVE_HUB_MEDIUM_LINEAR_MOTOR, MoveHubMediumLinearMotor));
        describe("Move hub tilt sensor",  deviceAttach(Consts.DeviceType.MOVE_HUB_TILT_SENSOR, MoveHubTiltSensor));
        describe("Duplo train base motor",  deviceAttach(Consts.DeviceType.DUPLO_TRAIN_BASE_MOTOR, DuploTrainBaseMotor));
        describe("Duplo train base speaker",  deviceAttach(Consts.DeviceType.DUPLO_TRAIN_BASE_SPEAKER, DuploTrainBaseSpeaker));
        describe("Duplo train base color sensor",  deviceAttach(Consts.DeviceType.DUPLO_TRAIN_BASE_COLOR_SENSOR, DuploTrainBaseColorSensor));
        describe("Duplo train base speedometer",  deviceAttach(Consts.DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER, DuploTrainBaseSpeedometer));
        describe("Technic large linear motor",  deviceAttach(Consts.DeviceType.TECHNIC_LARGE_LINEAR_MOTOR, TechnicLargeLinearMotor));
        describe("Technic XL linear motor",  deviceAttach(Consts.DeviceType.TECHNIC_XLARGE_LINEAR_MOTOR, TechnicXLargeLinearMotor));
        describe("Technic medium angular motor",  deviceAttach(Consts.DeviceType.TECHNIC_MEDIUM_ANGULAR_MOTOR, TechnicMediumAngularMotor));
        describe("Technic large angular motor",  deviceAttach(Consts.DeviceType.TECHNIC_LARGE_ANGULAR_MOTOR, TechnicLargeAngularMotor));
        describe("Remote controller button",  deviceAttach(Consts.DeviceType.REMOTE_CONTROL_BUTTON, RemoteControlButton));
        describe("Remote controller RSSI - Generic device",  deviceAttach(Consts.DeviceType.REMOTE_CONTROL_RSSI, Device));
        describe("Technic medium hub accelerometer",  deviceAttach(Consts.DeviceType.TECHNIC_MEDIUM_HUB_ACCELEROMETER, TechnicMediumHubAccelerometerSensor));
        describe("Technic medium hub gyro sensor",  deviceAttach(Consts.DeviceType.TECHNIC_MEDIUM_HUB_GYRO_SENSOR, TechnicMediumHubGyroSensor));
        describe("Technic medium hub tilt sensor",  deviceAttach(Consts.DeviceType.TECHNIC_MEDIUM_HUB_TILT_SENSOR, TechnicMediumHubTiltSensor));
        describe("Technic medium hub temperature sensor - Generic device",  deviceAttach(Consts.DeviceType.TECHNIC_MEDIUM_HUB_TEMPERATURE_SENSOR, Device));
        describe("Technic color sensor",  deviceAttach(Consts.DeviceType.TECHNIC_COLOR_SENSOR, TechnicColorSensor));
        describe("Technic distance sensor",  deviceAttach(Consts.DeviceType.TECHNIC_DISTANCE_SENSOR, TechnicDistanceSensor));
        describe("Technic force sensor",  deviceAttach(Consts.DeviceType.TECHNIC_FORCE_SENSOR, TechnicForceSensor));
        describe("Technic medium angular motor (grey) - Generic device",  deviceAttach(Consts.DeviceType.TECHNIC_MEDIUM_ANGULAR_MOTOR_GREY, Device));
        describe("Technic large angular motor (grey) - Generic device",  deviceAttach(Consts.DeviceType.TECHNIC_LARGE_ANGULAR_MOTOR_GREY, Device));
    });

    describe("shutdown", () => {
        it("should send shutdown message", async () => {
            await hub.shutdown();
            includeMessage(bleDevice, "04000201");
        });
    });
}
