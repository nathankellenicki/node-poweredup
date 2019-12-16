import * as Consts from "./consts";

import { PoweredUP } from "./poweredup-browser";

import { BoostMoveHub } from "./boostmovehub";
import { ControlPlusHub } from "./controlplushub";
import { DuploTrainBase } from "./duplotrainbase";
import { Hub } from "./hub";
import { PUPHub } from "./puphub";
import { PUPRemote } from "./pupremote";
import { WeDo2SmartHub } from "./wedo2smarthub";

import { ColorDistanceSensor } from "./colordistancesensor";
import { Device } from "./device";
import { Light } from "./light";
import { MediumLinearMotor } from "./mediumlinearmotor";
import { MotionSensor } from "./motionsensor";
import { MoveHubMediumLinearMotor } from "./movehubmediumlinearmotor";
import { SimpleMediumLinearMotor } from "./simplemediumlinearmotor";
import { TechnicLargeLinearMotor } from "./techniclargelinearmotor";
import { TechnicXLargeLinearMotor } from "./technicxlargelinearmotor";
import { TiltSensor } from "./tiltsensor";
import { TrainMotor } from "./trainmotor";

import { isWebBluetooth } from "./utils";

// @ts-ignore
window.PoweredUP = {
    PoweredUP,
    Hub,
    WeDo2SmartHub,
    BoostMoveHub,
    ControlPlusHub,
    PUPHub,
    PUPRemote,
    DuploTrainBase,
    Consts,
    ColorDistanceSensor,
    Device,
    Light,
    MediumLinearMotor,
    MotionSensor,
    MoveHubMediumLinearMotor,
    SimpleMediumLinearMotor,
    TechnicLargeLinearMotor,
    TechnicXLargeLinearMotor,
    TiltSensor,
    TrainMotor,
    isWebBluetooth
};

