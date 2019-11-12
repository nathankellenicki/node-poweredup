// @ts-ignore
export const isWebBluetooth = (typeof navigator !== "undefined" && navigator && navigator.bluetooth);

export function toHex (value: number, length: number = 2) {
    return value.toString(16).padStart(length, "0");
}
export function toBin (value: number, length: number = 8) {
    return value.toString(2).padStart(length, "0");
}
