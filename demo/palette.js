import { getColor } from "../dist/emulator/palettes.js";
class Palette {
  constructor(emulator, canvas, ppuAddress, context = canvas.getContext("2d")) {
    this.emulator = emulator;
    this.canvas = canvas;
    this.ppuAddress = ppuAddress;
    this.context = context;
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
    const paletteData = Array(16).fill(0).map((v, i) => ppuBus.readByte(this.ppuAddress + i));
    const colors = paletteData.map(getColor);
    colors.forEach((c, i) => {
      this.context.fillStyle = `rgb(${c >> 16 & 255}, ${c >> 8 & 255}, ${c & 255})`;
      this.context.fillRect(i * 10, 0, i * 10 + 10, 10);
    });
  }
}
export {
  Palette
};
