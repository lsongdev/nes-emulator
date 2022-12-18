export class Mask {
    set data(data) {
        this.isColorful = !(data & 0x01);
        this.isShowBackgroundLeft8px = !!(data & 0x02);
        this.isShowSpriteLeft8px = !!(data & 0x04);
        this.isShowBackground = !!(data & 0x08);
        this.isShowSprite = !!(data & 0x10);
        this.isEmphasizeRed = !!(data & 0x20);
        this.isEmphasizeGreen = !!(data & 0x40);
        this.isEmphasizeBlue = !!(data & 0x80);
    }
    get data() {
        return (this.isColorful ? 0 : 1) |
            (this.isShowBackgroundLeft8px ? 1 : 0) << 1 |
            (this.isShowSpriteLeft8px ? 1 : 0) << 2 |
            (this.isShowBackground ? 1 : 0) << 3 |
            (this.isShowSprite ? 1 : 0) << 4 |
            (this.isEmphasizeRed ? 1 : 0) << 5 |
            (this.isEmphasizeGreen ? 1 : 0) << 6 |
            (this.isEmphasizeBlue ? 1 : 0) << 7;
    }
}
//# sourceMappingURL=mask.js.map