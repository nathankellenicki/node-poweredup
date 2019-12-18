import * as Consts from "./consts";

import { PoweredUP } from "./poweredup-browser";

import { BoostMoveHub } from "./hubs/boostmovehub";
import { ControlPlusHub } from "./hubs/controlplushub";
import { DuploTrainBase } from "./hubs/duplotrainbase";
import { Hub } from "./hubs/hub";
import { PUPHub } from "./hubs/puphub";
import { PUPRemote } from "./hubs/pupremote";
import { WeDo2SmartHub } from "./hubs/wedo2smarthub";

import { ColorDistanceSensor } from "./devices/colordistancesensor";
import { Device } from "./devices/device";
import { Light } from "./devices/light";
import { MediumLinearMotor } from "./devices/mediumlinearmotor";
import { MotionSensor } from "./devices/motionsensor";
import { MoveHubMediumLinearMotor } from "./devices/movehubmediumlinearmotor";
import { SimpleMediumLinearMotor } from "./devices/simplemediumlinearmotor";
import { TechnicLargeLinearMotor } from "./devices/techniclargelinearmotor";
import { TechnicXLargeLinearMotor } from "./devices/technicxlargelinearmotor";
import { TiltSensor } from "./devices/tiltsensor";
import { TrainMotor } from "./devices/trainmotor";
import { VoltageSensor } from "./devices/voltagesensor";

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
    VoltageSensor,
    isWebBluetooth
};

