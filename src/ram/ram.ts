import { IRAM } from '../api/ram.js';
import { uint16, uint8 } from '../api/types.js';

export class RAM implements IRAM {
  private readonly ram: Uint8Array;

  constructor(size: number, private readonly offset = 0) {
    this.ram = new Uint8Array(size);
  }

  public read(address: uint16): uint8 {
    address = (address - this.offset) & 0xFFFF;

    return this.ram[address];
  }

  public write(address: uint16, data: uint8): void {
    address = (address - this.offset) & 0xFFFF;

    this.ram[address] = data;
  }
}
