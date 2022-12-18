import { CPUBus } from '../bus/cpu-bus.js';
import { CPU } from '../cpu/cpu.js';
import { Cartridge } from '../cartridge/cartridge.js';
import { RAM } from '../ram/ram.js';
import { PPU } from '../ppu/ppu.js';
import { PPUBus } from '../bus/ppu-bus.js';
import { getColor } from './palettes.js';
import { DMA } from '../dma/dma.js';
import { StandardController } from '../controller/standard-controller.js';
import { Interrupt } from '../interrupt/interrupt.js';
import { APU } from '../apu/apu.js';
export class Emulator {
    constructor(nesData, options) {
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
    clock() {
        this.cpu.clock();
        this.apu.clock();
        this.ppu.clock();
        this.ppu.clock();
        this.ppu.clock();
    }
    frame() {
        const frame = this.ppu.frame;
        while (true) {
            this.clock();
            const newFrame = this.ppu.frame;
            if (newFrame !== frame) {
                break;
            }
        }
    }
    parsePalettePixels(pixels) {
        const arr = new Uint32Array(pixels.length);
        let ptr = 0;
        for (const p of pixels) {
            arr[ptr++] = getColor(p);
        }
        return arr;
    }
    parseOptions(options) {
        options = options || {};
        return {
            sampleRate: options.sampleRate || 48000,
            onSample: options.onSample || (() => { }),
            onFrame: options.onFrame || (() => { }),
            sramLoad: options.sramLoad || new Uint8Array(8192),
        };
    }
}
//# sourceMappingURL=emulator.js.map