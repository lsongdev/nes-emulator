import { IBus } from '../api/bus.js';
import { uint16, uint8 } from '../api/types.js';
import { IRAM } from '../api/ram.js';
import { IPPU } from '../api/ppu.js';
import { ICartridge } from '../api/cartridge.js';
import { IController } from '../api/controller.js';
import { IDMA } from '../api/dma.js';
import { IAPU } from '../api/apu.js';
export declare class CPUBus implements IBus {
    cartridge: ICartridge;
    ram: IRAM;
    ppu: IPPU;
    dma: IDMA;
    controller1: IController;
    controller2: IController;
    apu: IAPU;
    writeByte(address: uint16, data: uint8): void;
    writeWord(address: uint16, data: uint16): void;
    readByte(address: uint16): uint8;
    readWord(address: uint16): uint16;
}
