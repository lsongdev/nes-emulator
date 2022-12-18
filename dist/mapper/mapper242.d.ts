import { IMapper } from '../api/mapper.js';
import { ICartridge } from '../api/cartridge.js';
import { IInterrupt } from '../api/interrupt.js';
import { uint16, uint8 } from '../api/types.js';
export declare class Mapper242 implements IMapper {
    private readonly cartridge;
    private readonly ram;
    private readonly prg;
    private readonly chr;
    interrupt: IInterrupt;
    private prgBankSelect;
    constructor(cartridge: ICartridge, ram: Uint8Array, prg: Uint8Array, chr: Uint8Array);
    read(address: uint16): uint8;
    write(address: uint16, data: uint8): void;
    ppuClockHandle(scanLine: number, cycle: number): void;
}
