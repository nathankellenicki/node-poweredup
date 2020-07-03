import { FakeBLEDevice } from "./utils/fakebledevice";
import {commonsConnectTests } from './utils/commons';

import { DuploTrainBase } from "../src/hubs/duplotrainbase";

import moveHub from "./hubs/movehub";
import technicMediumHub from "./hubs/technicmediumhub";
import hub from "./hubs/hub";
import duploTrainBase from "./hubs/duplotrainbase";
import remoteControl from "./hubs/remoteControl";
import lpf2Hub from "./hubs/lpf2";


export default function hubs() {
  describe("Technic Medium Hub", technicMediumHub);
  describe("PoweredUp Hub", hub);
  describe("Boost Move Hub", moveHub);
  describe("Duplo Train Base", duploTrainBase);
  describe("Remote controller", remoteControl);
  describe("Common LPF2 methods", lpf2Hub);
};
