// NROM: https://wiki.nesdev.com/w/index.php/NROM
export class Mapper0 {
    constructor(cartridge, ram, prg, chr) {
        this.cartridge = cartridge;
        this.ram = ram;
        this.prg = prg;
        this.chr = chr;
        this.isMirrored = prg.length === 16 * 1024;
        if (chr.length === 0) {
            // If there is no chr memory, treat it as ram
            this.chr = new Uint8Array(0x2000);
        }
    }
    read(address) {
        address &= 0xFFFF;
        if (address < 0x2000) {
            return this.chr[this.parseAddress(address)];
        }
        else if (address >= 0x8000) {
            return this.prg[this.parseAddress(address)];
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
            this.chr[this.parseAddress(address)] = data;
        }
        else if (address >= 0x8000) {
            this.prg[this.parseAddress(address)] = data;
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
    // Refer to http://forums.nesdev.com/viewtopic.php?t=5494
    parseAddress(address) {
        if (address < 0x2000) { // CHR
            return address;
        }
        else { // PRG
            return (this.isMirrored ? address & 0b1011111111111111 : address) - 0x8000;
        }
    }
}
//# sourceMappingURL=mapper0.js.map