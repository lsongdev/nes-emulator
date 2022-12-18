// CNROM: https://wiki.nesdev.com/w/index.php/CNROM
export class Mapper3 {
    constructor(cartridge, ram, prg, chr) {
        this.cartridge = cartridge;
        this.ram = ram;
        this.prg = prg;
        this.chr = chr;
        this.chrBankSelect = 0;
        this.chr = new Uint8Array(32 * 1024);
        this.chr.set(chr);
        this.prg = new Uint8Array(32 * 1024);
        this.prg.set(prg);
        if (prg.length === 16 * 1024) {
            this.prg.set(prg, 16 * 1024);
        }
    }
    read(address) {
        address &= 0xFFFF;
        if (address < 0x2000) {
            return this.chr[(this.chrBankSelect << 13) + address];
        }
        else if (address >= 0x8000) {
            return this.prg[address - 0x8000];
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
            this.chr[(this.chrBankSelect << 13) + address] = data;
        }
        else if (address >= 0x8000) {
            this.chrBankSelect = data & 0x03;
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
//# sourceMappingURL=mapper3.js.map