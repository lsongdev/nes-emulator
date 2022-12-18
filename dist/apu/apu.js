import { Pulse } from './pulse.js';
import { Triangle } from './triangle.js';
import { Noise } from './noise.js';
import { Dmc } from './dmc.js';
export class APU {
    constructor(sampleRate = 48000, onSample) {
        this.sampleRate = sampleRate;
        this.onSample = onSample;
        this.pulse1 = new Pulse(1);
        this.pulse2 = new Pulse(2);
        this.triangle = new Triangle();
        this.noise = new Noise();
        this.dmc = new Dmc();
        this.frameInterruptFlag = false;
        // mode 0:    mode 1:       function
        // ---------  -----------  -----------------------------
        //  - - - f    - - - - -    IRQ (if bit 6 is clear)
        //  - l - l    - l - - l    Length counter and sweep
        //  e e e e    e e e - e    Envelope and linear counter
        this.mode = 0;
        this.isIRQEnabled = true;
        this.clocks = 0;
        this.sampleCounter = 0;
        this.frameCounter = 0;
    }
    set cpuBus(cpuBus) {
        this.dmc.cpuBus = cpuBus;
    }
    set interrupt(interrupt) {
        this.interruptLine = interrupt;
        this.dmc.interrupt = interrupt;
    }
    clock() {
        this.clocks++;
        if (this.clocks & 0x01) {
            this.pulse1.clock();
            this.pulse2.clock();
            this.noise.clock();
        }
        this.dmc.clock();
        this.triangle.clock();
        const count = Math.floor(this.clocks / (1789773 / this.sampleRate));
        if (count !== this.sampleCounter) {
            this.sampleCounter = count;
            this.sampleOutput();
        }
        const frameCount = Math.floor(this.clocks / (1789773 / 240));
        if (frameCount !== this.frameCounter) {
            this.frameCounter = frameCount;
            this.processFrameCounter();
        }
    }
    read(address) {
        if (address === 0x4015) {
            const data = (this.pulse1.lengthCounter > 0 ? 0x01 : 0) |
                (this.pulse2.lengthCounter > 0 ? 0x02 : 0) |
                (this.triangle.lengthCounter > 0 ? 0x04 : 0) |
                (this.noise.lengthCounter > 0 ? 0x08 : 0) |
                (this.dmc.bytesRemainingCounter > 0 ? 0x10 : 0) |
                (this.frameInterruptFlag ? 0x40 : 0) |
                (this.dmc.interruptFlag ? 0x80 : 0);
            // Reading this register clears the frame interrupt flag (but not the DMC interrupt flag).
            this.frameInterruptFlag = false;
            // TODO: If an interrupt flag was set at the same moment of the read, it will read back as 1 but it will not be cleared.
            return data;
        }
        else {
            return 0;
        }
    }
    write(address, data) {
        switch (address) {
            case 0x4000:
            case 0x4001:
            case 0x4002:
            case 0x4003:
                this.pulse1.write(address - 0x4000, data);
                break;
            case 0x4004:
            case 0x4005:
            case 0x4006:
            case 0x4007:
                this.pulse2.write(address - 0x4004, data);
                break;
            case 0x4008:
            case 0x4009:
            case 0x400A:
            case 0x400B:
                this.triangle.write(address - 0x4008, data);
                break;
            case 0x400C:
            case 0x400D:
            case 0x400E:
            case 0x400F:
                this.noise.write(address - 0x400C, data);
                break;
            case 0x4010:
            case 0x4011:
            case 0x4012:
            case 0x4013:
                this.dmc.write(address - 0x4010, data);
                break;
            case 0x4015:
                this.pulse1.isEnabled = !!(data & 0x01);
                this.pulse2.isEnabled = !!(data & 0x02);
                this.triangle.isEnabled = !!(data & 0x04);
                this.noise.isEnabled = !!(data & 0x08);
                this.dmc.isEnabled = !!(data & 0x10);
                // Writing to this register clears the DMC interrupt flag.
                this.dmc.interruptFlag = false;
                break;
            case 0x4017:
                this.frameCounter = 0;
                this.mode = data >> 7;
                this.isIRQEnabled = !(data & 0x40);
        }
    }
    // http://wiki.nesdev.com/w/index.php/APU_Mixer
    sampleOutput() {
        const pulseOut = 0.00752 * (this.pulse1.volume + this.pulse2.volume);
        const tndOut = 0.00851 * this.triangle.volume + 0.00494 * this.noise.volume + 0.00335 * this.dmc.volume;
        this.onSample(pulseOut + tndOut);
    }
    processFrameCounter() {
        if (this.mode === 0) { // 4 Step mode
            switch (this.frameCounter % 4) {
                case 0:
                    this.processEnvelopeAndLinearCounter();
                    break;
                case 1:
                    this.processLengthCounterAndSweep();
                    this.processEnvelopeAndLinearCounter();
                    break;
                case 2:
                    this.processEnvelopeAndLinearCounter();
                    break;
                case 3:
                    this.triggerIRQ();
                    this.processLengthCounterAndSweep();
                    this.processEnvelopeAndLinearCounter();
                    break;
            }
        }
        else { // 5 Step mode
            switch (this.frameCounter % 5) {
                case 0:
                    this.processEnvelopeAndLinearCounter();
                    break;
                case 1:
                    this.processLengthCounterAndSweep();
                    this.processEnvelopeAndLinearCounter();
                    break;
                case 2:
                    this.processEnvelopeAndLinearCounter();
                    break;
                case 3:
                    break;
                case 4:
                    this.processLengthCounterAndSweep();
                    this.processEnvelopeAndLinearCounter();
                    break;
            }
        }
    }
    processEnvelopeAndLinearCounter() {
        this.pulse1.processEnvelope();
        this.pulse2.processEnvelope();
        this.noise.processEnvelope();
        this.triangle.processLinearCounter();
    }
    processLengthCounterAndSweep() {
        this.pulse1.processLengthCounter();
        this.pulse2.processLengthCounter();
        this.triangle.processLengthCounter();
        this.noise.processLengthCounter();
        this.pulse1.processSweep();
        this.pulse2.processSweep();
    }
    triggerIRQ() {
        if (!this.isIRQEnabled) {
            return;
        }
        this.frameInterruptFlag = true;
        this.interruptLine.irq();
    }
}
//# sourceMappingURL=apu.js.map