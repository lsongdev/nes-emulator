import { SpriteSize } from '../api/ppu.js';
const BaseNameTableAddressList = [0x2000, 0x2400, 0x2800, 0x2C00];
export class Controller {
    constructor() {
        this.baseNameTableAddress = BaseNameTableAddressList[0];
        this.vramIncrementStepSize = 1;
        this.spritePatternTableAddress = 0;
        this.backgroundPatternTableAddress = 0;
        this.spriteSize = SpriteSize.SIZE_8X8;
        this.isNMIEnabled = false;
    }
    set data(data) {
        this.baseNameTableAddress = BaseNameTableAddressList[data & 0x03];
        this.vramIncrementStepSize = data & 0x04 ? 32 : 1;
        this.spritePatternTableAddress = data & 0x08 ? 0x1000 : 0;
        this.backgroundPatternTableAddress = data & 0x10 ? 0x1000 : 0;
        this.spriteSize = data & 0x20 ? SpriteSize.SIZE_8X16 : SpriteSize.SIZE_8X8;
        this.isNMIEnabled = !!(data & 0x80);
    }
    get data() {
        return BaseNameTableAddressList.indexOf(this.baseNameTableAddress) |
            (this.vramIncrementStepSize === 1 ? 0 : 1) << 2 |
            (this.spritePatternTableAddress ? 1 : 0) << 3 |
            (this.backgroundPatternTableAddress ? 1 : 0) << 4 |
            (this.spriteSize === SpriteSize.SIZE_8X8 ? 0 : 1) << 5 |
            (this.isNMIEnabled ? 1 : 0) << 7;
    }
}
//# sourceMappingURL=controller.js.map