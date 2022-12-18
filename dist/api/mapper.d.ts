import { uint16, uint8 } from './types.js';
import { IInterrupt } from './interrupt.js';
export interface IMapper {
    read(address: uint16): uint8;
    write(address: uint16, data: uint8): void;
    ppuClockHandle(scanLine: number, cycle: number): any;
    interrupt: IInterrupt;
}
