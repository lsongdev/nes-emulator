import { Mirror } from '../api/cartridge.js';
// MMC1: https://wiki.nesdev.com/w/index.php/MMC1
export class Mapper1 {
    constructor(cartridge, ram, prg, chr, prgBanks = prg.length >> 14) {
        this.cartridge = cartridge;
        this.ram = ram;
        this.prg = prg;
        this.chr = chr;
        this.prgBanks = prgBanks;
        this.shiftRegister = 0x10;
        // 0: switch 8 KB at a time; 1: switch two separate 4 KB banks
        this.chrBankMode = 0;
        this.chrBanks = [0, 0];
        // 0, 1: switch 32 KB at $8000, ignoring low bit of bank number
        // 2: fix first bank at $8000 and switch 16 KB bank at $C000
        // 3: fix last bank at $C000 and switch 16 KB bank at $8000
        this.prgBankMode = 0;
        this.prgBank = 0;
        this.chr = new Uint8Array(128 * 1024);
        this.chr.set(chr);
        this.prgBankMode = 3;
    }
    read(address) {
        address &= 0xFFFF;
        if (address < 0x2000) {
            return this.readChr(address);
        }
        else if (address >= 0x8000) {
            return this.readPrg(address);
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
            this.writeChr(address, data);
        }
        else if (address >= 0x8000) {
            // Load register ($8000-$FFFF)
            this.loadRegister(address, data);
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
    loadRegister(address, data) {
        if (data & 0x80) {
            // Clear the shift register
            this.shiftRegister = 0x10;
            this.prgBankMode = 3;
        }
        else {
            const isOnFifthWrite = !!(this.shiftRegister & 0x01);
            this.shiftRegister >>= 1;
            this.shiftRegister |= data & 0x01 ? 0x10 : 0;
            if (isOnFifthWrite) {
                this.writeRegister(address, this.shiftRegister);
                this.shiftRegister = 0x10;
            }
        }
    }
    writeRegister(address, data) {
        if (address < 0xA000) {
            // Control (internal, $8000-$9FFF)
            switch (data & 0x03) {
                case 0:
                    this.cartridge.info.mirror = Mirror.SINGLE_SCREEN_LOWER_BANK;
                    break;
                case 1:
                    this.cartridge.info.mirror = Mirror.SINGLE_SCREEN_UPPER_BANK;
                    break;
                case 2:
                    this.cartridge.info.mirror = Mirror.VERTICAL;
                    break;
                case 3:
                    this.cartridge.info.mirror = Mirror.HORIZONTAL;
                    break;
            }
            this.prgBankMode = data >> 2 & 0x03;
            this.chrBankMode = data >> 4 & 0x01;
        }
        else if (address < 0xC000) {
            // CHR bank 0 (internal, $A000-$BFFF)
            this.chrBanks[0] = data & 0x1F;
        }
        else if (address < 0xE000) {
            // CHR bank 1 (internal, $C000-$DFFF)
            this.chrBanks[1] = data & 0x1F;
        }
        else {
            // PRG bank (internal, $E000-$FFFF)
            this.prgBank = data & 0x0F;
        }
    }
    readChr(address) {
        return this.chr[this.chrOffset(address)];
    }
    writeChr(address, data) {
        this.chr[this.chrOffset(address)] = data;
    }
    readPrg(address) {
        return this.prg[this.prgOffset(address)];
    }
    chrOffset(address) {
        if (this.chrBankMode) {
            // Two separate 4 KB banks
            const bank = address >> 12;
            const offset = address & 0x0FFF;
            return (this.chrBanks[bank] << 12) + offset;
        }
        else {
            // 8 KB at a time
            return ((this.chrBanks[0] & 0x1E) << 12) + address;
        }
    }
    prgOffset(address) {
        address -= 0x8000;
        const bank = address >> 14;
        const offset = address & 0x3FFF;
        switch (this.prgBankMode) {
            case 0:
            case 1:
                // 0, 1: switch 32 KB at $8000, ignoring low bit of bank number
                return ((this.prgBank & 0x0E) << 14) + address;
            case 2:
                // 2: fix first bank at $8000 and switch 16 KB bank at $C000
                return bank === 0 ? offset : (this.prgBank << 14) + offset;
            case 3:
                // 3: fix last bank at $C000 and switch 16 KB bank at $8000
                return bank === 0 ? (this.prgBank << 14) + offset : ((this.prgBanks - 1) << 14) + offset;
        }
    }
}
//# sourceMappingURL=mapper1.js.map