export class AudioEngine {

  constructor(sampleRate, clipDuration) {
    this.sampleRate = sampleRate // samples per second
    this.downloadButton = document.getElementById('download')
    this.clipDuration = clipDuration // in ms
    this.numSamples = this.sampleRate * (this.clipDuration / 1000)
    this.easeInDuration = 100 // in ms
    this.signal = null
  }

  resample(edges) {
    if (edges.length == 0) return 
    this.signal = this.readPlayhead(edges)
  }

  readPlayhead(edges) {
    const samples = []
    console.log("reading discs...")
    for (let i = 0; i < this.numSamples; i++) {
      const time = i / this.sampleRate * 1000
      let sample = 0
      // sum lengths for now
      for (const edge of edges) sample += edge.length(time)
      samples.push(sample)
    }

    //  find min max
    let min = Infinity
    let max = -Infinity
    for (const sample of samples) {
      if (sample < min) min = sample
      if (sample > max) max = sample
    }
    // normalize
    const range = max - min
    for (const i in samples) {
      samples[i] = (samples[i] - min) / range
      samples[i] = samples[i] * 2 - 1
      if (i % 1000 == 0) console.log(samples[i])
    }
    return samples
  }

  download() {
    if (!this.signal) return
    const csv = this.signal.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    document.body.appendChild(a)
    a.download = 'signal.csv'
    a.click()
    a.remove()
  }

  play() {
    if (!this.signal) return
    // Create a new AudioContext
    const ctx = new window.AudioContext()

    // sample edges to audio buffer
    const audioBuffer = this.toBuffer(ctx, this.signal)
    const source = ctx.createBufferSource()
    source.buffer = audioBuffer

    const gainNode = ctx.createGain()

    // ramp up/down
    const gain = gainNode.gain;
    const startTime = ctx.currentTime
    gain.value = 0
    gain.setValueAtTime(0, startTime) 
    gain.linearRampToValueAtTime(1, startTime + this.easeInDuration / 1000)
    const endTime = ctx.currentTime + audioBuffer.duration
    gain.setValueAtTime(1, endTime - this.easeInDuration / 1000) 
    gain.linearRampToValueAtTime(0, endTime) 

    // connect audio nodes
    source.connect(gainNode)
    gainNode.connect(ctx.destination)
    source.start()
    source.stop(endTime)
  }

  toBuffer(ctx, signal) {
    const samples = new Float32Array(signal)
    const audioBuffer = ctx.createBuffer(1, samples.length, ctx.sampleRate)
    const bufferData = audioBuffer.getChannelData(0)
    for (let i = 0; i < samples.length; i++) { bufferData[i] = samples[i] }
    return audioBuffer
  }
}