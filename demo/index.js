import { Emulator } from "../dist/index.js";
import { StandardControllerButton } from "../dist/api/controller.js";

import { Screen } from "./screen.js";
import { DisASM } from "./disasm.js";
import { Palette } from "./palette.js";
import { ParttenTable } from "./partten-table.js";
import { PPURegister } from "./ppu-register.js";
import { NameTable } from "./name-table.js";
import { Status } from "./status.js";
import { CpuRegister } from "./cpu-register.js";
import { Audio } from "./audio.js";
import { GameSelector } from "./game-selector.js";
const list = document.getElementById("game-list");
const selector = new GameSelector(list);
selector.onChange = (filename, data) => {
  input.disabled = true;
  startGame(filename, data);
};
const input = document.getElementById("file-input");
input.addEventListener("change", () => {
  input.disabled = true;
  const reader = new FileReader();
  const file = input.files[0];
  let buffer = new Uint8Array(0);
  reader.readAsArrayBuffer(file);
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const tmp = new Uint8Array(buffer.length + data.length);
    tmp.set(buffer);
    tmp.set(data, buffer.length);
    buffer = tmp;
  };
  reader.onloadend = () => {
    try {
      list.disabled = true;
      startGame(file.name, buffer);
    } catch (e) {
      console.log(e);
      alert(e.message);
    }
  };
});
function startGame(filename, nesData) {
  const audio = new Audio();
  const screen = new Screen(document.getElementById("screen"));
  const emulator = new Emulator(nesData, {
    sampleRate: audio.sampleRate,
    onSample: (volume) => audio.onSample(volume),
    onFrame: (frame) => screen.onFrame(frame),
    sramLoad: (() => {
      if (localStorage.getItem(filename)) {
        return Uint8Array.from(JSON.parse(localStorage.getItem(filename)));
      }
    })()
  });
  audio.emulator = emulator;
  screen.emulator = emulator;
  const status = new Status(emulator, document.getElementById("status"));
  const cpuRegister = new CpuRegister(emulator, document.getElementById("register"));
  const ppuRegister = new PPURegister(emulator, document.getElementById("ppu-register"));
  const disASM = new DisASM(emulator, document.getElementById("disasm"));
  const backgroundPalette = new Palette(emulator, document.getElementById("background-palette"), 16128);
  const spritePalette = new Palette(emulator, document.getElementById("sprite-palette"), 16144);
  const parttenTable1 = new ParttenTable(emulator, document.getElementById("partten-table1"), 0);
  const parttenTable2 = new ParttenTable(emulator, document.getElementById("partten-table2"), 4096);
  const nameTable = new NameTable(emulator, document.getElementById("name-table"));
  status.start();
  audio.start();
  const debug = document.getElementById("debug-ctrl");
  debug.addEventListener("change", (e) => {
    const elements = document.getElementsByClassName("debug");
    if (debug.checked) {
      cpuRegister.start();
      ppuRegister.start();
      disASM.start();
      backgroundPalette.start();
      spritePalette.start();
      parttenTable1.start();
      parttenTable2.start();
      nameTable.start();
    } else {
      cpuRegister.stop();
      ppuRegister.stop();
      disASM.stop();
      backgroundPalette.stop();
      spritePalette.stop();
      parttenTable1.stop();
      parttenTable2.stop();
      nameTable.stop();
    }
    for (let i = 0; i < elements.length; i++) {
      const element = elements.item(i);
      element.style.display = debug.checked ? "block" : "none";
    }
  });
  const trim = document.getElementById("trim-border");
  trim.addEventListener("change", (e) => {
    screen.isTrimBorder = trim.checked;
  });
  document.addEventListener("keydown", keyboardHandle);
  document.addEventListener("keyup", keyboardHandle);
  function keyboardHandle(e) {
    let button;
    switch (e.code) {
      case "KeyW":
        button = StandardControllerButton.UP;
        break;
      case "KeyS":
        button = StandardControllerButton.DOWN;
        break;
      case "KeyA":
        button = StandardControllerButton.LEFT;
        break;
      case "KeyD":
        button = StandardControllerButton.RIGHT;
        break;
      case "Enter":
        button = StandardControllerButton.START;
        break;
      case "ShiftRight":
        button = StandardControllerButton.SELECT;
        break;
      case "KeyL":
        button = StandardControllerButton.A;
        break;
      case "KeyK":
        button = StandardControllerButton.B;
        break;
    }
    emulator.standardController1.updateButton(button, e.type === "keydown");
    emulator.standardController2.updateButton(button, e.type === "keydown");
    e.preventDefault();
  }
  setInterval(() => {
    localStorage.setItem(filename, JSON.stringify(Array.from(emulator.sram)));
  }, 3e3);
  window.requestAnimationFrame(function frame() {
    emulator.frame();
    window.requestAnimationFrame(frame);
  });
}
