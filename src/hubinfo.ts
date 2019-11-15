import * as Consts from "./consts";
import { Hub } from "./hub";
import { LPF2Hub } from "./lpf2hub";
import { PoweredUP } from "./poweredup-node";
import { toBin, toHex } from "./utils";

function sanitizeString(s: string) {
    return s.replace(/\0/g, " ").replace(/ +$/, "");
}

export function main(argv: string[]) {
    let portInfo = false;
    let quiet = false;
    for (const arg of argv) {
        switch (arg) {
            case "-p":
            case "--portinfo":
                portInfo = true;
                break;
            case "-q":
            case "--quiet":
                quiet = true;
                break;
            default:
                console.log("Usage: lpf2-hubinfo [-p|--portinfo] [-q|--quiet]");
                return;
        }
    }
    if (portInfo) {
        LPF2Hub.requestPortModeInfo = true;
    }
    const pup = new PoweredUP();
    pup.on("discover", async (hub: Hub) => {
        const hubName = sanitizeString(hub.name);
        if (!quiet) {
            console.log(`Discovered ${hub.uuid} (${hubName})`);
        }
        await hub.connect();
        hub.on("portInfo", ({ port, type, hardwareVersion, softwareVersion }) => {
            const typeName = Consts.DeviceTypeNames[type] || "unknown";
            console.log(`${hub.uuid} Port ${toHex(port)}, type ${toHex(type, 4)} (${typeName})`);
            console.log(`${hub.uuid} Port ${toHex(port)}, hardware v${hardwareVersion}, software v${softwareVersion}`);
        });
        hub.on("portModes", ({ port, count, input, output }) => {
            console.log(`${hub.uuid} Port ${toHex(port)}, total modes ${count}, input modes ${toBin(input, count)}, output modes ${toBin(output, count)}`);
        });
        hub.on("portModeCombinations", ({ port, modeCombinationMasks }) => {
            console.log(`${hub.uuid} Port ${toHex(port)}, mode combinations [${modeCombinationMasks.map((c: number) => toBin(c, 0)).join(", ")}]`);
        });
        hub.on("portModeInfo", (info) => {
            const { port, mode, type } = info;
            const prefix = `${hub.uuid} Port ${toHex(port)}, mode ${mode}`;
            switch (type) {
                case 0x00: // Mode Name
                    console.log(`${prefix}, name ${sanitizeString(info.name)}`);
                    break;
                case 0x01: // RAW Range
                    console.log(`${prefix}, RAW min ${info.min}, max ${info.max}`);
                    break;
                case 0x02: // PCT Range
                    console.log(`${prefix}, PCT min ${info.min}, max ${info.max}`);
                    break;
                case 0x03: // SI Range
                    console.log(`${prefix}, SI min ${info.min}, max ${info.max}`);
                    break;
                case 0x04: // SI Symbol
                    console.log(`${prefix}, SI symbol ${sanitizeString(info.name)}`);
                    break;
                case 0x80: // Value Format
                    console.log(`${prefix}, Value ${info.numValues} x ${info.dataType}, Decimal format ${info.decimalFormat}`);
                    break;
            }
        });
        await hub.sleep(2000);
        const typeName = Consts.HubTypeNames[hub.type] || `unknown (${toHex(hub.type)})`;
        console.log(`${hub.uuid} ${hub.primaryMACAddress} firmware v${hub.firmwareVersion} hardware v${hub.hardwareVersion} ${typeName} (${hubName})`);
        if (hub instanceof LPF2Hub && !portInfo) {
            await hub.shutdown();
        }
    });
    pup.scan();
    if (!quiet) {
        console.log("Waiting for hubs...");
    }
}
