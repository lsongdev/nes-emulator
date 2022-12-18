import { Mirror } from "../dist/api/cartridge.js";
import { sprintf } from "./sprintf.js";

class Status {
  constructor(emulator, element) {
    this.emulator = emulator;
    this.element = element;
    this.lastFrame = 0;
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
    const frame = this.emulator.ppu.frame;
    const cartridge = this.emulator.cartridge;
    const txt = sprintf(
      "PRG:%dx16KB CHR:%dx8KB mapper#:%d mirror:%s battery-backed:%s trained:%s fps:%d",
      cartridge.info.prg,
      cartridge.info.chr,
      cartridge.info.mapper,
      Mirror[cartridge.info.mirror],
      cartridge.info.hasBatteryBacked ? "yes" : "no",
      cartridge.info.isTrained ? "yes" : "no",
      frame - this.lastFrame
    );
    this.element.innerHTML = `<code>${txt}</code>`;
    this.lastFrame = frame;
  }
}
export {
  Status
};
