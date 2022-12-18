import { IInterrupt } from '../api/interrupt.js';
import { ICPU } from '../api/cpu.js';

export class Interrupt implements IInterrupt {
  public cpu: ICPU;

  public irq(): void {
    this.cpu.irq();
  }

  public nmi(): void {
    this.cpu.nmi();
  }
}
