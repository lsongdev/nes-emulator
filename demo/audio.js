

const BUFFER_SIZE = 2048;
class Audio {
  constructor() {
    this.ctx = new AudioContext({
      sampleRate: 44100
    });
    this.source = this.ctx.createBufferSource();
    this.scriptNode = this.ctx.createScriptProcessor(BUFFER_SIZE, 0, 1);
    this.buffer = [];
  }
  start() {
    this.scriptNode.onaudioprocess = (e) => this.process(e);
    this.source.connect(this.scriptNode);
    this.scriptNode.connect(this.ctx.destination);
    this.source.start();
  }
  get sampleRate() {
    return this.ctx.sampleRate;
  }
  onSample(volume) {
    this.buffer.push(volume);
  }
  process(e) {
    const outputData = e.outputBuffer.getChannelData(0);
    if (this.buffer.length >= outputData.length) {
      for (let sample = 0; sample < outputData.length; sample++) {
        outputData[sample] = this.buffer.shift();
      }
    } else {
      for (let sample = 0; sample < outputData.length; sample++) {
        outputData[sample] = this.buffer[parseInt(sample * this.buffer.length / outputData.length, 10)];
      }
      this.buffer = [];
    }
  }
}
export {
  Audio
};
