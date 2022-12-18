import { sprintf } from "./sprintf.js";
class PPURegister {
  constructor(emulator, element) {
    this.emulator = emulator;
    this.element = element;
  }
  start() {
    this.interval = setInterval(() => {
      this.refresh();
    }, 100);
  }
  stop() {
    clearInterval(this.interval);
  }
  refresh() {
    const ppu = this.emulator.ppu;
    const v = ppu.register.v;
    const t = ppu.register.t;
    const x = ppu.register.x;
    const w = ppu.register.w;
    const cycle = ppu.cycle;
    const scanLine = ppu.scanLine;
    const frame = ppu.frame;
    const txt = sprintf(
      "v:%04X t:%04X x:%1X w:%1X scanLine: %03d cycle: %03d frame: %d",
      v,
      t,
      x,
      w,
      scanLine,
      cycle,
      frame
    );
    this.element.innerHTML = `<code>${txt}</code>`;
  }
}
export {
  PPURegister
};
