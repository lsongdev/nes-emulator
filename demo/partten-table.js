import { getColor } from "../dist/emulator/palettes.js";

class ParttenTable {
  constructor(emulator, canvas, ppuAddress, context = canvas.getContext("2d"), imageData = context.createImageData(8, 8)) {
    this.emulator = emulator;
    this.canvas = canvas;
    this.ppuAddress = ppuAddress;
    this.context = context;
    this.imageData = imageData;
  }
  start() {
    this.interval = setInterval(() => {
      this.refresh();
    }, 1e3);
  }
  stop() {
    clearInterval(this.interval);
  }
  refresh() {
    const ppuBus = this.emulator.ppuBus;
    const data = new Uint8Array(4096).map((v, i) => ppuBus.readByte(this.ppuAddress + i));
    const tileColors = Array(256).fill(0).map((v, i) => {
      const tileL = data.slice(i * 16, i * 16 + 8);
      const tileH = data.slice(i * 16 + 8, i * 16 + 8 + 8);
      const arr = new Uint8Array(8 * 8);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const offset = (tileH[y] & 128 >> x ? 2 : 0) | (tileL[y] & 128 >> x ? 1 : 0);
          arr[y * 8 + x] = ppuBus.readByte(16128 + offset);
        }
      }
      return arr;
    });
    tileColors.forEach((colors, tileOffset) => {
      colors.forEach((color, i) => {
        const c = getColor(color);
        this.imageData.data[i * 4 + 0] = c >> 16 & 255;
        this.imageData.data[i * 4 + 1] = c >> 8 & 255;
        this.imageData.data[i * 4 + 2] = c >> 0 & 255;
        this.imageData.data[i * 4 + 3] = 255;
      });
      this.context.putImageData(this.imageData, tileOffset % 16 * 8, Math.floor(tileOffset / 16) * 8);
    });
  }
}
export {
  ParttenTable
};
