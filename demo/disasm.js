import { sprintf } from "./sprintf.js";
import OPCODE_TABLE, { AddressingMode, Instruction } from "../dist/cpu/opcode-table.js";

class DisASM {
  constructor(emulator, element) {
    this.emulator = emulator;
    this.element = element;
    this.cpuBus = this.emulator.cpu.bus;
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
    const disGen = this.disASM(cpu.registers.PC);
    const instrList = Array(30).fill(0).map(() => disGen.next().value);
    this.element.innerHTML = instrList.map((v) => `<p><code>${v}</code></p>`).join("\n");
  }
  *disASM(pc) {
    for (let i = pc; i < 65535;) {
      const opcode = this.cpuBus.readByte(i++);
      const entry = OPCODE_TABLE[opcode];
      if (!entry) {
        yield sprintf("%04X: UNDEFINED", i - 1);
        continue;
      }
      const data = new Uint8Array(entry.bytes - 1).fill(0).map(() => this.cpuBus.readByte(i++));
      yield sprintf(
        "%04X: %s %s",
        i - entry.bytes,
        Instruction[entry.instruction],
        this.parseAddressingMode(i - entry.bytes, entry.addressingMode, data)
      );
    }
  }
  parseAddressingMode(pc, mode, data) {
    switch (mode) {
      case AddressingMode.ABSOLUTE:
        return sprintf("$%04X", data[1] << 8 | data[0]);
      case AddressingMode.ABSOLUTE_X:
        return sprintf("$%04X, X", data[1] << 8 | data[0]);
      case AddressingMode.ABSOLUTE_Y:
        return sprintf("$%04X, Y", data[1] << 8 | data[0]);
      case AddressingMode.ACCUMULATOR:
        return "A";
      case AddressingMode.IMMEDIATE:
        return sprintf("#$%02X", data[0]);
      case AddressingMode.IMPLICIT:
        return "";
      case AddressingMode.INDIRECT:
        return sprintf("($%04X)", data[1] << 8 | data[0]);
      case AddressingMode.INDIRECT_Y_INDEXED:
        return sprintf("($%02X), Y", data[0]);
      case AddressingMode.X_INDEXED_INDIRECT:
        return sprintf("($%02X, X)", data[0]);
      case AddressingMode.RELATIVE:
        return sprintf("$%04X", data[0] & 128 ? pc - (256 - data[0]) : pc + data[0]);
      case AddressingMode.ZERO_PAGE:
        return sprintf("$%02X", data[0]);
      case AddressingMode.ZERO_PAGE_X:
        return sprintf("$%02X, X", data[0]);
      case AddressingMode.ZERO_PAGE_Y:
        return sprintf("$%02X, Y", data[0]);
      default:
        throw new Error("Invalid addressing mode");
    }
  }
}
export {
  DisASM
};
