export var Instruction;
(function (Instruction) {
    Instruction[Instruction["ADC"] = 0] = "ADC";
    Instruction[Instruction["AND"] = 1] = "AND";
    Instruction[Instruction["ASL"] = 2] = "ASL";
    Instruction[Instruction["BCC"] = 3] = "BCC";
    Instruction[Instruction["BCS"] = 4] = "BCS";
    Instruction[Instruction["BEQ"] = 5] = "BEQ";
    Instruction[Instruction["BIT"] = 6] = "BIT";
    Instruction[Instruction["BMI"] = 7] = "BMI";
    Instruction[Instruction["BNE"] = 8] = "BNE";
    Instruction[Instruction["BPL"] = 9] = "BPL";
    Instruction[Instruction["BRK"] = 10] = "BRK";
    Instruction[Instruction["BVC"] = 11] = "BVC";
    Instruction[Instruction["BVS"] = 12] = "BVS";
    Instruction[Instruction["CLC"] = 13] = "CLC";
    Instruction[Instruction["CLD"] = 14] = "CLD";
    Instruction[Instruction["CLI"] = 15] = "CLI";
    Instruction[Instruction["CLV"] = 16] = "CLV";
    Instruction[Instruction["CMP"] = 17] = "CMP";
    Instruction[Instruction["CPX"] = 18] = "CPX";
    Instruction[Instruction["CPY"] = 19] = "CPY";
    Instruction[Instruction["DEC"] = 20] = "DEC";
    Instruction[Instruction["DEX"] = 21] = "DEX";
    Instruction[Instruction["DEY"] = 22] = "DEY";
    Instruction[Instruction["EOR"] = 23] = "EOR";
    Instruction[Instruction["INC"] = 24] = "INC";
    Instruction[Instruction["INX"] = 25] = "INX";
    Instruction[Instruction["INY"] = 26] = "INY";
    Instruction[Instruction["JMP"] = 27] = "JMP";
    Instruction[Instruction["JSR"] = 28] = "JSR";
    Instruction[Instruction["LDA"] = 29] = "LDA";
    Instruction[Instruction["LDX"] = 30] = "LDX";
    Instruction[Instruction["LDY"] = 31] = "LDY";
    Instruction[Instruction["LSR"] = 32] = "LSR";
    Instruction[Instruction["NOP"] = 33] = "NOP";
    Instruction[Instruction["ORA"] = 34] = "ORA";
    Instruction[Instruction["PHA"] = 35] = "PHA";
    Instruction[Instruction["PHP"] = 36] = "PHP";
    Instruction[Instruction["PLA"] = 37] = "PLA";
    Instruction[Instruction["PLP"] = 38] = "PLP";
    Instruction[Instruction["ROL"] = 39] = "ROL";
    Instruction[Instruction["ROR"] = 40] = "ROR";
    Instruction[Instruction["RTI"] = 41] = "RTI";
    Instruction[Instruction["RTS"] = 42] = "RTS";
    Instruction[Instruction["SBC"] = 43] = "SBC";
    Instruction[Instruction["SEC"] = 44] = "SEC";
    Instruction[Instruction["SED"] = 45] = "SED";
    Instruction[Instruction["SEI"] = 46] = "SEI";
    Instruction[Instruction["STA"] = 47] = "STA";
    Instruction[Instruction["STX"] = 48] = "STX";
    Instruction[Instruction["STY"] = 49] = "STY";
    Instruction[Instruction["TAX"] = 50] = "TAX";
    Instruction[Instruction["TAY"] = 51] = "TAY";
    Instruction[Instruction["TSX"] = 52] = "TSX";
    Instruction[Instruction["TXA"] = 53] = "TXA";
    Instruction[Instruction["TXS"] = 54] = "TXS";
    Instruction[Instruction["TYA"] = 55] = "TYA";
    // Illegal opcode
    Instruction[Instruction["DCP"] = 56] = "DCP";
    Instruction[Instruction["ISC"] = 57] = "ISC";
    Instruction[Instruction["LAX"] = 58] = "LAX";
    Instruction[Instruction["RLA"] = 59] = "RLA";
    Instruction[Instruction["RRA"] = 60] = "RRA";
    Instruction[Instruction["SAX"] = 61] = "SAX";
    Instruction[Instruction["SLO"] = 62] = "SLO";
    Instruction[Instruction["SRE"] = 63] = "SRE";
    Instruction[Instruction["INVALID"] = 64] = "INVALID";
})(Instruction || (Instruction = {}));
// Refer to http://obelisk.me.uk/6502/addressing.html#IMP
export var AddressingMode;
(function (AddressingMode) {
    AddressingMode[AddressingMode["IMPLICIT"] = 0] = "IMPLICIT";
    AddressingMode[AddressingMode["ACCUMULATOR"] = 1] = "ACCUMULATOR";
    AddressingMode[AddressingMode["IMMEDIATE"] = 2] = "IMMEDIATE";
    AddressingMode[AddressingMode["ZERO_PAGE"] = 3] = "ZERO_PAGE";
    AddressingMode[AddressingMode["ZERO_PAGE_X"] = 4] = "ZERO_PAGE_X";
    AddressingMode[AddressingMode["ZERO_PAGE_Y"] = 5] = "ZERO_PAGE_Y";
    AddressingMode[AddressingMode["RELATIVE"] = 6] = "RELATIVE";
    AddressingMode[AddressingMode["ABSOLUTE"] = 7] = "ABSOLUTE";
    AddressingMode[AddressingMode["ABSOLUTE_X"] = 8] = "ABSOLUTE_X";
    AddressingMode[AddressingMode["ABSOLUTE_Y"] = 9] = "ABSOLUTE_Y";
    AddressingMode[AddressingMode["INDIRECT"] = 10] = "INDIRECT";
    AddressingMode[AddressingMode["X_INDEXED_INDIRECT"] = 11] = "X_INDEXED_INDIRECT";
    AddressingMode[AddressingMode["INDIRECT_Y_INDEXED"] = 12] = "INDIRECT_Y_INDEXED";
})(AddressingMode || (AddressingMode = {}));
const OPCODE_TABLE = [
    // http://nesdev.com/the%20%27B%27%20flag%20&%20BRK%20instruction.txt Says:
    //   Regardless of what ANY 6502 documentation says, BRK is a 2 byte opcode. The
    //   first is #$00, and the second is a padding byte. This explains why interrupt
    //   routines called by BRK always return 2 bytes after the actual BRK opcode,
    //   and not just 1.
    // So we use ZERO_PAGE instead of IMPLICIT addressing mode
    E(Instruction.BRK, AddressingMode.ZERO_PAGE, 2, 7, 0),
    E(Instruction.ORA, AddressingMode.X_INDEXED_INDIRECT, 2, 6, 0),
    undefined,
    E(Instruction.SLO, AddressingMode.X_INDEXED_INDIRECT, 2, 8, 0),
    E(Instruction.NOP, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.ORA, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.ASL, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.SLO, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.PHP, AddressingMode.IMPLICIT, 1, 3, 0),
    E(Instruction.ORA, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.ASL, AddressingMode.ACCUMULATOR, 1, 2, 0),
    undefined,
    E(Instruction.NOP, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.ORA, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.ASL, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.SLO, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.BPL, AddressingMode.RELATIVE, 2, 2, 1),
    E(Instruction.ORA, AddressingMode.INDIRECT_Y_INDEXED, 2, 5, 1),
    undefined,
    E(Instruction.SLO, AddressingMode.INDIRECT_Y_INDEXED, 2, 8, 0),
    E(Instruction.NOP, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.ORA, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.ASL, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.SLO, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.CLC, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.ORA, AddressingMode.ABSOLUTE_Y, 3, 4, 1),
    E(Instruction.NOP, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.SLO, AddressingMode.ABSOLUTE_Y, 3, 7, 0),
    E(Instruction.NOP, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.ORA, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.ASL, AddressingMode.ABSOLUTE_X, 3, 7, 0),
    E(Instruction.SLO, AddressingMode.ABSOLUTE_X, 3, 7, 0),
    E(Instruction.JSR, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.AND, AddressingMode.X_INDEXED_INDIRECT, 2, 6, 0),
    undefined,
    E(Instruction.RLA, AddressingMode.X_INDEXED_INDIRECT, 2, 8, 0),
    E(Instruction.BIT, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.AND, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.ROL, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.RLA, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.PLP, AddressingMode.IMPLICIT, 1, 4, 0),
    E(Instruction.AND, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.ROL, AddressingMode.ACCUMULATOR, 1, 2, 0),
    undefined,
    E(Instruction.BIT, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.AND, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.ROL, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.RLA, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.BMI, AddressingMode.RELATIVE, 2, 2, 1),
    E(Instruction.AND, AddressingMode.INDIRECT_Y_INDEXED, 2, 5, 1),
    undefined,
    E(Instruction.RLA, AddressingMode.INDIRECT_Y_INDEXED, 2, 8, 0),
    E(Instruction.NOP, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.AND, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.ROL, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.RLA, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.SEC, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.AND, AddressingMode.ABSOLUTE_Y, 3, 4, 1),
    E(Instruction.NOP, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.RLA, AddressingMode.ABSOLUTE_Y, 3, 7, 0),
    E(Instruction.NOP, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.AND, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.ROL, AddressingMode.ABSOLUTE_X, 3, 7, 0),
    E(Instruction.RLA, AddressingMode.ABSOLUTE_X, 3, 7, 0),
    E(Instruction.RTI, AddressingMode.IMPLICIT, 1, 6, 0),
    E(Instruction.EOR, AddressingMode.X_INDEXED_INDIRECT, 2, 6, 0),
    undefined,
    E(Instruction.SRE, AddressingMode.X_INDEXED_INDIRECT, 2, 8, 0),
    E(Instruction.NOP, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.EOR, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.LSR, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.SRE, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.PHA, AddressingMode.IMPLICIT, 1, 3, 0),
    E(Instruction.EOR, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.LSR, AddressingMode.ACCUMULATOR, 1, 2, 0),
    undefined,
    E(Instruction.JMP, AddressingMode.ABSOLUTE, 3, 3, 0),
    E(Instruction.EOR, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.LSR, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.SRE, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.BVC, AddressingMode.RELATIVE, 2, 2, 1),
    E(Instruction.EOR, AddressingMode.INDIRECT_Y_INDEXED, 2, 5, 1),
    undefined,
    E(Instruction.SRE, AddressingMode.INDIRECT_Y_INDEXED, 2, 8, 0),
    E(Instruction.NOP, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.EOR, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.LSR, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.SRE, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.CLI, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.EOR, AddressingMode.ABSOLUTE_Y, 3, 4, 1),
    E(Instruction.NOP, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.SRE, AddressingMode.ABSOLUTE_Y, 3, 7, 0),
    E(Instruction.NOP, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.EOR, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.LSR, AddressingMode.ABSOLUTE_X, 3, 7, 0),
    E(Instruction.SRE, AddressingMode.ABSOLUTE_X, 3, 7, 0),
    E(Instruction.RTS, AddressingMode.IMPLICIT, 1, 6, 0),
    E(Instruction.ADC, AddressingMode.X_INDEXED_INDIRECT, 2, 6, 0),
    undefined,
    E(Instruction.RRA, AddressingMode.X_INDEXED_INDIRECT, 2, 8, 0),
    E(Instruction.NOP, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.ADC, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.ROR, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.RRA, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.PLA, AddressingMode.IMPLICIT, 1, 4, 0),
    E(Instruction.ADC, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.ROR, AddressingMode.ACCUMULATOR, 1, 2, 0),
    undefined,
    E(Instruction.JMP, AddressingMode.INDIRECT, 3, 5, 0),
    E(Instruction.ADC, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.ROR, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.RRA, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.BVS, AddressingMode.RELATIVE, 2, 2, 1),
    E(Instruction.ADC, AddressingMode.INDIRECT_Y_INDEXED, 2, 5, 1),
    undefined,
    E(Instruction.RRA, AddressingMode.INDIRECT_Y_INDEXED, 2, 8, 0),
    E(Instruction.NOP, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.ADC, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.ROR, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.RRA, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.SEI, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.ADC, AddressingMode.ABSOLUTE_Y, 3, 4, 1),
    E(Instruction.NOP, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.RRA, AddressingMode.ABSOLUTE_Y, 3, 7, 0),
    E(Instruction.NOP, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.ADC, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.ROR, AddressingMode.ABSOLUTE_X, 3, 7, 0),
    E(Instruction.RRA, AddressingMode.ABSOLUTE_X, 3, 7, 0),
    E(Instruction.NOP, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.STA, AddressingMode.X_INDEXED_INDIRECT, 2, 6, 0),
    E(Instruction.NOP, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.SAX, AddressingMode.X_INDEXED_INDIRECT, 2, 6, 0),
    E(Instruction.STY, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.STA, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.STX, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.SAX, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.DEY, AddressingMode.IMPLICIT, 1, 2, 0),
    undefined,
    E(Instruction.TXA, AddressingMode.IMPLICIT, 1, 2, 0),
    undefined,
    E(Instruction.STY, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.STA, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.STX, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.SAX, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.BCC, AddressingMode.RELATIVE, 2, 2, 1),
    E(Instruction.STA, AddressingMode.INDIRECT_Y_INDEXED, 2, 6, 0),
    undefined,
    undefined,
    E(Instruction.STY, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.STA, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.STX, AddressingMode.ZERO_PAGE_Y, 2, 4, 0),
    E(Instruction.SAX, AddressingMode.ZERO_PAGE_Y, 2, 4, 0),
    E(Instruction.TYA, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.STA, AddressingMode.ABSOLUTE_Y, 3, 5, 0),
    E(Instruction.TXS, AddressingMode.IMPLICIT, 1, 2, 0),
    undefined,
    undefined,
    E(Instruction.STA, AddressingMode.ABSOLUTE_X, 3, 5, 0),
    undefined,
    undefined,
    E(Instruction.LDY, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.LDA, AddressingMode.X_INDEXED_INDIRECT, 2, 6, 0),
    E(Instruction.LDX, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.LAX, AddressingMode.X_INDEXED_INDIRECT, 2, 6, 0),
    E(Instruction.LDY, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.LDA, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.LDX, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.LAX, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.TAY, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.LDA, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.TAX, AddressingMode.IMPLICIT, 1, 2, 0),
    undefined,
    E(Instruction.LDY, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.LDA, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.LDX, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.LAX, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.BCS, AddressingMode.RELATIVE, 2, 2, 1),
    E(Instruction.LDA, AddressingMode.INDIRECT_Y_INDEXED, 2, 5, 1),
    undefined,
    E(Instruction.LAX, AddressingMode.INDIRECT_Y_INDEXED, 2, 5, 1),
    E(Instruction.LDY, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.LDA, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.LDX, AddressingMode.ZERO_PAGE_Y, 2, 4, 0),
    E(Instruction.LAX, AddressingMode.ZERO_PAGE_Y, 2, 4, 0),
    E(Instruction.CLV, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.LDA, AddressingMode.ABSOLUTE_Y, 3, 4, 1),
    E(Instruction.TSX, AddressingMode.IMPLICIT, 1, 2, 0),
    undefined,
    E(Instruction.LDY, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.LDA, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.LDX, AddressingMode.ABSOLUTE_Y, 3, 4, 1),
    E(Instruction.LAX, AddressingMode.ABSOLUTE_Y, 3, 4, 1),
    E(Instruction.CPY, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.CMP, AddressingMode.X_INDEXED_INDIRECT, 2, 6, 0),
    undefined,
    E(Instruction.DCP, AddressingMode.X_INDEXED_INDIRECT, 2, 8, 0),
    E(Instruction.CPY, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.CMP, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.DEC, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.DCP, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.INY, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.CMP, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.DEX, AddressingMode.IMPLICIT, 1, 2, 0),
    undefined,
    E(Instruction.CPY, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.CMP, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.DEC, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.DCP, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.BNE, AddressingMode.RELATIVE, 2, 2, 1),
    E(Instruction.CMP, AddressingMode.INDIRECT_Y_INDEXED, 2, 5, 1),
    undefined,
    E(Instruction.DCP, AddressingMode.INDIRECT_Y_INDEXED, 2, 8, 0),
    E(Instruction.NOP, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.CMP, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.DEC, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.DCP, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.CLD, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.CMP, AddressingMode.ABSOLUTE_Y, 3, 4, 1),
    E(Instruction.NOP, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.DCP, AddressingMode.ABSOLUTE_Y, 3, 7, 0),
    E(Instruction.NOP, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.CMP, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.DEC, AddressingMode.ABSOLUTE_X, 3, 7, 0),
    E(Instruction.DCP, AddressingMode.ABSOLUTE_X, 3, 7, 0),
    E(Instruction.CPX, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.SBC, AddressingMode.X_INDEXED_INDIRECT, 2, 6, 0),
    undefined,
    E(Instruction.ISC, AddressingMode.X_INDEXED_INDIRECT, 2, 8, 0),
    E(Instruction.CPX, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.SBC, AddressingMode.ZERO_PAGE, 2, 3, 0),
    E(Instruction.INC, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.ISC, AddressingMode.ZERO_PAGE, 2, 5, 0),
    E(Instruction.INX, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.SBC, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.NOP, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.SBC, AddressingMode.IMMEDIATE, 2, 2, 0),
    E(Instruction.CPX, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.SBC, AddressingMode.ABSOLUTE, 3, 4, 0),
    E(Instruction.INC, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.ISC, AddressingMode.ABSOLUTE, 3, 6, 0),
    E(Instruction.BEQ, AddressingMode.RELATIVE, 2, 2, 1),
    E(Instruction.SBC, AddressingMode.INDIRECT_Y_INDEXED, 2, 5, 1),
    undefined,
    E(Instruction.ISC, AddressingMode.INDIRECT_Y_INDEXED, 2, 8, 0),
    E(Instruction.NOP, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.SBC, AddressingMode.ZERO_PAGE_X, 2, 4, 0),
    E(Instruction.INC, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.ISC, AddressingMode.ZERO_PAGE_X, 2, 6, 0),
    E(Instruction.SED, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.SBC, AddressingMode.ABSOLUTE_Y, 3, 4, 1),
    E(Instruction.NOP, AddressingMode.IMPLICIT, 1, 2, 0),
    E(Instruction.ISC, AddressingMode.ABSOLUTE_Y, 3, 7, 0),
    E(Instruction.NOP, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.SBC, AddressingMode.ABSOLUTE_X, 3, 4, 1),
    E(Instruction.INC, AddressingMode.ABSOLUTE_X, 3, 7, 0),
    E(Instruction.ISC, AddressingMode.ABSOLUTE_X, 3, 7, 0), // 255, FFh
];
export default OPCODE_TABLE;
function E(instruction, addressingMode, bytes, cycles, pageCycles) {
    return {
        instruction,
        addressingMode,
        bytes,
        cycles,
        pageCycles,
    };
}
//# sourceMappingURL=opcode-table.js.map