import { IMapper } from 'src/api/mapper.js';
import { ICartridge, IROMInfo } from '../api/cartridge.js';
export declare class Cartridge implements ICartridge {
    readonly mapper: IMapper;
    readonly info: IROMInfo;
    constructor(data: Uint8Array, sram: Uint8Array);
    private parseROMInfo;
    private static checkConstant;
}
