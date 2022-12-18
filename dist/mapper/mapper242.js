import { Mirror } from '../api/cartridge.js';
// INES Mapper 242: https://wiki.nesdev.com/w/index.php/INES_Mapper_242
export class Mapper242 {
    constructor(cartridge, ram, prg, chr) {
        this.cartridge = cartridge;
        this.ram = ram;
        this.prg = prg;
        this.chr = chr;
        this.prgBankSelect = 0;
        this.chr = new Uint8Array(0x2000);
        this.chr.set(chr);
    }
    read(address) {
        address &= 0xFFFF;
        if (address < 0x2000) {
            return this.chr[address];
        }
        else if (address >= 0x8000) {
            return this.prg[(this.prgBankSelect << 15) + address - 0x8000];
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
            this.cartridge.info.mirror = data & 0x02 ? Mirror.VERTICAL : Mirror.HORIZONTAL;
            this.prgBankSelect = data >> 3 & 0x0F;
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
//# sourceMappingURL=mapper242.js.map