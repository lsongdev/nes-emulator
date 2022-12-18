export class Status {
    get data() {
        return (this.isSpriteOverflow ? 0x20 : 0) |
            (this.isZeroSpriteHit ? 0x40 : 0) |
            (this.isVBlankStarted ? 0x80 : 0);
    }
}
//# sourceMappingURL=status.js.map