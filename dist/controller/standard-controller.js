import { StandardControllerButton } from '../api/controller.js';
// Standard controller: http://wiki.nesdev.com/w/index.php/Standard_controller
export class StandardController {
    constructor() {
        this.isStrobe = false;
        this.offset = 0;
    }
    updateButton(button, isPressDown) {
        if (isPressDown) {
            this.data |= button;
        }
        else {
            this.data &= ~button & 0xFF;
        }
    }
    write(data) {
        if (data & 0x01) {
            this.isStrobe = true;
        }
        else {
            this.offset = 0;
            this.isStrobe = false;
        }
    }
    read() {
        const data = this.isStrobe ? this.data & StandardControllerButton.A : this.data & (0x80 >> this.offset++);
        return data ? 1 : 0;
    }
}
//# sourceMappingURL=standard-controller.js.map