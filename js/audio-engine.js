export class AudioEngine {

  constructor(sampleRate) {
    // Create a new AudioContext
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    this.plot = []
    this.sampleRate = sampleRate
    this.playhead = document.getElementById('playhead')

    // play audio
    document.getElementById('play').addEventListener('click', () => {
      this.play()
    })
  }

  draw(progress) {
    this.playhead.style.left = `${progress * 100}%`
  }

  play() {
    const signal = []
    // go through every timestep in range and get the signal
    // TODO
    const samples = new Float32Array(signal)
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