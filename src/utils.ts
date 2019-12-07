// @ts-ignore
export const isWebBluetooth = (typeof navigator !== "undefined" && navigator && navigator.bluetooth);

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
