import hubLED from "./devices/hubled";
import remoteControlButton from "./devices/remotecontrolbutton";


export default function devices() {
  describe("Hub LED", hubLED);
  describe("Remote control button", remoteControlButton);
};
