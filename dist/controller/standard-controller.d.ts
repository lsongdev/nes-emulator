import { IStandardController, StandardControllerButton } from '../api/controller.js';
import { uint8 } from '../api/types.js';
export declare class StandardController implements IStandardController {
    private data;
    private isStrobe;
    private offset;
    updateButton(button: StandardControllerButton, isPressDown: boolean): void;
    write(data: uint8): void;
    read(): uint8;
}
