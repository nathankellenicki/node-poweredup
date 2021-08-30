import { EventEmitter } from "events";
import { Device } from "./devices/device";

// @ts-ignore
export const isWebBluetooth = !!(typeof navigator !== "undefined" && navigator && navigator.bluetooth);

export const toHex = (value: number, length: number = 2) => {
    return value.toString(16).padStart(length, "0");
};

export const toBin = (value: number, length: number = 8) => {
    return value.toString(2).padStart(length, "0");
};

export const mapSpeed = (speed: number) => {
    if (speed === 127) {
        return 127;
    }
    if (speed > 100) {
        speed = 100;
    } else if (speed < -100) {
        speed = -100;
    }
    return speed;
};

export const decodeVersion = (version: number) => {
    const parts = version.toString(16).padStart(8, "0");
    return [parts[0], parts[1], parts.substring(2, 4), parts.substring(4)].join(".");
};

export const decodeMACAddress = (address: Uint8Array) => {
    return Array.from(address).map((part) => toHex(part, 2)).join(":");
};

export const normalizeAngle = (angle: number) => {
    if (angle >= 180) {
        return angle - (360 * ((angle + 180) / 360));
    } else if (angle < -180) {
        return angle + (360 * ((180 - angle) / 360));
    }
    return angle;
};

export const roundAngleToNearest90 = (angle: number) => {
    angle = normalizeAngle(angle);
    if (angle < -135) {
        return -180;
    }
    if (angle < -45) {
        return -90;
    }
    if (angle < 45) {
        return 0;
    }
    if (angle < 135) {
        return 90;
    }
    return -180;
};

export const calculateRamp = (device: Device, fromPower: number, toPower: number, time: number) => {
    const emitter = new EventEmitter();
    const steps = Math.abs(toPower - fromPower);
    let delay = time / steps;
    let increment = 1;
    if (delay < 50 && steps > 0) {
        increment = 50 / delay;
        delay = 50;
    }
    if (fromPower > toPower) {
        increment = -increment;
    }
    let i = 0;
    const interval = setInterval(() => {
        let power = Math.round(fromPower + (++i * increment));
        if (toPower > fromPower && power > toPower) {
            power = toPower;
        } else if (fromPower > toPower && power < toPower) {
            power = toPower;
        }
        emitter.emit("changePower", power);
        if (power === toPower) {
            clearInterval(interval);
            emitter.emit("finished");
        }
    }, delay);
    device.setEventTimer(interval);
    return emitter;
};

export const parseColor = (color: number) => {
    if (color === 1 || color === 5) {
        color = color + 1;
    }
    return color;
}