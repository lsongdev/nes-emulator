import { SpriteSize } from '../api/ppu.js';
import { Controller } from './controller.js';
import { Mask } from './mask.js';
import { Status } from './status.js';
var Register;
(function (Register) {
    Register[Register["PPUCTRL"] = 8192] = "PPUCTRL";
    Register[Register["PPUMASK"] = 8193] = "PPUMASK";
    Register[Register["PPUSTATUS"] = 8194] = "PPUSTATUS";
    Register[Register["OAMADDR"] = 8195] = "OAMADDR";
    Register[Register["OAMDATA"] = 8196] = "OAMDATA";
    Register[Register["PPUSCROLL"] = 8197] = "PPUSCROLL";
    Register[Register["PPUADDR"] = 8198] = "PPUADDR";
    Register[Register["PPUDATA"] = 8199] = "PPUDATA";
})(Register || (Register = {}));
var SpriteAttribute;
(function (SpriteAttribute) {
    SpriteAttribute[SpriteAttribute["PALETTE_L"] = 1] = "PALETTE_L";
    SpriteAttribute[SpriteAttribute["PALETTE_H"] = 2] = "PALETTE_H";
    SpriteAttribute[SpriteAttribute["PRIORITY"] = 32] = "PRIORITY";
    SpriteAttribute[SpriteAttribute["FLIP_H"] = 64] = "FLIP_H";
    SpriteAttribute[SpriteAttribute["FLIP_V"] = 128] = "FLIP_V";
})(SpriteAttribute || (SpriteAttribute = {}));
var SpritePixel;
(function (SpritePixel) {
    SpritePixel[SpritePixel["PALETTE"] = 63] = "PALETTE";
    SpritePixel[SpritePixel["BEHIND_BG"] = 64] = "BEHIND_BG";
    SpritePixel[SpritePixel["ZERO"] = 128] = "ZERO";
})(SpritePixel || (SpritePixel = {}));
export class PPU {
    constructor(onFrame) {
        this.onFrame = onFrame;
        this.pixels = new Uint8Array(256 * 240); // NES color
        this.oamMemory = new Uint8Array(256);
        this.controller = new Controller();
        this.mask = new Mask();
        this.register = { v: 0, t: 0, x: 0, w: 0 };
        this.shiftRegister = {};
        this.latchs = {};
        this.status = new Status();
        this.nmiDelay = 0;
        // The PPUDATA read buffer (post-fetch): https://wiki.nesdev.com/w/index.php/PPU_registers#The_PPUDATA_read_buffer_.28post-fetch.29
        this.readBuffer = 0;
        this.frame = 0; // Frame counter
        this.scanLine = 240; // 0 ~ 261
        this.cycle = 340; // 0 ~ 340
        this.oamAddress = 0;
        this.secondaryOam = Array(8).fill(0).map(() => Object.create(null));
        this.spritePixels = new Array(256);
        // Least significant bits previously written into a PPU register
        this.previousData = 0;
    }
    // PPU timing: https://wiki.nesdev.com/w/images/4/4f/Ppu.svg
    clock() {
        // For odd frames, the cycle at the end of the scanline is skipped (this is done internally by jumping directly from (339,261) to (0,0)
        // However, this behavior can be bypassed by keeping rendering disabled until after this scanline has passed
        if (this.scanLine === 261 && this.cycle === 339 && this.frame & 0x01 && (this.mask.isShowBackground || this.mask.isShowSprite)) {
            this.updateCycle();
        }
        this.updateCycle();
        if (!this.mask.isShowBackground && !this.mask.isShowSprite) {
            return;
        }
        // Scanline 0 - 239: visible lines
        if (0 <= this.scanLine && this.scanLine <= 239) {
            // Cycle 0: do nothing
            // Cycle 1 - 64: Clear secondary OAM
            if (1 === this.cycle) {
                this.clearSecondaryOam();
            }
            // Cycle 65 - 256: Sprite evaluation for next scanline
            if (65 === this.cycle) {
                this.evalSprite();
            }
            // Cycle 1 - 256: fetch NT, AT, tile
            if (1 <= this.cycle && this.cycle <= 256) {
                this.shiftBackground();
                this.renderPixel();
                this.fetchTileRelatedData();
            }
            // Cycle 256
            if (this.cycle === 256) {
                this.incrementVerticalPosition();
            }
            // Cycle 257
            if (this.cycle === 257) {
                this.copyHorizontalBits();
            }
            // Cycle 257 - 320: Sprite fetches
            if (this.cycle === 257) {
                this.fetchSprite();
            }
            // Cycle 321 - 336: fetch NT, AT, tile
            if (321 <= this.cycle && this.cycle <= 336) {
                this.shiftBackground();
                this.fetchTileRelatedData();
            }
            // Cycle 337 - 340: unused NT fetches
        }
        // Scanline 240 - 260: Do nothing
        // Scanline 261: pre render line
        if (this.scanLine === 261) {
            // Cycle 0: do nothing
            // Cycle 1 - 256: fetch NT, AT, tile
            if (1 <= this.cycle && this.cycle <= 256) {
                this.shiftBackground();
                this.fetchTileRelatedData();
            }
            // Cycle 256
            if (this.cycle === 256) {
                this.incrementVerticalPosition();
            }
            // Cycle 257
            if (this.cycle === 257) {
                this.copyHorizontalBits();
            }
            // Cycle 257 - 320: do nothing
            // Cycle 280
            if (this.cycle === 280) {
                this.copyVerticalBits();
            }
            // Cycle 321 - 336: fetch NT, AT, tile
            if (321 <= this.cycle && this.cycle <= 336) {
                this.shiftBackground();
                this.fetchTileRelatedData();
            }
        }
    }
    cpuRead(address) {
        switch (address) {
            case Register.PPUCTRL:
                return this.readCtrl();
            case Register.PPUMASK:
                return this.readMask();
            case Register.PPUSTATUS:
                return this.readStatus();
            case Register.OAMADDR:
                return 0;
            case Register.OAMDATA:
                return this.readOAMData();
            case Register.PPUSCROLL:
                return 0;
            case Register.PPUADDR:
                return 0;
            case Register.PPUDATA:
                return this.readPPUData();
        }
    }
    cpuWrite(address, data) {
        data &= 0xFF;
        this.previousData = data & 0x1F;
        switch (address) {
            case Register.PPUCTRL:
                this.writeCtrl(data);
                break;
            case Register.PPUMASK:
                this.writeMask(data);
                break;
            case Register.PPUSTATUS:
                break;
            case Register.OAMADDR:
                this.writeOAMAddr(data);
                break;
            case Register.OAMDATA:
                this.writeOAMData(data);
                break;
            case Register.PPUSCROLL:
                this.writeScroll(data);
                break;
            case Register.PPUADDR:
                this.writePPUAddr(data);
                break;
            case Register.PPUDATA:
                this.writePPUData(data);
                break;
        }
    }
    dmaCopy(data) {
        for (let i = 0; i < 256; i++) {
            this.oamMemory[(i + this.oamAddress) & 0xFF] = data[i];
        }
    }
    writeCtrl(data) {
        this.controller.data = data;
        // t: ....BA.. ........ = d: ......BA
        this.register.t = this.register.t & 0xF3FF | (data & 0x03) << 10;
    }
    readCtrl() {
        return this.controller.data;
    }
    writeMask(data) {
        this.mask.data = data;
    }
    readMask() {
        return this.mask.data;
    }
    readStatus() {
        const data = this.status.data | this.previousData;
        // Clear VBlank flag
        this.status.isVBlankStarted = false;
        // w:                  = 0
        this.register.w = 0;
        return data;
    }
    writeOAMAddr(data) {
        this.oamAddress = data;
    }
    readOAMData() {
        return this.oamMemory[this.oamAddress];
    }
    writeOAMData(data) {
        this.oamMemory[this.oamAddress++ & 0xFF] = data;
    }
    writeScroll(data) {
        if (this.register.w === 0) {
            // t: ....... ...HGFED = d: HGFED...
            // x:              CBA = d: .....CBA
            // w:                  = 1
            this.register.t = this.register.t & 0xFFE0 | data >> 3;
            this.register.x = data & 0x07;
            this.register.w = 1;
        }
        else {
            // t: CBA..HG FED..... = d: HGFEDCBA
            // w:                  = 0
            this.register.t = this.register.t & 0x0C1F | (data & 0x07) << 12 | (data & 0xF8) << 2;
            this.register.w = 0;
        }
    }
    writePPUAddr(data) {
        if (this.register.w === 0) {
            // t: .FEDCBA ........ = d: ..FEDCBA
            // t: X...... ........ = 0
            // w:                  = 1
            this.register.t = this.register.t & 0x80FF | (data & 0x3F) << 8;
            this.register.w = 1;
        }
        else {
            // t: ....... HGFEDCBA = d: HGFEDCBA
            // v                   = t
            // w:                  = 0
            this.register.t = this.register.t & 0xFF00 | data;
            this.register.v = this.register.t;
            this.register.w = 0;
        }
    }
    readPPUData() {
        let data = this.bus.readByte(this.register.v);
        if (this.register.v <= 0x3EFF) { // Buffered read
            const tmp = this.readBuffer;
            this.readBuffer = data;
            data = tmp;
        }
        else {
            this.readBuffer = this.bus.readByte(this.register.v - 0x1000);
        }
        this.register.v += this.controller.vramIncrementStepSize;
        this.register.v &= 0x7FFF;
        return data;
    }
    writePPUData(data) {
        this.bus.writeByte(this.register.v, data);
        this.register.v += this.controller.vramIncrementStepSize;
    }
    updateCycle() {
        if (this.status.isVBlankStarted && this.controller.isNMIEnabled && this.nmiDelay-- === 0) {
            this.interrupt.nmi();
        }
        this.cycle++;
        if (this.cycle > 340) {
            this.cycle = 0;
            this.scanLine++;
            if (this.scanLine > 261) {
                this.scanLine = 0;
                this.frame++;
                this.onFrame(this.pixels);
            }
        }
        // Set VBlank flag
        if (this.scanLine === 241 && this.cycle === 1) {
            this.status.isVBlankStarted = true;
            // Trigger NMI
            if (this.controller.isNMIEnabled) {
                this.nmiDelay = 15;
            }
        }
        // Clear VBlank flag and Sprite0 Overflow
        if (this.scanLine === 261 && this.cycle === 1) {
            this.status.isVBlankStarted = false;
            this.status.isZeroSpriteHit = false;
            this.status.isSpriteOverflow = false;
        }
        if (this.mask.isShowBackground || this.mask.isShowSprite) {
            this.mapper.ppuClockHandle(this.scanLine, this.cycle);
        }
    }
    fetchTileRelatedData() {
        if (!this.mask.isShowBackground) {
            return;
        }
        switch (this.cycle & 0x07) {
            case 1:
                this.loadBackground();
                this.fetchNameTable();
                break;
            case 3:
                this.fetchAttributeTable();
                break;
            case 5:
                this.fetchLowBackgroundTileByte();
                break;
            case 7:
                this.fetchHighBackgroundTileByte();
                break;
            case 0:
                this.incrementHorizontalPosition();
                break;
        }
    }
    fetchNameTable() {
        const address = 0x2000 | (this.register.v & 0x0FFF);
        this.latchs.nameTable = this.bus.readByte(address);
    }
    fetchAttributeTable() {
        const address = 0x23C0 |
            (this.register.v & 0x0C00) |
            ((this.register.v >> 4) & 0x38) |
            ((this.register.v >> 2) & 0x07);
        const isRight = !!(this.register.v & 0x02);
        const isBottom = !!(this.register.v & 0x40);
        const offset = (isBottom ? 0x02 : 0) | (isRight ? 0x01 : 0);
        this.latchs.attributeTable = this.bus.readByte(address) >> (offset << 1) & 0x03;
    }
    fetchLowBackgroundTileByte() {
        const address = this.controller.backgroundPatternTableAddress +
            this.latchs.nameTable * 16 +
            (this.register.v >> 12 & 0x07);
        this.latchs.lowBackgorundTailByte = this.bus.readByte(address);
    }
    fetchHighBackgroundTileByte() {
        const address = this.controller.backgroundPatternTableAddress +
            this.latchs.nameTable * 16 +
            (this.register.v >> 12 & 0x07) + 8;
        this.latchs.highBackgorundTailByte = this.bus.readByte(address);
    }
    loadBackground() {
        this.shiftRegister.lowBackgorundTailBytes |= this.latchs.lowBackgorundTailByte;
        this.shiftRegister.highBackgorundTailBytes |= this.latchs.highBackgorundTailByte;
        this.shiftRegister.lowBackgroundAttributeByes |= (this.latchs.attributeTable & 0x01) ? 0xFF : 0;
        this.shiftRegister.highBackgroundAttributeByes |= (this.latchs.attributeTable & 0x02) ? 0xFF : 0;
    }
    shiftBackground() {
        if (!this.mask.isShowBackground) {
            return;
        }
        this.shiftRegister.lowBackgorundTailBytes <<= 1;
        this.shiftRegister.highBackgorundTailBytes <<= 1;
        this.shiftRegister.lowBackgroundAttributeByes <<= 1;
        this.shiftRegister.highBackgroundAttributeByes <<= 1;
    }
    // Between cycle 328 of a scanline, and 256 of the next scanline
    incrementHorizontalPosition() {
        if ((this.register.v & 0x001F) === 31) {
            this.register.v &= ~0x001F;
            this.register.v ^= 0x0400;
        }
        else {
            this.register.v += 1;
        }
    }
    // At cycle 256 of each scanline
    incrementVerticalPosition() {
        if ((this.register.v & 0x7000) !== 0x7000) {
            this.register.v += 0x1000;
        }
        else {
            this.register.v &= ~0x7000;
            let y = (this.register.v & 0x03E0) >> 5;
            if (y === 29) {
                y = 0;
                this.register.v ^= 0x0800;
            }
            else if (y === 31) {
                y = 0;
            }
            else {
                y += 1;
            }
            this.register.v = (this.register.v & ~0x03E0) | (y << 5);
        }
    }
    // At cycle 257 of each scanline
    copyHorizontalBits() {
        // v: ....F.. ...EDCBA = t: ....F.. ...EDCBA
        this.register.v = (this.register.v & 0b1111101111100000) | (this.register.t & ~0b1111101111100000) & 0x7FFF;
    }
    // During cycles 280 to 304 of the pre-render scanline (end of vblank)
    copyVerticalBits() {
        // v: IHGF.ED CBA..... = t: IHGF.ED CBA.....
        this.register.v = (this.register.v & 0b1000010000011111) | (this.register.t & ~0b1000010000011111) & 0x7FFF;
    }
    renderPixel() {
        const x = this.cycle - 1;
        const y = this.scanLine;
        const offset = 0x8000 >> this.register.x;
        const bit0 = this.shiftRegister.lowBackgorundTailBytes & offset ? 1 : 0;
        const bit1 = this.shiftRegister.highBackgorundTailBytes & offset ? 1 : 0;
        const bit2 = this.shiftRegister.lowBackgroundAttributeByes & offset ? 1 : 0;
        const bit3 = this.shiftRegister.highBackgroundAttributeByes & offset ? 1 : 0;
        const paletteIndex = bit3 << 3 | bit2 << 2 | bit1 << 1 | bit0 << 0;
        const spritePaletteIndex = this.spritePixels[x] & SpritePixel.PALETTE;
        const isTransparentSprite = spritePaletteIndex % 4 === 0 || !this.mask.isShowSprite;
        const isTransparentBackground = paletteIndex % 4 === 0 || !this.mask.isShowBackground;
        let address = 0x3F00;
        if (isTransparentBackground) {
            if (isTransparentSprite) {
                // Do nothing
            }
            else {
                address = 0x3F10 + spritePaletteIndex;
            }
        }
        else {
            if (isTransparentSprite) {
                address = 0x3F00 + paletteIndex;
            }
            else {
                // Sprite 0 hit does not happen:
                //   - If background or sprite rendering is disabled in PPUMASK ($2001)
                //   - At x=0 to x=7 if the left-side clipping window is enabled (if bit 2 or bit 1 of PPUMASK is 0).
                //   - At x=255, for an obscure reason related to the pixel pipeline.
                //   - At any pixel where the background or sprite pixel is transparent (2-bit color index from the CHR pattern is %00).
                //   - If sprite 0 hit has already occurred this frame. Bit 6 of PPUSTATUS ($2002) is cleared to 0 at dot 1 of the pre-render line.
                //     This means only the first sprite 0 hit in a frame can be detected.
                if (this.spritePixels[x] & SpritePixel.ZERO) {
                    if ((!this.mask.isShowBackground || !this.mask.isShowSprite) ||
                        (0 <= x && x <= 7 && (!this.mask.isShowSpriteLeft8px || !this.mask.isShowBackgroundLeft8px)) ||
                        x === 255
                    // TODO: Only the first sprite 0 hit in a frame can be detected.
                    ) {
                        // Sprite 0 hit does not happen
                    }
                    else {
                        this.status.isZeroSpriteHit = true;
                    }
                }
                address = this.spritePixels[x] & SpritePixel.BEHIND_BG ? 0x3F00 + paletteIndex : 0x3F10 + spritePaletteIndex;
            }
        }
        this.pixels[x + y * 256] = this.bus.readByte(address);
    }
    clearSecondaryOam() {
        if (!this.mask.isShowSprite) {
            return;
        }
        this.secondaryOam.forEach(oam => {
            oam.attributes = 0xFF;
            oam.tileIndex = 0xFF;
            oam.x = 0xFF;
            oam.y = 0xFF;
        });
    }
    evalSprite() {
        if (!this.mask.isShowSprite) {
            return;
        }
        let spriteCount = 0;
        // Find eligible sprites
        for (let i = 0; i < 64; i++) {
            const y = this.oamMemory[i * 4];
            if (this.scanLine < y || (this.scanLine >= y + this.controller.spriteSize)) {
                continue;
            }
            // Overflow?
            if (spriteCount === 8) {
                this.status.isSpriteOverflow = true;
                break;
            }
            const oam = this.secondaryOam[spriteCount++];
            oam.y = y;
            oam.tileIndex = this.oamMemory[i * 4 + 1];
            oam.attributes = this.oamMemory[i * 4 + 2];
            oam.x = this.oamMemory[i * 4 + 3];
            oam.isZero = i === 0;
        }
    }
    fetchSprite() {
        if (!this.mask.isShowSprite) {
            return;
        }
        this.spritePixels.fill(0);
        for (const sprite of this.secondaryOam.reverse()) {
            // Hidden sprite?
            if (sprite.y >= 0xEF) {
                continue;
            }
            const isBehind = !!(sprite.attributes & SpriteAttribute.PRIORITY);
            const isZero = sprite.isZero;
            const isFlipH = !!(sprite.attributes & SpriteAttribute.FLIP_H);
            const isFlipV = !!(sprite.attributes & SpriteAttribute.FLIP_V);
            // Caculate tile address
            let address;
            if (this.controller.spriteSize === SpriteSize.SIZE_8X8) {
                const baseAddress = this.controller.spritePatternTableAddress + (sprite.tileIndex << 4);
                const offset = isFlipV ? (7 - this.scanLine + sprite.y) : (this.scanLine - sprite.y);
                address = baseAddress + offset;
            }
            else {
                const baseAddress = ((sprite.tileIndex & 0x01) ? 0x1000 : 0x0000) + ((sprite.tileIndex & 0xFE) << 4);
                const offset = isFlipV ? (15 - this.scanLine + sprite.y) : (this.scanLine - sprite.y);
                address = baseAddress + offset % 8 + Math.floor(offset / 8) * 16;
            }
            // Fetch tile data
            const tileL = this.bus.readByte(address);
            const tileH = this.bus.readByte(address + 8);
            // Generate sprite pixels
            for (let i = 0; i < 8; i++) {
                const b = isFlipH ? 0x01 << i : 0x80 >> i;
                const bit0 = tileL & b ? 1 : 0;
                const bit1 = tileH & b ? 1 : 0;
                const bit2 = sprite.attributes & SpriteAttribute.PALETTE_L ? 1 : 0;
                const bit3 = sprite.attributes & SpriteAttribute.PALETTE_H ? 1 : 0;
                const index = bit3 << 3 | bit2 << 2 | bit1 << 1 | bit0;
                if (index % 4 === 0 && (this.spritePixels[sprite.x + i] & SpritePixel.PALETTE) % 4 !== 0) {
                    continue;
                }
                this.spritePixels[sprite.x + i] = index |
                    (isBehind ? SpritePixel.BEHIND_BG : 0) |
                    (isZero ? SpritePixel.ZERO : 0);
            }
        }
    }
}
//# sourceMappingURL=ppu.js.map