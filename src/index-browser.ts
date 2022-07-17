import * as Consts from "./consts";

import { PoweredUP } from "./poweredup-browser";
import { Color } from "./color";

import { BaseHub } from "./hubs/basehub";
import { DuploTrainBase } from "./hubs/duplotrainbase";
import { Hub } from "./hubs/hub";
import { Mario } from "./hubs/mario";
import { MoveHub } from "./hubs/movehub";
import { RemoteControl } from "./hubs/remotecontrol";
import { TechnicMediumHub } from "./hubs/technicmediumhub";
import { WeDo2SmartHub } from "./hubs/wedo2smarthub";

import { ColorDistanceSensor } from "./devices/colordistancesensor";
import { CurrentSensor } from "./devices/currentsensor";
import { Device } from "./devices/device";
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
import { TechnicColorSensor } from "./devices/techniccolorsensor";
import { TechnicDistanceSensor } from "./devices/technicdistancesensor";
import { TechnicForceSensor } from "./devices/technicforcesensor";
import { TechnicLargeAngularMotor } from "./devices/techniclargeangularmotor";
import { TechnicLargeLinearMotor } from "./devices/techniclargelinearmotor";
import { TechnicSmallAngularMotor } from "./devices/technicsmallangularmotor";
import { TechnicMediumAngularMotor } from "./devices/technicmediumangularmotor";
import { TechnicMediumHubAccelerometerSensor } from "./devices/technicmediumhubaccelerometersensor";
import { TechnicMediumHubGyroSensor } from "./devices/technicmediumhubgyrosensor";
import { TechnicMediumHubTiltSensor } from "./devices/technicmediumhubtiltsensor";
import { TechnicXLargeLinearMotor } from "./devices/technicxlargelinearmotor";
import { Technic3x3ColorLightMatrix } from "./devices/technic3x3colorlightmatrix";
import { TiltSensor } from "./devices/tiltsensor";
import { TrainMotor } from "./devices/trainmotor";
import { VoltageSensor } from "./devices/voltagesensor";
import { TachoMotor } from "./devices/tachomotor";
import { AbsoluteMotor } from "./devices/absolutemotor";
import { BasicMotor } from "./devices/basicmotor";

import { isWebBluetooth } from "./utils";

// @ts-ignore
window.PoweredUP = {
    PoweredUP,
    BaseHub,
    WeDo2SmartHub,
    TechnicMediumHub,
    Hub,
    RemoteControl,
    DuploTrainBase,
    Consts,
    Color,
    ColorDistanceSensor,
    Device,
    DuploTrainBaseColorSensor,
    DuploTrainBaseMotor,
    DuploTrainBaseSpeaker,
    DuploTrainBaseSpeedometer,
    HubLED,
    Light,
    Mario,
    MediumLinearMotor,
    MotionSensor,
    MoveHub,
    MoveHubMediumLinearMotor,
    MoveHubTiltSensor,
    PiezoBuzzer,
    RemoteControlButton,
    SimpleMediumLinearMotor,
    TechnicColorSensor,
    TechnicDistanceSensor,
    TechnicForceSensor,
    TechnicMediumHubAccelerometerSensor,
    TechnicMediumHubGyroSensor,
    TechnicMediumHubTiltSensor,
    TechnicSmallAngularMotor,
    TechnicMediumAngularMotor,
    TechnicLargeAngularMotor,
    TechnicLargeLinearMotor,
    TechnicXLargeLinearMotor,
    Technic3x3ColorLightMatrix,
    TiltSensor,
    TrainMotor,
    VoltageSensor,
    CurrentSensor,
    TachoMotor,
    AbsoluteMotor,
    BasicMotor,
    isWebBluetooth
};

