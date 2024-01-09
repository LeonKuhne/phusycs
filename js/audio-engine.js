export class AudioEngine {
  static MAX_SAMPLE_SIZE = 1000

  constructor(sampleRate) {
    // Create a new AudioContext
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    this.plot = []
    this.sampleRate = sampleRate
    this.playhead = document.getElementById('playhead')
    this.trackLength = 200 // in ticks
    this.trackStep = 1 / this.trackLength
    this.progress = 0 // 0-1
  }

  tick() {
    this.progress += this.trackStep
    if (this.progress >= 1) this.progress = 0
    this.draw()
  }

  draw() {
    // updated playhead
    this.playhead.style.left = `${this.progress * 100}%`
  }

  sample(edges, time) {
    //console.log('sampling', edges)
    // for all edges, sample the distance between the two particles
    const samples = edges.map(edge => edge.sample(time, this.sampleRate))
    // average the samples
    const averaged = samples.map((_, i) => samples.reduce((acc, sample) => acc + sample[i], 0) / samples.length)
    // normalize the samples
    const normalized = averaged.map(sample => sample / AudioEngine.MAX_SAMPLE_SIZE)
    // add to plot
    this.plot = this.plot.concat(normalized)
    // play if plot is full
    if (this.plot.length >= this.sampleRate) {
      this.play()
    }
  }

  play() {
    console.log('playing', this.plot)
    const samples = new Float32Array(this.plot)
    // Create a new buffer source
    var bufferSource = this.ctx.createBufferSource()
    // Create an audio buffer of 1 channel, length of samples, and at the sample rate of the audio context
    var audioBuffer = this.ctx.createBuffer(1, samples.length, this.ctx.sampleRate)
    // Fill the audio buffer with the samples
    var bufferData = audioBuffer.getChannelData(0)
    for (var i = 0; i < samples.length; i++) {
        bufferData[i] = samples[i]
    }
    // Set the buffer to the buffer source
    bufferSource.buffer = audioBuffer
    // Connect the buffer source to the audio context destination
    bufferSource.connect(this.ctx.destination)
    // Start playing
    bufferSource.start()
    this.plot = []
  }
}