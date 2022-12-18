import { IMask } from '../api/ppu.js';
import { uint8 } from '../api/types.js';
export declare class Mask implements IMask {
    isColorful: boolean;
    isShowBackgroundLeft8px: boolean;
    isShowSpriteLeft8px: boolean;
    isShowBackground: boolean;
    isShowSprite: boolean;
    isEmphasizeRed: boolean;
    isEmphasizeGreen: boolean;
    isEmphasizeBlue: boolean;
    set data(data: uint8);
    get data(): uint8;
}
