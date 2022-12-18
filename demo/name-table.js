import { getColor } from "../dist/emulator/palettes.js";
class NameTable {
  constructor(emulator, canvas, context = canvas.getContext("2d"), imageData = context.createImageData(8, 8)) {
    this.emulator = emulator;
    this.canvas = canvas;
    this.context = context;
    this.imageData = imageData;
    this.AddressTable = [8192, 9216, 10240, 11264];
  }
  start() {
    this.interval = setInterval(() => {
      this.refresh();
    }, 300);
  }
  stop() {
    clearInterval(this.interval);
  }
  refresh() {
    const ppu = this.emulator.ppu;
    const ppuBus = this.emulator.ppuBus;
    for (let screen = 0; screen < 4; screen++) {
      const baseAddress = this.AddressTable[screen];
      for (let i = 0; i < 32 * 30; i++) {
        const tile = ppuBus.readByte(baseAddress + i);
        const coarseX = i & 31;
        const coarseY = i >> 5;
        const attributeOffset = coarseY >> 2 << 3 | (coarseX & 31) >> 2;
        const attributeTable = ppuBus.readByte(baseAddress + 960 + attributeOffset);
        const isRight = !!(coarseX & 2);
        const isBottom = !!(coarseY & 2);
        const offset = (isBottom ? 2 : 0) | (isRight ? 1 : 0);
        const at = attributeTable >> (offset << 1) & 3;
        let imageDataOffset = 0;
        for (let y = 0; y < 8; y++) {
          const tileDataL = ppuBus.readByte(ppu.controller.backgroundPatternTableAddress + (tile << 4) + y);
          const tileDataH = ppuBus.readByte(ppu.controller.backgroundPatternTableAddress + (tile << 4) + y + 8);
          for (let x = 0; x < 8; x++) {
            const bit0 = tileDataL >> 7 - x & 1;
            const bit1 = tileDataH >> 7 - x & 1;
            const index = bit1 << 1 | bit0 << 0 | at << 2;
            const color = getColor(ppuBus.readByte(16128 + index));
            this.imageData.data[imageDataOffset++] = color >> 16 & 255;
            this.imageData.data[imageDataOffset++] = color >> 8 & 255;
            this.imageData.data[imageDataOffset++] = color >> 0 & 255;
            this.imageData.data[imageDataOffset++] = 255;
          }
        }
        switch (screen) {
          case 0:
            this.context.putImageData(this.imageData, coarseX * 8, coarseY * 8);
            break;
          case 1:
            this.context.putImageData(this.imageData, coarseX * 8 + 256, coarseY * 8);
            break;
          case 2:
            this.context.putImageData(this.imageData, coarseX * 8, coarseY * 8 + 240);
            break;
          case 3:
            this.context.putImageData(this.imageData, coarseX * 8 + 256, coarseY * 8 + 240);
            break;
        }
      }
    }
  }
}
export {
  NameTable
};
