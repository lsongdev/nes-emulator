// CPU memory map: https://wiki.nesdev.com/w/index.php/CPU_memory_map
// 2A03 register map: http://wiki.nesdev.com/w/index.php/2A03
export class CPUBus {
    writeByte(address, data) {
        if (address < 0x2000) {
            // RAM
            this.ram.write(address & 0x07FF, data);
        }
        else if (address < 0x4000) {
            // PPU Registers
            this.ppu.cpuWrite(address & 0x2007, data);
        }
        else if (address === 0x4014) {
            // OAM DMA
            // TODO: DMA needs 512 cycles
            this.dma.copy(data << 8);
        }
        else if (address === 0x4016) {
            // Controller
            this.controller1.write(data);
            this.controller2.write(data);
        }
        else if (address < 0x4018) {
            // APU: $4000-$4013, $4015 and $4017
            this.apu.write(address, data);
        }
        else if (address < 0x4020) {
            // APU and I/O functionality that is normally disabled
        }
        else {
            // ROM
            this.cartridge.mapper.write(address, data);
        }
    }
    writeWord(address, data) {
        this.writeByte(address, data & 0xFF);
        this.writeByte(address + 1, (data >> 8) & 0xFF);
    }
    readByte(address) {
        if (address < 0x2000) {
            // RAM
            return this.ram.read(address & 0x07FF);
        }
        else if (address < 0x4000) {
            // PPU Registers
            return this.ppu.cpuRead(address & 0x2007);
        }
        else if (address === 0x4014) {
            // OAM DMA
            return 0;
        }
        else if (address === 0x4016 || address === 0x4017) {
            // Controller
            return address === 0x4016 ? this.controller1.read() : this.controller2.read();
        }
        else if (address < 0x4018) {
            // APU: $4000-$4013, $4015
            return this.apu.read(address);
        }
        else if (address < 0x4020) {
            // APU and I/O functionality that is normally disabled
            return 0;
        }
        else {
            // ROM
            return this.cartridge.mapper.read(address);
        }
    }
    readWord(address) {
        return (this.readByte(address + 1) << 8 | this.readByte(address)) & 0xFFFF;
    }
}
//# sourceMappingURL=cpu-bus.js.map