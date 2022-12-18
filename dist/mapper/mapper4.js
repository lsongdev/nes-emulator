import { Mirror } from '../api/cartridge.js';
// https://wiki.nesdev.com/w/index.php/MMC3#CHR_Banks
// register = ChrBankTable[chrA12Inversion][address >> 10]
const CHR_BANK_TABLE = [
    // CHR A12 inversion is 0
    [0, 0, 1, 1, 2, 3, 4, 5],
    // CHR A12 inversion is 1
    [2, 3, 4, 5, 0, 0, 1, 1],
];
// https://wiki.nesdev.com/w/index.php/MMC3#PRG_Banks
// register = PrgBankTable[prgBankMode][address >> 13]
const PRG_BANK_TABLE = [
    // PRG ROM bank mode is 0
    [6, 7, -2, -1],
    [-2, 7, 6, -1],
];
// MMC3: https://wiki.nesdev.com/w/index.php/MMC3
export class Mapper4 {
    constructor(cartridge, ram, prg, chr, prgBanks = prg.length >> 13) {
        this.cartridge = cartridge;
        this.ram = ram;
        this.prg = prg;
        this.chr = chr;
        this.prgBanks = prgBanks;
        this.R = new Uint8Array(8).fill(0); // R0 - R7
        this.register = 0; // Index of R
        this.prgBankMode = 0; // 0 or 1
        this.chrA12Inversion = 0; // 0 or 1
        this.isIrqEnable = false;
        this.irqReloadCounter = 0;
        this.irqCounter = 0;
        this.chr = new Uint8Array(256 * 1024);
        this.chr.set(chr);
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
            this.writeRegister(address, data);
        }
        else if (address >= 0x6000) {
            this.ram[address - 0x6000] = data;
        }
        else {
            // TODO: Error handling
        }
    }
    ppuClockHandle(scanLine, cycle) {
        if (cycle !== 260) {
            return;
        }
        if (scanLine > 239 && scanLine < 261) {
            return;
        }
        if (this.irqCounter === 0) {
            this.irqCounter = this.irqReloadCounter;
        }
        else {
            this.irqCounter--;
            if (this.irqCounter === 0 && this.isIrqEnable) {
                this.interrupt.irq();
            }
        }
    }
    readPrg(address) {
        return this.prg[this.parsePrgAddress(address)];
    }
    readChr(address) {
        return this.chr[this.parseChrAddress(address)];
    }
    writeChr(address, data) {
        this.chr[this.parseChrAddress(address)] = data;
    }
    parsePrgAddress(address) {
        const cpuBank = (address - 0x8000) >> 13;
        const offset = address & 0x1FFF;
        const register = PRG_BANK_TABLE[this.prgBankMode][cpuBank];
        const bank = register < 0 ? this.prgBanks + register : this.R[register];
        return ((bank << 13) + offset) % this.prg.length;
    }
    parseChrAddress(address) {
        const ppuBank = address >> 10;
        const offset = address & 0x03FF;
        const register = CHR_BANK_TABLE[this.chrA12Inversion][ppuBank];
        let bank = this.R[register];
        if ((register === 0 || register === 1) && ppuBank % 2) { // 2KB bank
            bank++;
        }
        return ((bank << 10) + offset) % this.chr.length;
    }
    writeRegister(address, data) {
        if (address < 0xA000) {
            if (address & 0x01) {
                // Bank data ($8001-$9FFF, odd)
                this.writeBankData(data);
            }
            else { // even
                // Bank select ($8000-$9FFE, even)
                this.writeBankSelect(data);
            }
        }
        else if (address < 0xC000) {
            if (address & 0x01) {
                // TODO: PRG RAM protect ($A001-$BFFF, odd)
            }
            else {
                // Mirroring ($A000-$BFFE, even)
                if (this.cartridge.info.mirror !== Mirror.FOUR_SCREEN) {
                    this.cartridge.info.mirror = data & 0x01 ? Mirror.HORIZONTAL : Mirror.VERTICAL;
                }
            }
        }
        else if (address < 0xE000) {
            if (address & 0x01) {
                // IRQ reload ($C001-$DFFF, odd)
                this.irqCounter = 0;
            }
            else {
                // IRQ latch ($C000-$DFFE, even)
                this.irqReloadCounter = data;
            }
        }
        else {
            if (address & 0x01) {
                // IRQ enable ($E001-$FFFF, odd)
                this.isIrqEnable = true;
            }
            else {
                // IRQ disable ($E000-$FFFE, even)
                this.isIrqEnable = false;
            }
        }
    }
    writeBankSelect(data) {
        this.register = data & 0x07;
        this.prgBankMode = data & 0x40 ? 1 : 0;
        this.chrA12Inversion = data & 0x80 ? 1 : 0;
    }
    writeBankData(data) {
        if (this.register === 6 || this.register === 7) {
            // R6 and R7 will ignore the top two bits
            data &= 0x3F;
        }
        else if (this.register === 0 || this.register === 1) {
            // R0 and R1 ignore the bottom bit
            data &= 0xFE;
        }
        this.R[this.register] = data;
    }
}
//# sourceMappingURL=mapper4.js.map