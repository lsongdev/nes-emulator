import { IInterrupt } from '../api/interrupt.js';
import { ICPU } from '../api/cpu.js';
export declare class Interrupt implements IInterrupt {
    cpu: ICPU;
    irq(): void;
    nmi(): void;
}
