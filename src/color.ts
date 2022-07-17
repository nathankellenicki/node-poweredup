import * as Consts from "./consts";

export class Color {

    private _color: number;
    private _brightness: number = 100;

    constructor (color: number, brightness?: number) {
        this._color = color;
        this._brightness = brightness || 100;
    }

    public toValue () {
        if (this._color === Consts.Color.NONE) {
            return this._color;
        }
        return this._color + (Math.round(this._brightness / 10) << 4);
    }

}