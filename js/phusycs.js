import { Particle } from './particle.js'
import { Edge } from './edge.js'
import { AudioEngine } from './audio-engine.js'

export class Phusycs {
  constructor(fps, sampleRate=44100) {
    this.canvas = document.getElementById('view')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.edges = []
    this.particles = []
    this.audioEngine = new AudioEngine(sampleRate)
    this.ctx = this.canvas.getContext('2d')
    setInterval(() => this.draw(), 1000 / fps)
    this.startTime = Date.now()
    this.timestep = 0
    this.pauseTime = 0
    this.particleSpeed = 0.0005
    this.particleSize = 20

    this.trackLength = 200 // in ticks
    this.trackStep = 1 / this.trackLength
    this.progress = 0
  }

  draw() {
    // draw audio player
    this.progress += this.trackStep
    if (this.progress >= 1) {
      this.progress = 0
      // todo reset timing to start
      // it might be easier to change the system to use ticks instead fo timestamps, and then reset the tick back to 0
    }
    this.audioEngine.draw(this.progress)

    // draw & edges particles
    const time = this.elapsed 
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.particles.forEach(particle => particle.parent?.drawRadius(this.ctx, particle.radius, time))
    this.edges.forEach(edge => edge.draw(this.ctx, time))
    this.particles.forEach(particle => particle.draw(this.ctx, time))
  }

  get paused() { return this.pauseTime !== 0 }

  togglePause() { 
    // stop
    if (!this.paused) {
      this.pauseTime = Date.now() 
    // resume
    } else {
      this.startTime += Date.now() - this.pauseTime
      this.pauseTime = 0
    }
  }

  getClickedParticle(x, y) {
    let minDistance = this.particleSize
    let closestParticle = null
    for (const particle of this.particles) {
      const distance = particle.distanceFrom(x, y, this.elapsed)
      if (distance < minDistance) {
        minDistance = distance
        closestParticle = particle
      }
    }
    return closestParticle
  }

  getClickedEdge(x, y) {
    let minDistance = Edge.size
    let closestEdge = null
    for (const edge of this.edges) {
      const distance = edge.distanceFrom(x, y, this.elapsed)
      if (distance < minDistance) {
        minDistance = distance
        closestEdge = edge
      }
    }
    return closestEdge
  }

  addParticle(parent, x, y) {
    return new Particle(parent, x, y, this.particleSize, this.elapsed)
  }

  connect(from, to) {
    const edge = new Edge(from, to)
    // disconnect existing
    const existing = this.edges.find(edge => edge.from === from && edge.to === to)
    if (existing) {
      this.disconnect(existing)
      return null
    }
    // connect new
    this.edges.push(edge)
    return edge
  }

  disconnect(particleOrEdge) {
    if (particleOrEdge instanceof Particle) {
      this.particles = this.particles.filter(particle => particle !== particleOrEdge)
      return
    }
    this.edges = this.edges.filter(edge => edge !== particleOrEdge)
  }

  get elapsed() { 
    if (this.paused) return this.timestep
    this.timestep = (Date.now() - this.startTime) * this.particleSpeed
    return this.timestep 
  } 
}