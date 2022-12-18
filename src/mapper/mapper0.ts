import { IMapper } from '../api/mapper.js';
import {uint16, uint8} from '../api/types.js';
import { IInterrupt } from '../api/interrupt.js';
import { ICartridge } from '../api/cartridge.js';

// NROM: https://wiki.nesdev.com/w/index.php/NROM
export class Mapper0 implements IMapper {
  public interrupt: IInterrupt;

  private readonly isMirrored: boolean;

  constructor(
    private readonly cartridge: ICartridge,
    private readonly ram: Uint8Array,
    private readonly prg: Uint8Array,
    private readonly chr: Uint8Array,
  ) {
    this.isMirrored = prg.length === 16 * 1024;

    if (chr.length === 0) {
      // If there is no chr memory, treat it as ram
      this.chr = new Uint8Array(0x2000);
    }
  }

  public read(address: uint16): uint8 {
    address &= 0xFFFF;

    if (address < 0x2000) {
      return this.chr[this.parseAddress(address)];
    } else if (address >= 0x8000) {
      return this.prg[this.parseAddress(address)];
    } else if (address >= 0x6000) {
      return this.ram[address - 0x6000];
    } else {
      // TODO: Error handling
      return 0;
    }
  }

  public write(address: uint16, data: uint8): void {
    address &= 0xFFFF;

    if (address < 0x2000) {
      this.chr[this.parseAddress(address)] = data;
    } else if (address >= 0x8000) {
      this.prg[this.parseAddress(address)] = data;
    } else if (address >= 0x6000) {
      this.ram[address - 0x6000] = data;
    } else {
      // TODO: Error handling
    }
  }

  public ppuClockHandle(scanLine: number, cycle: number) {
    // Do nothing
  }

  // Refer to http://forums.nesdev.com/viewtopic.php?t=5494
  private parseAddress(address: uint16): uint16 {
    if (address < 0x2000) { // CHR
      return address;
    } else { // PRG
      return (this.isMirrored ? address & 0b1011111111111111 : address) - 0x8000;
    }
  }
}
