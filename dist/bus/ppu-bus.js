import { Mirror } from '../api/cartridge.js';
// PPU memory map: https://wiki.nesdev.com/w/index.php/PPU_memory_map
export class PPUBus {
    readByte(address) {
        address &= 0x3FFF;
        if (address < 0x2000) {
            // Pattern table 0 - 1
            return this.cartridge.mapper.read(address);
        }
        else if (address < 0x3000) {
            // Nametable 0 - 3
            return this.ram.read(this.parseMirrorAddress(address));
        }
        else if (address < 0x3F00) {
            // Mirrors of $2000-$2EFF
            return this.readByte(address - 0x1000);
        }
        else {
            // Palette RAM indexes
            address &= 0x3F1F;
            if (address < 0x3F10) { // Background pallette
                return this.backgroundPallette.read(address);
            }
            else { // Sprite pallette
                // Refer to https://wiki.nesdev.com/w/index.php/PPU_palettes
                // Addresses $3F10/$3F14/$3F18/$3F1C are mirrors of $3F00/$3F04/$3F08/$3F0C
                if (!(address & 0b11)) {
                    address -= 0x10;
                    return this.backgroundPallette.read(address);
                }
                return this.spritePallette.read(address);
            }
        }
    }
    writeByte(address, data) {
        address &= 0x3FFF;
        if (address < 0x2000) {
            // Pattern table 0 - 1
            this.cartridge.mapper.write(address, data);
        }
        else if (address < 0x3000) {
            // Nametable 0 - 3
            this.ram.write(this.parseMirrorAddress(address), data);
        }
        else if (address < 0x3F00) {
            // Mirrors of $2000-$2EFF
            return this.writeByte(address - 0x1000, data);
        }
        else {
            // Palette RAM indexes
            address &= 0x3F1F;
            if (address < 0x3F10) { // Background pallette
                this.backgroundPallette.write(address, data);
            }
            else { // Sprite pallette
                // Refer to https://wiki.nesdev.com/w/index.php/PPU_palettes
                // Addresses $3F10/$3F14/$3F18/$3F1C are mirrors of $3F00/$3F04/$3F08/$3F0C
                if (!(address & 0b11)) {
                    address -= 0x10;
                    return this.backgroundPallette.write(address, data);
                }
                this.spritePallette.write(address, data);
            }
        }
    }
    readWord(address) {
        return this.readByte(address + 1) << 8 | this.readByte(address);
    }
    writeWord(address, data) {
        this.writeByte(address, data);
        this.writeByte(address + 1, data >> 8);
    }
    parseMirrorAddress(address) {
        switch (this.cartridge.info.mirror) {
            case Mirror.HORIZONTAL:
                return (address & 9215) | (address & 2048 ? 1024 : 0);
            case Mirror.VERTICAL:
                return address & 0x27FF;
            case Mirror.FOUR_SCREEN:
                return address;
            case Mirror.SINGLE_SCREEN_LOWER_BANK:
                return address & 0x23FF;
            case Mirror.SINGLE_SCREEN_UPPER_BANK:
                return address & 0x23FF + 0x0400;
            default:
                throw new Error(`Invalid mirror type: '${this.cartridge.info.mirror}'`);
        }
    }
}
//# sourceMappingURL=ppu-bus.js.map