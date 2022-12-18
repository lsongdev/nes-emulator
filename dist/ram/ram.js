export class RAM {
    constructor(size, offset = 0) {
        this.offset = offset;
        this.ram = new Uint8Array(size);
    }
    read(address) {
        address = (address - this.offset) & 0xFFFF;
        return this.ram[address];
    }
    write(address, data) {
        address = (address - this.offset) & 0xFFFF;
        this.ram[address] = data;
    }
}
//# sourceMappingURL=ram.js.map