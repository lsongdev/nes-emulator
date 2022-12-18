import { sprintf } from "./sprintf.js";

class CpuRegister {
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
    const cpu = this.emulator.cpu;
    const PC = cpu.registers.PC;
    const SP = cpu.registers.SP;
    const A = cpu.registers.A;
    const X = cpu.registers.X;
    const Y = cpu.registers.Y;
    const P = cpu.registers.P;
    const txt = sprintf("PC:%04X SP:%02X A:%02X X:%02X Y:%02X P:%02X", PC, SP, A, X, Y, P);
    this.element.innerHTML = `<code>${txt}</code>`;
  }
}
export {
  CpuRegister
};
