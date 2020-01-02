import { Device } from "./devices/generic/device";
export { Device };

import { ColorDistanceSensor } from "./devices/colordistancesensor";
import { CurrentSensor } from "./devices/currentsensor";
import { DuploTrainBaseColorSensor } from "./devices/duplotrainbasecolorsensor";
import { DuploTrainBaseMotor } from "./devices/duplotrainbasemotor";
import { DuploTrainBaseSpeaker } from "./devices/duplotrainbasespeaker";
import { DuploTrainBaseSpeedometer } from "./devices/duplotrainbasespeedometer";
import { HubLED } from "./devices/hubled";
import { Light } from "./devices/light";
import { MediumLinearMotor } from "./devices/mediumlinearmotor";
import { MotionSensor } from "./devices/motionsensor";
import { MoveHubMediumLinearMotor } from "./devices/movehubmediumlinearmotor";
import { MoveHubTiltSensor } from "./devices/movehubtiltsensor";
import { PiezoBuzzer } from "./devices/piezobuzzer";
import { RemoteControlButton } from "./devices/remotecontrolbutton";
import { SimpleMediumLinearMotor } from "./devices/simplemediumlinearmotor";
import { TechnicLargeLinearMotor } from "./devices/techniclargelinearmotor";
import { TechnicMediumHubAccelerometerSensor } from "./devices/technicmediumhubaccelerometersensor";
import { TechnicMediumHubGyroSensor } from "./devices/technicmediumhubgyrosensor";
import { TechnicMediumHubTiltSensor } from "./devices/technicmediumhubtiltsensor";
import { TechnicXLargeLinearMotor } from "./devices/technicxlargelinearmotor";
import { TiltSensor } from "./devices/tiltsensor";
import { TrainMotor } from "./devices/trainmotor";
import { VoltageSensor } from "./devices/voltagesensor";

export {
    ColorDistanceSensor,
    CurrentSensor,
    DuploTrainBaseColorSensor,
    DuploTrainBaseMotor,
    DuploTrainBaseSpeaker,
    DuploTrainBaseSpeedometer,
    HubLED,
    Light,
    MediumLinearMotor,
    MotionSensor,
    MoveHubMediumLinearMotor,
    MoveHubTiltSensor,
    PiezoBuzzer,
    RemoteControlButton,
    SimpleMediumLinearMotor,
    TechnicLargeLinearMotor,
    TechnicMediumHubAccelerometerSensor,
    TechnicMediumHubGyroSensor,
    TechnicMediumHubTiltSensor,
    TechnicXLargeLinearMotor,
    TiltSensor,
    TrainMotor,
    VoltageSensor,
};

export const devices: {[type: number]: typeof Device} = {
    [SimpleMediumLinearMotor.type]: SimpleMediumLinearMotor,
    [TrainMotor.type]: TrainMotor,
    [Light.type]: Light,
    [VoltageSensor.type]: VoltageSensor,
    [CurrentSensor.type]: CurrentSensor,
    [PiezoBuzzer.type]: PiezoBuzzer,
    [HubLED.type]: HubLED,
    [TiltSensor.type]: TiltSensor,
    [MotionSensor.type]: MotionSensor,
    [ColorDistanceSensor.type]: ColorDistanceSensor,
    [MediumLinearMotor.type]: MediumLinearMotor,
    [MoveHubMediumLinearMotor.type]: MoveHubMediumLinearMotor,
    [MoveHubTiltSensor.type]: MoveHubTiltSensor,
    [DuploTrainBaseMotor.type]: DuploTrainBaseMotor,
    [DuploTrainBaseSpeaker.type]: DuploTrainBaseSpeaker,
    [DuploTrainBaseColorSensor.type]: DuploTrainBaseColorSensor,
    [DuploTrainBaseSpeedometer.type]: DuploTrainBaseSpeedometer,
    [TechnicLargeLinearMotor.type]: TechnicLargeLinearMotor,
    [TechnicXLargeLinearMotor.type]: TechnicXLargeLinearMotor,
    [RemoteControlButton.type]: RemoteControlButton,
    [TechnicMediumHubAccelerometerSensor.type]: TechnicMediumHubAccelerometerSensor,
    [TechnicMediumHubGyroSensor.type]: TechnicMediumHubGyroSensor,
    [TechnicMediumHubTiltSensor.type]: TechnicMediumHubTiltSensor,
};

export const deviceType: {[typeName: string]: number} = {
    UNKNOW: 0,
};
export const deviceTypeNames: {[typeName: number]: string } = {
    0: "UNKNOW",
};

for (const type in devices) {
    if (devices[+type]) {
        const device = devices[+type];
        deviceType[device.typeName] = device.type;
        deviceTypeNames[device.type] = device.typeName;
    }
}
