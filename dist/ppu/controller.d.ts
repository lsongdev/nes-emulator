import { IController, SpriteSize } from '../api/ppu.js';
import { uint8 } from '../api/types.js';
export declare class Controller implements IController {
    baseNameTableAddress: number;
    vramIncrementStepSize: number;
    spritePatternTableAddress: number;
    backgroundPatternTableAddress: number;
    spriteSize: SpriteSize;
    isNMIEnabled: boolean;
    set data(data: uint8);
    get data(): uint8;
}
