import { CPUBus } from '../bus/cpu-bus.js';
import { IBus } from '../api/bus.js';
import { ICPU } from '../api/cpu.js';
import { CPU } from '../cpu/cpu.js';
import { Cartridge } from '../cartridge/cartridge.js';
import { RAM } from '../ram/ram.js';
import { IRAM } from '../api/ram.js';
import { PPU } from '../ppu/ppu.js';
import { IPPU } from '../api/ppu.js';
import { IEmulator, IOptions } from '../api/emulator.js';
import { PPUBus } from '../bus/ppu-bus.js';
import { getColor } from './palettes.js';
import { DMA } from '../dma/dma.js';
import { IDMA } from '../api/dma.js';
import { ICartridge } from '../api/cartridge.js';
import { IStandardController } from '../api/controller.js';
import { StandardController } from '../controller/standard-controller.js';
import { Interrupt } from '../interrupt/interrupt.js';
import { IInterrupt } from '../api/interrupt.js';
import { APU } from '../apu/apu.js';
import { IAPU } from '../api/apu.js';

export class Emulator implements IEmulator {
  public readonly standardController1: IStandardController;
  public readonly standardController2: IStandardController;
  public readonly sram: Uint8Array;

  private readonly cpu: ICPU;
  private readonly ppu: IPPU;
  private readonly cartridge: ICartridge;
  private readonly ppuRam: IRAM;
  private readonly cpuRam: IRAM;
  private readonly cpuBus: IBus;
  private readonly ppuBus: IBus;
  private readonly backgroundPalette: IRAM;
  private readonly spritePalette: IRAM;
  private readonly dma: IDMA;
  private readonly interrupt: IInterrupt;
  private readonly apu: IAPU;

  constructor(nesData: Uint8Array, options?: IOptions) {
    options = this.parseOptions(options);

    this.sram = new Uint8Array(8192);
    this.sram.set(options.sramLoad);

    const standardController1 = new StandardController();
    const standardController2 = new StandardController();
    const cartridge = new Cartridge(nesData, this.sram);
    const ppuRam = new RAM(1024 * 2, 0x2000); // 0x2000 ~ 0x2800
    const cpuRam = new RAM(1024 * 2, 0); // 0x0000 ~ 0x0800
    const backgroundPalette = new RAM(16, 0x3F00); // 0x3F00 ~ 0x3F10
    const spritePalette = new RAM(16, 0x3F10); // 0x3F10 ~ 0x3F20
    const dma = new DMA();
    const ppuBus = new PPUBus();
    const ppu = new PPU(pixels => options.onFrame(this.parsePalettePixels(pixels)));
    const cpuBus = new CPUBus();
    const cpu = new CPU();
    const interrupt = new Interrupt();
    const apu = new APU(options.sampleRate, options.onSample);

    cpu.bus = cpuBus;

    ppu.interrupt = interrupt;
    ppu.bus = ppuBus;
    ppu.mapper = cartridge.mapper;

    apu.cpuBus = cpuBus;
    apu.interrupt = interrupt;

    dma.cpu = cpu;
    dma.ppu = ppu;

    interrupt.cpu = cpu;

    ppuBus.cartridge = cartridge;
    ppuBus.ram = ppuRam;
    ppuBus.backgroundPallette = backgroundPalette;
    ppuBus.spritePallette = spritePalette;

    cpuBus.cartridge = cartridge;
    cpuBus.ram = cpuRam;
    cpuBus.ppu = ppu;
    cpuBus.dma = dma;
    cpuBus.controller1 = standardController1;
    cpuBus.controller2 = standardController2;
    cpuBus.apu = apu;

    cartridge.mapper.interrupt = interrupt;

    this.cpu = cpu;
    this.ppu = ppu;
    this.cartridge = cartridge;
    this.ppuRam = ppuRam;
    this.cpuRam = cpuRam;
    this.cpuBus = cpuBus;
    this.ppuBus = ppuBus;
    this.backgroundPalette = backgroundPalette;
    this.spritePalette = spritePalette;
    this.dma = dma;
    this.standardController1 = standardController1;
    this.standardController2 = standardController2;
    this.apu = apu;

    this.cpu.reset();
  }

  public clock(): void {
    this.cpu.clock();
    this.apu.clock();
    this.ppu.clock();
    this.ppu.clock();
    this.ppu.clock();
  }

  public frame(): void {
    const frame = (this.ppu as any).frame;
    while (true) {
      this.clock();

      const newFrame = (this.ppu as any).frame;
      if (newFrame !== frame) {
        break;
      }
    }
  }

  private parsePalettePixels(pixels: Uint8Array): Uint32Array {
    const arr = new Uint32Array(pixels.length);
    let ptr = 0;
    for (const p of pixels) {
      arr[ptr++] = getColor(p);
    }

    return arr;
  }

  private parseOptions(options?: IOptions): IOptions {
    options = options || {} as any;

    return {
      sampleRate: options.sampleRate || 48000,
      onSample: options.onSample || (() => { /* Do nothing */ }),
      onFrame: options.onFrame || (() => { /* Do nothing */ }),
      sramLoad: options.sramLoad || new Uint8Array(8192),
    };
  }
}
