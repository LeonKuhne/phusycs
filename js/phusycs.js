import { Particle } from './particle.js'
import { Edge } from './edge.js'
import { AudioEngine } from './audio-engine.js'

export class Phusycs {
  constructor(fps, particleSpeed, sampleRate=44100, bufferDelay=1000) {
    this.canvas = document.getElementById('view')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.edges = []
    this.particles = []
    this.audioEngine = new AudioEngine(sampleRate)
    this.ctx = this.canvas.getContext('2d')
    setInterval(() => this.draw(), 1000 / fps)
    setInterval(() => this.audioEngine.sample(this.edges), bufferDelay)
    this.startTime = Date.now()
    this.timestep = 0
    this.pauseTime = 0
    this.particleSpeed = 0.001
    this.particleSize = 30
  }

  draw() {
    const time = this.elapsed 
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.particles.forEach(particle => particle.draw(this.ctx, time))
    this.edges.forEach(edge => edge.draw(this.ctx, time))
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

  getClickedParticle(x, y, size) {
    let minDistance = size
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