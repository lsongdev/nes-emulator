export class DMA {
    copy(cpuBusAddr) {
        const data = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            data[i] = this.cpu.bus.readByte(cpuBusAddr + i);
        }
        this.ppu.dmaCopy(data);
        // The CPU is suspended during the transfer, which will take 513 or 514 cycles after the $4014 write tick.
        // (1 dummy read cycle while waiting for writes to complete, +1 if on an odd CPU cycle, then 256 alternating read/write cycles.)
        this.cpu.suspendCycles = this.cpu.cycles & 0x01 ? 513 : 514;
    }
}
//# sourceMappingURL=dma.js.map