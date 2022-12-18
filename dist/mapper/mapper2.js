// UxROM: https://wiki.nesdev.com/w/index.php/UxROM
export class Mapper2 {
    constructor(cartridge, ram, prg, chr) {
        this.cartridge = cartridge;
        this.ram = ram;
        this.prg = prg;
        this.chr = chr;
        this.bankSelect = 0;
        this.chr = new Uint8Array(8 * 1024);
        this.chr.set(chr);
    }
    read(address) {
        address &= 0xFFFF;
        if (address < 0x2000) {
            return this.chr[address];
        }
        else if (address >= 0x8000) {
            return address < 0xC000 ?
                // Bank 0
                this.prg[(this.bankSelect << 14) + address - 0x8000] :
                // Bank 1
                this.prg[this.prg.length - 0x4000 + (address - 0xC000)];
        }
        else if (address >= 0x6000) {
            return this.ram[address - 0x6000];
        }
        else {
            // TODO: Error handling
            return 0;
        }
    }
    write(address, data) {
        address &= 0xFFFF;
        if (address < 0x2000) {
            this.chr[address] = data;
        }
        else if (address >= 0x8000) {
            // Bank select ($8000-$FFFF)
            this.bankSelect = data & 0x0F;
        }
        else if (address >= 0x6000) {
            this.ram[address - 0x6000] = data;
        }
        else {
            // TODO: Error handling
        }
    }
    ppuClockHandle(scanLine, cycle) {
        // Do nothing
    }
}
//# sourceMappingURL=mapper2.js.map