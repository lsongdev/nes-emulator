import { DUTY_TABLE, LENGTH_TABLE } from './table.js';
export class Pulse {
    constructor(channel) {
        this.channel = channel;
        this.volume = 0; // 0-15
        this.lengthCounter = 0; // 5bit
        this.duty = 0; // 2bit
        this.isEnvelopeLoop = false;
        this.isConstantVolume = false;
        this.envelopeValue = 0; // 4bit
        this.envelopeVolume = 0; // 4bit
        this.envelopeCounter = 0;
        this.isSweepEnabled = false;
        this.sweepPeriod = 0; // 3bit
        this.isSweepNegated = false;
        this.sweepShift = 0; // 3bit
        this.sweepCounter = 0;
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
        if (this.isConstantVolume) {
            return;
        }
        if (this.envelopeCounter % (this.envelopeValue + 1) === 0) {
            if (this.envelopeVolume === 0) {
                this.envelopeVolume = this.isEnvelopeLoop ? 15 : 0;
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
        if (!this.isEnvelopeLoop && this.lengthCounter > 0) {
            this.lengthCounter--;
        }
    }
    processSweep() {
        if (!this.isSweepEnabled) {
            return;
        }
        if (this.sweepCounter % (this.sweepPeriod + 1) === 0) {
            // 1. A barrel shifter shifts the channel's 11-bit raw timer period right by the shift count, producing the change amount.
            // 2. If the negate flag is true, the change amount is made negative.
            // 3. The target period is the sum of the current period and the change amount.
            const changeAmount = this.isSweepNegated ? -(this.timer >> this.sweepShift) : this.timer >> this.sweepShift;
            this.timer += changeAmount;
            // The two pulse channels have their adders' carry inputs wired differently,
            // which produces different results when each channel's change amount is made negative:
            //   - Pulse 1 adds the ones' complement (−c − 1). Making 20 negative produces a change amount of −21.
            //   - Pulse 2 adds the two's complement (−c). Making 20 negative produces a change amount of −20.
            if (this.channel === 1 && changeAmount <= 0) {
                this.timer--;
            }
        }
        this.sweepCounter++;
    }
    write(offset, data) {
        switch (offset) {
            case 0:
                this.duty = data >> 6;
                this.isEnvelopeLoop = !!(data & 0x20);
                this.isConstantVolume = !!(data & 0x10);
                this.envelopeValue = data & 0x0F;
                this.envelopeVolume = 15;
                this.envelopeCounter = 0;
                break;
            case 1:
                this.isSweepEnabled = !!(data & 0x80);
                this.sweepPeriod = data >> 4 & 0x07;
                this.isSweepNegated = !!(data & 0x08);
                this.sweepShift = data & 0x07;
                this.sweepCounter = 0;
                break;
            case 2:
                this.timer = this.timer & 0xFF00 | data;
                break;
            case 3:
                this.timer = this.timer & 0x00FF | (data << 8) & 0x07FF;
                this.lengthCounter = LENGTH_TABLE[data >> 3];
                this.internalTimer = 0;
                break;
        }
    }
    step() {
        this.counter++;
        // If at any time the target period is greater than $7FF, the sweep unit mutes the channel
        // If the current period is less than 8, the sweep unit mutes the channel
        if (!this.isEnabled || this.lengthCounter === 0 || this.timer < 8 || this.timer > 0x7FF) {
            this.volume = 0;
        }
        else if (this.isConstantVolume) {
            this.volume = this.envelopeValue * DUTY_TABLE[this.duty][this.counter & 0x07];
        }
        else {
            this.volume = this.envelopeVolume * DUTY_TABLE[this.duty][this.counter & 0x07];
        }
    }
}
//# sourceMappingURL=pulse.js.map