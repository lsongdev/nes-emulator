import { Flags } from '../api/cpu.js';
import { Registers } from './registers.js';
import OPCODE_TABLE, { AddressingMode, Instruction } from './opcode-table.js';
var InterruptVector;
(function (InterruptVector) {
    InterruptVector[InterruptVector["NMI"] = 65530] = "NMI";
    InterruptVector[InterruptVector["RESET"] = 65532] = "RESET";
    InterruptVector[InterruptVector["IRQ"] = 65534] = "IRQ";
})(InterruptVector || (InterruptVector = {}));
// 6502 Instruction Reference: http://obelisk.me.uk/6502/reference.html
// 6502/6510/8500/8502 Opcode matrix: http://www.oxyron.de/html/opcodes02.html
export class CPU {
    constructor() {
        this.suspendCycles = 0;
        this.clocks = 0;
        this.deferCycles = 0;
        this.registers = new Registers();
        this.instructionMap = new Map([
            [Instruction.ADC, this.adc],
            [Instruction.AND, this.and],
            [Instruction.ASL, this.asl],
            [Instruction.BCC, this.bcc],
            [Instruction.BCS, this.bcs],
            [Instruction.BEQ, this.beq],
            [Instruction.BIT, this.bit],
            [Instruction.BMI, this.bmi],
            [Instruction.BNE, this.bne],
            [Instruction.BPL, this.bpl],
            [Instruction.BRK, this.brk],
            [Instruction.BVC, this.bvc],
            [Instruction.BVS, this.bvs],
            [Instruction.CLC, this.clc],
            [Instruction.CLD, this.cld],
            [Instruction.CLI, this.cli],
            [Instruction.CLV, this.clv],
            [Instruction.CMP, this.cmp],
            [Instruction.CPX, this.cpx],
            [Instruction.CPY, this.cpy],
            [Instruction.DEC, this.dec],
            [Instruction.DEX, this.dex],
            [Instruction.DEY, this.dey],
            [Instruction.EOR, this.eor],
            [Instruction.INC, this.inc],
            [Instruction.INX, this.inx],
            [Instruction.INY, this.iny],
            [Instruction.JMP, this.jmp],
            [Instruction.JSR, this.jsr],
            [Instruction.LDA, this.lda],
            [Instruction.LDX, this.ldx],
            [Instruction.LDY, this.ldy],
            [Instruction.LSR, this.lsr],
            [Instruction.NOP, this.nop],
            [Instruction.ORA, this.ora],
            [Instruction.PHA, this.pha],
            [Instruction.PHP, this.php],
            [Instruction.PLA, this.pla],
            [Instruction.PLP, this.plp],
            [Instruction.ROL, this.rol],
            [Instruction.ROR, this.ror],
            [Instruction.RTI, this.rti],
            [Instruction.RTS, this.rts],
            [Instruction.SBC, this.sbc],
            [Instruction.SEC, this.sec],
            [Instruction.SED, this.sed],
            [Instruction.SEI, this.sei],
            [Instruction.STA, this.sta],
            [Instruction.STX, this.stx],
            [Instruction.STY, this.sty],
            [Instruction.TAX, this.tax],
            [Instruction.TAY, this.tay],
            [Instruction.TSX, this.tsx],
            [Instruction.TXA, this.txa],
            [Instruction.TXS, this.txs],
            [Instruction.TYA, this.tya],
            // Illegal instruction
            [Instruction.DCP, this.dcp],
            [Instruction.ISC, this.isc],
            [Instruction.LAX, this.lax],
            [Instruction.RLA, this.rla],
            [Instruction.RRA, this.rra],
            [Instruction.SAX, this.sax],
            [Instruction.SLO, this.slo],
            [Instruction.SRE, this.sre],
        ]);
        this.addressingModeMap = new Map([
            [AddressingMode.ABSOLUTE, this.absolute],
            [AddressingMode.ABSOLUTE_X, this.absoluteX],
            [AddressingMode.ABSOLUTE_Y, this.absoluteY],
            [AddressingMode.ACCUMULATOR, this.accumulator],
            [AddressingMode.IMMEDIATE, this.immediate],
            [AddressingMode.IMPLICIT, this.implicit],
            [AddressingMode.INDIRECT, this.indirect],
            [AddressingMode.INDIRECT_Y_INDEXED, this.indirectYIndexed],
            [AddressingMode.RELATIVE, this.relative],
            [AddressingMode.X_INDEXED_INDIRECT, this.xIndexedIndirect],
            [AddressingMode.ZERO_PAGE, this.zeroPage],
            [AddressingMode.ZERO_PAGE_X, this.zeroPageX],
            [AddressingMode.ZERO_PAGE_Y, this.zeroPageY],
        ]);
    }
    reset() {
        this.registers.A = 0;
        this.registers.X = 0;
        this.registers.Y = 0;
        this.registers.P = 0;
        this.registers.SP = 0xfd;
        this.registers.PC = this.bus.readWord(InterruptVector.RESET);
        this.deferCycles = 8;
        this.clocks = 0;
    }
    clock() {
        if (this.suspendCycles > 0) {
            this.suspendCycles--;
            return;
        }
        if (this.deferCycles === 0) {
            this.step();
        }
        this.deferCycles--;
        this.clocks++;
    }
    irq() {
        if (this.isFlagSet(Flags.I)) {
            return;
        }
        this.pushWord(this.registers.PC);
        this.pushByte((this.registers.P | Flags.U) & ~Flags.B);
        this.setFlag(Flags.I, true);
        this.registers.PC = this.bus.readWord(InterruptVector.IRQ);
        this.deferCycles += 7;
    }
    nmi() {
        this.pushWord(this.registers.PC);
        this.pushByte((this.registers.P | Flags.U) & ~Flags.B);
        this.setFlag(Flags.I, true);
        this.registers.PC = this.bus.readWord(InterruptVector.NMI);
        this.deferCycles += 7;
    }
    setFlag(flag, value) {
        if (value) {
            this.registers.P |= flag;
        }
        else {
            this.registers.P &= ~flag;
        }
    }
    isFlagSet(flag) {
        return !!(this.registers.P & flag);
    }
    step() {
        const opcode = this.bus.readByte(this.registers.PC++);
        const entry = OPCODE_TABLE[opcode];
        if (!entry) {
            throw new Error(`Invalid opcode '${opcode}(0x${opcode.toString(16)})', pc: 0x${(this.registers.PC - 1).toString(16)}`);
        }
        if (entry.instruction === Instruction.INVALID) {
            return;
        }
        const addrModeFunc = this.addressingModeMap.get(entry.addressingMode);
        if (!addrModeFunc) {
            throw new Error(`Unsuppored addressing mode: ${AddressingMode[entry.addressingMode]}`);
        }
        const ret = addrModeFunc.call(this);
        if (ret.isCrossPage) {
            this.deferCycles += entry.pageCycles;
        }
        const instrFunc = this.instructionMap.get(entry.instruction);
        if (!instrFunc) {
            throw new Error(`Unsupported instruction: ${Instruction[entry.instruction]}`);
        }
        instrFunc.call(this, ret, entry.addressingMode);
        this.deferCycles += entry.cycles;
    }
    pushWord(data) {
        this.pushByte(data >> 8);
        this.pushByte(data);
    }
    pushByte(data) {
        this.bus.writeByte(0x100 + this.registers.SP, data);
        this.registers.SP = (this.registers.SP - 1) & 0xFF;
    }
    popWord() {
        return this.popByte() | this.popByte() << 8;
    }
    popByte() {
        this.registers.SP = (this.registers.SP + 1) & 0xFF;
        return this.bus.readByte(0x100 + this.registers.SP);
    }
    setNZFlag(data) {
        this.setFlag(Flags.Z, (data & 0xFF) === 0);
        this.setFlag(Flags.N, !!(data & 0x80));
    }
    getData(addrData) {
        if (!isNaN(addrData.data)) {
            return addrData.data;
        }
        else {
            return this.bus.readByte(addrData.address);
        }
    }
    absolute() {
        const address = this.bus.readWord(this.registers.PC);
        this.registers.PC += 2;
        return {
            address: address & 0xFFFF,
            data: NaN,
            isCrossPage: false,
        };
    }
    absoluteX() {
        const baseAddress = this.bus.readWord(this.registers.PC);
        this.registers.PC += 2;
        const address = baseAddress + this.registers.X;
        return {
            address: address & 0xFFFF,
            data: NaN,
            isCrossPage: this.isCrossPage(baseAddress, address),
        };
    }
    absoluteY() {
        const baseAddress = this.bus.readWord(this.registers.PC);
        this.registers.PC += 2;
        const address = baseAddress + this.registers.Y;
        return {
            address: address & 0xFFFF,
            data: NaN,
            isCrossPage: this.isCrossPage(baseAddress, address),
        };
    }
    accumulator() {
        return {
            address: NaN,
            data: this.registers.A,
            isCrossPage: false,
        };
    }
    immediate() {
        return {
            address: NaN,
            data: this.bus.readByte(this.registers.PC++),
            isCrossPage: false,
        };
    }
    implicit() {
        return {
            address: NaN,
            data: NaN,
            isCrossPage: false,
        };
    }
    indirect() {
        let address = this.bus.readWord(this.registers.PC);
        this.registers.PC += 2;
        if ((address & 0xFF) === 0xFF) { // Hardware bug
            address = this.bus.readByte(address & 0xFF00) << 8 | this.bus.readByte(address);
        }
        else {
            address = this.bus.readWord(address);
        }
        return {
            address: address & 0xFFFF,
            data: NaN,
            isCrossPage: false,
        };
    }
    indirectYIndexed() {
        const value = this.bus.readByte(this.registers.PC++);
        const l = this.bus.readByte(value & 0xFF);
        const h = this.bus.readByte((value + 1) & 0xFF);
        const baseAddress = h << 8 | l;
        const address = baseAddress + this.registers.Y;
        return {
            address: address & 0xFFFF,
            data: NaN,
            isCrossPage: this.isCrossPage(baseAddress, address),
        };
    }
    relative() {
        // Range is -128 ~ 127
        let offset = this.bus.readByte(this.registers.PC++);
        if (offset & 0x80) {
            offset = offset - 0x100;
        }
        return {
            address: (this.registers.PC + offset) & 0xFFFF,
            data: NaN,
            isCrossPage: false,
        };
    }
    xIndexedIndirect() {
        const value = this.bus.readByte(this.registers.PC++);
        const address = (value + this.registers.X);
        const l = this.bus.readByte(address & 0xFF);
        const h = this.bus.readByte((address + 1) & 0xFF);
        return {
            address: (h << 8 | l) & 0xFFFF,
            data: NaN,
            isCrossPage: false,
        };
    }
    zeroPage() {
        const address = this.bus.readByte(this.registers.PC++);
        return {
            address: address & 0xFFFF,
            data: NaN,
            isCrossPage: false,
        };
    }
    zeroPageX() {
        const address = (this.bus.readByte(this.registers.PC++) + this.registers.X) & 0xFF;
        return {
            address: address & 0xFFFF,
            data: NaN,
            isCrossPage: false,
        };
    }
    zeroPageY() {
        const address = (this.bus.readByte(this.registers.PC++) + this.registers.Y) & 0xFF;
        return {
            address: address & 0xFFFF,
            data: NaN,
            isCrossPage: false,
        };
    }
    adc(addrData) {
        const data = this.getData(addrData);
        const value = data + this.registers.A + (this.isFlagSet(Flags.C) ? 1 : 0);
        this.setFlag(Flags.C, value > 0xFF);
        this.setFlag(Flags.V, !!((~(this.registers.A ^ data) & (this.registers.A ^ value)) & 0x80));
        this.setNZFlag(value);
        this.registers.A = value & 0xFF;
    }
    and(addrData) {
        this.registers.A &= this.getData(addrData);
        this.setNZFlag(this.registers.A);
    }
    asl(addrData) {
        let data = this.getData(addrData) << 1;
        this.setFlag(Flags.C, !!(data & 0x100));
        data = data & 0xFF;
        this.setNZFlag(data);
        if (isNaN(addrData.address)) {
            this.registers.A = data;
        }
        else {
            this.bus.writeByte(addrData.address, data);
        }
    }
    bcc(addrData) {
        if (!this.isFlagSet(Flags.C)) {
            this.deferCycles++;
            if (this.isCrossPage(this.registers.PC, addrData.address)) {
                this.deferCycles++;
            }
            this.registers.PC = addrData.address;
        }
    }
    bcs(addrData) {
        if (this.isFlagSet(Flags.C)) {
            this.deferCycles++;
            if (this.isCrossPage(this.registers.PC, addrData.address)) {
                this.deferCycles++;
            }
            this.registers.PC = addrData.address;
        }
    }
    beq(addrData) {
        if (this.isFlagSet(Flags.Z)) {
            this.deferCycles++;
            if (this.isCrossPage(this.registers.PC, addrData.address)) {
                this.deferCycles++;
            }
            this.registers.PC = addrData.address;
        }
    }
    bit(addrData) {
        const data = this.getData(addrData);
        this.setFlag(Flags.Z, !(this.registers.A & data));
        this.setFlag(Flags.N, !!(data & (1 << 7)));
        this.setFlag(Flags.V, !!(data & (1 << 6)));
    }
    bmi(addrData) {
        if (this.isFlagSet(Flags.N)) {
            this.deferCycles++;
            if (this.isCrossPage(this.registers.PC, addrData.address)) {
                this.deferCycles++;
            }
            this.registers.PC = addrData.address;
        }
    }
    bne(addrData) {
        if (!this.isFlagSet(Flags.Z)) {
            this.deferCycles++;
            if (this.isCrossPage(this.registers.PC, addrData.address)) {
                this.deferCycles++;
            }
            this.registers.PC = addrData.address;
        }
    }
    bpl(addrData) {
        if (!this.isFlagSet(Flags.N)) {
            this.deferCycles++;
            if (this.isCrossPage(this.registers.PC, addrData.address)) {
                this.deferCycles++;
            }
            this.registers.PC = addrData.address;
        }
    }
    brk(addrData) {
        this.pushWord(this.registers.PC);
        this.pushByte(this.registers.P | Flags.B | Flags.U);
        this.setFlag(Flags.I, true);
        this.registers.PC = this.bus.readWord(InterruptVector.IRQ);
    }
    bvc(addrData) {
        if (!this.isFlagSet(Flags.V)) {
            this.deferCycles++;
            if (this.isCrossPage(this.registers.PC, addrData.address)) {
                this.deferCycles++;
            }
            this.registers.PC = addrData.address;
        }
    }
    bvs(addrData) {
        if (this.isFlagSet(Flags.V)) {
            this.deferCycles++;
            if (this.isCrossPage(this.registers.PC, addrData.address)) {
                this.deferCycles++;
            }
            this.registers.PC = addrData.address;
        }
    }
    clc(addrData) {
        this.setFlag(Flags.C, false);
    }
    cld(addrData) {
        this.setFlag(Flags.D, false);
    }
    cli(addrData) {
        this.setFlag(Flags.I, false);
    }
    clv(addrData) {
        this.setFlag(Flags.V, false);
    }
    cmp(addrData) {
        const data = this.getData(addrData);
        const res = this.registers.A - data;
        this.setFlag(Flags.C, this.registers.A >= data);
        this.setNZFlag(res);
    }
    cpx(addrData) {
        const data = this.getData(addrData);
        const res = this.registers.X - data;
        this.setFlag(Flags.C, this.registers.X >= data);
        this.setNZFlag(res);
    }
    cpy(addrData) {
        const data = this.getData(addrData);
        const res = this.registers.Y - data;
        this.setFlag(Flags.C, this.registers.Y >= data);
        this.setNZFlag(res);
    }
    dec(addrData) {
        const data = (this.getData(addrData) - 1) & 0xFF;
        this.bus.writeByte(addrData.address, data);
        this.setNZFlag(data);
    }
    dex(addrData) {
        this.registers.X = (this.registers.X - 1) & 0xFF;
        this.setNZFlag(this.registers.X);
    }
    dey(addrData) {
        this.registers.Y = (this.registers.Y - 1) & 0xFF;
        this.setNZFlag(this.registers.Y);
    }
    eor(addrData) {
        this.registers.A ^= this.getData(addrData);
        this.setNZFlag(this.registers.A);
    }
    inc(addrData) {
        const data = (this.getData(addrData) + 1) & 0xFF;
        this.bus.writeByte(addrData.address, data);
        this.setNZFlag(data);
    }
    inx(addrData) {
        this.registers.X = (this.registers.X + 1) & 0xFF;
        this.setNZFlag(this.registers.X);
    }
    iny(addrData) {
        this.registers.Y = (this.registers.Y + 1) & 0xFF;
        this.setNZFlag(this.registers.Y);
    }
    jmp(addrData) {
        this.registers.PC = addrData.address;
    }
    jsr(addrData) {
        this.pushWord(this.registers.PC - 1);
        this.registers.PC = addrData.address;
    }
    lda(addrData) {
        this.registers.A = this.getData(addrData);
        this.setNZFlag(this.registers.A);
    }
    ldx(addrData) {
        this.registers.X = this.getData(addrData);
        this.setNZFlag(this.registers.X);
    }
    ldy(addrData) {
        this.registers.Y = this.getData(addrData);
        this.setNZFlag(this.registers.Y);
    }
    lsr(addrData) {
        let data = this.getData(addrData);
        this.setFlag(Flags.C, !!(data & 0x01));
        data >>= 1;
        this.setNZFlag(data);
        if (isNaN(addrData.address)) {
            this.registers.A = data;
        }
        else {
            this.bus.writeByte(addrData.address, data);
        }
    }
    nop(addrData) {
        // Do nothing
    }
    ora(addrData) {
        this.registers.A |= this.getData(addrData);
        this.setNZFlag(this.registers.A);
    }
    pha(addrData) {
        this.pushByte(this.registers.A);
    }
    php(addrData) {
        this.pushByte(this.registers.P | Flags.B | Flags.U);
    }
    pla(addrData) {
        this.registers.A = this.popByte();
        this.setNZFlag(this.registers.A);
    }
    plp(addrData) {
        this.registers.P = this.popByte();
        this.setFlag(Flags.B, false);
        this.setFlag(Flags.U, true);
    }
    rol(addrData) {
        let data = this.getData(addrData);
        const isCarry = this.isFlagSet(Flags.C);
        this.setFlag(Flags.C, !!(data & 0x80));
        data = (data << 1 | (isCarry ? 1 : 0)) & 0xFF;
        this.setNZFlag(data);
        if (isNaN(addrData.address)) {
            this.registers.A = data;
        }
        else {
            this.bus.writeByte(addrData.address, data);
        }
    }
    ror(addrData) {
        let data = this.getData(addrData);
        const isCarry = this.isFlagSet(Flags.C);
        this.setFlag(Flags.C, !!(data & 1));
        data = data >> 1 | (isCarry ? 1 << 7 : 0);
        this.setNZFlag(data);
        if (isNaN(addrData.address)) {
            this.registers.A = data;
        }
        else {
            this.bus.writeByte(addrData.address, data);
        }
    }
    rti(addrData) {
        this.registers.P = this.popByte();
        this.setFlag(Flags.B, false);
        this.setFlag(Flags.U, true);
        this.registers.PC = this.popWord();
    }
    rts(addrData) {
        this.registers.PC = this.popWord() + 1;
    }
    sbc(addrData) {
        const data = this.getData(addrData);
        const res = this.registers.A - data - (this.isFlagSet(Flags.C) ? 0 : 1);
        this.setNZFlag(res);
        this.setFlag(Flags.C, res >= 0);
        this.setFlag(Flags.V, !!((res ^ this.registers.A) & (res ^ data ^ 0xFF) & 0x0080));
        this.registers.A = res & 0xFF;
    }
    sec(addrData) {
        this.setFlag(Flags.C, true);
    }
    sed(addrData) {
        this.setFlag(Flags.D, true);
    }
    sei(addrData) {
        this.setFlag(Flags.I, true);
    }
    sta(addrData) {
        this.bus.writeByte(addrData.address, this.registers.A);
    }
    stx(addrData) {
        this.bus.writeByte(addrData.address, this.registers.X);
    }
    sty(addrData) {
        this.bus.writeByte(addrData.address, this.registers.Y);
    }
    tax(addrData) {
        this.registers.X = this.registers.A;
        this.setNZFlag(this.registers.X);
    }
    tay(addrData) {
        this.registers.Y = this.registers.A;
        this.setNZFlag(this.registers.Y);
    }
    tsx(addrData) {
        this.registers.X = this.registers.SP;
        this.setNZFlag(this.registers.X);
    }
    txa(addrData) {
        this.registers.A = this.registers.X;
        this.setNZFlag(this.registers.A);
    }
    txs(addrData) {
        this.registers.SP = this.registers.X;
    }
    tya(addrData) {
        this.registers.A = this.registers.Y;
        this.setNZFlag(this.registers.A);
    }
    // Illegal instruction
    dcp(addrData) {
        this.dec(addrData);
        this.cmp(addrData);
    }
    isc(addrData) {
        this.inc(addrData);
        this.sbc(addrData);
    }
    lax(addrData) {
        this.lda(addrData);
        this.ldx(addrData);
    }
    rla(addrData) {
        this.rol(addrData);
        this.and(addrData);
    }
    rra(addrData) {
        this.ror(addrData);
        this.adc(addrData);
    }
    sax(addrData) {
        const value = this.registers.A & this.registers.X;
        this.bus.writeByte(addrData.address, value);
    }
    slo(addrData) {
        this.asl(addrData);
        this.ora(addrData);
    }
    sre(addrData) {
        this.lsr(addrData);
        this.eor(addrData);
    }
    isCrossPage(addr1, addr2) {
        return (addr1 & 0xff00) !== (addr2 & 0xff00);
    }
}
//# sourceMappingURL=cpu.js.map