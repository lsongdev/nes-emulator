import { LENGTH_TABLE, NOISE_PEROID_TABLE } from './table.js';
export class Noise {
    constructor() {
        this.volume = 0; // 4bit
        this.lengthCounter = 0;
        this.isLengthCounterHalt = false;
        this.isConstantVolume = false;
        this.envelopeValue = 0;
        this.envelopeVolume = 0;
        this.envelopeCounter = 0;
        this.isLoopNoise = false;
        this.noisePeriod = 0;
        this.internalTimer = 0;
        this.enable = false;
    }
    get isEnabled() {
        return this.enable;
    }
    set isEnabled(isEnabled) {
        this.enable = isEnabled;
        if (!isEnabled) {
            this.lengthCounter = 0;
        }
    }
    clock() {
        if (!this.isEnabled) {
            return;
        }
        if (this.internalTimer === 0) {
            this.internalTimer = this.noisePeriod;
            this.step();
        }
        else {
            this.internalTimer--;
        }
    }
    processEnvelope() {
        if (this.isConstantVolume) {
            return;
        }
        if (this.envelopeCounter % (this.envelopeValue + 1) === 0) {
            if (this.envelopeVolume === 0) {
                this.envelopeVolume = this.isLengthCounterHalt ? 15 : 0;
            }
            else {
                this.envelopeVolume--;
            }
        }
        this.envelopeCounter++;
    }
    processLinearCounter() {
        // Do nothing
    }
    processLengthCounter() {
        if (!this.isLengthCounterHalt && this.lengthCounter > 0) {
            this.lengthCounter--;
        }
    }
    processSweep() {
        // Do nothing
    }
    write(offset, data) {
        switch (offset) {
            case 0:
                this.isLengthCounterHalt = !!(data & 0x20);
                this.isConstantVolume = !!(data & 0x10);
                this.envelopeValue = data & 0x0F;
                this.envelopeVolume = 15;
                this.envelopeCounter = 0;
                break;
            case 1:
                break;
            case 2:
                this.isLoopNoise = !!(data & 0x80);
                this.noisePeriod = NOISE_PEROID_TABLE[data & 0x0F];
                this.internalTimer = 0;
                break;
            case 3:
                this.lengthCounter = LENGTH_TABLE[data >> 3];
                break;
        }
    }
    step() {
        if (!this.isEnabled || this.lengthCounter === 0) {
            this.volume = 0;
        }
        else if (this.isConstantVolume) {
            this.volume = Math.floor(Math.random() * this.envelopeValue);
        }
        else {
            this.volume = Math.floor(Math.random() * this.envelopeVolume);
        }
    }
}
//# sourceMappingURL=noise.js.map