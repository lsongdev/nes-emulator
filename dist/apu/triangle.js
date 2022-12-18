import { LENGTH_TABLE, TRIANGLE_VOLUME_TABLE } from './table.js';
export class Triangle {
    constructor() {
        this.volume = 0; // 0-15
        this.lengthCounter = 0; // 5bit
        this.lenghtCounterHalt = false;
        this.linearCounterLoad = 0; // 7bit
        this.linearCounterReloadFlag = false;
        this.linearCounterValue = 0;
        this.timer = 0; // 11bit
        this.internalTimer = 0;
        this.counter = 0;
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
            this.internalTimer = this.timer;
            this.step();
        }
        else {
            this.internalTimer--;
        }
    }
    processEnvelope() {
        // Do nothing
    }
    processLinearCounter() {
        // When the frame counter generates a linear counter clock, the following actions occur in order:
        //   - If the linear counter reload flag is set, the linear counter is reloaded with the counter reload value,
        //     otherwise if the linear counter is non-zero, it is decremented.
        //   - If the control flag is clear, the linear counter reload flag is cleared.
        if (this.linearCounterReloadFlag) {
            this.linearCounterValue = this.linearCounterLoad;
        }
        else if (this.linearCounterValue > 0) {
            this.linearCounterValue--;
        }
        if (!this.lenghtCounterHalt) {
            this.linearCounterReloadFlag = false;
        }
    }
    processLengthCounter() {
        if (!this.lenghtCounterHalt && this.lengthCounter > 0) {
            this.lengthCounter--;
        }
    }
    processSweep() {
        // Do nothing
    }
    write(offset, data) {
        switch (offset) {
            case 0:
                this.lenghtCounterHalt = !!(data & 0x80);
                this.linearCounterLoad = data & 0x7F;
                break;
            case 1:
                break;
            case 2:
                this.timer = this.timer & 0xFF00 | data;
                break;
            case 3:
                this.timer = this.timer & 0x00FF | (data << 8) & 0x07FF;
                this.lengthCounter = LENGTH_TABLE[data >> 3];
                this.linearCounterReloadFlag = true;
                this.internalTimer = 0;
                break;
        }
    }
    step() {
        this.counter++;
        if (!this.isEnabled || this.lengthCounter === 0 || this.linearCounterValue === 0) {
            // Eliminate popping noise
            this.counter--;
            this.volume = TRIANGLE_VOLUME_TABLE[this.counter & 0x1F];
        }
        else {
            this.volume = TRIANGLE_VOLUME_TABLE[this.counter & 0x1F];
        }
    }
}
//# sourceMappingURL=triangle.js.map