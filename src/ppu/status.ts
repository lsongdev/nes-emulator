import { IStatus } from '../api/ppu.js';
import { uint8 } from '../api/types.js';

export class Status implements IStatus {
  public isSpriteOverflow: boolean;
  public isZeroSpriteHit: boolean;
  public isVBlankStarted: boolean;

  public get data(): uint8 {
    return (this.isSpriteOverflow ? 0x20 : 0) |
      (this.isZeroSpriteHit ? 0x40 : 0) |
      (this.isVBlankStarted ? 0x80 : 0);
  }
}
