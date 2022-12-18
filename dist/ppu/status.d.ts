import { IStatus } from '../api/ppu.js';
import { uint8 } from '../api/types.js';
export declare class Status implements IStatus {
    isSpriteOverflow: boolean;
    isZeroSpriteHit: boolean;
    isVBlankStarted: boolean;
    get data(): uint8;
}
