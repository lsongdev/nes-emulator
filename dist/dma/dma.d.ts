import { IDMA } from '../api/dma.js';
import { IPPU } from '../api/ppu.js';
import { ICPU } from '../api/cpu.js';
export declare class DMA implements IDMA {
    cpu: ICPU;
    ppu: IPPU;
    copy(cpuBusAddr: number): void;
}
