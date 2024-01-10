import { Particle } from './particle.js'
import { Edge } from './edge.js'
import { AudioEngine } from './audio-engine.js'

export class Phusycs {
  constructor(fps) {
    this.playhead = document.getElementById('playhead')
    this.canvas = document.getElementById('view')
    this.ctx = this.canvas.getContext('2d')
    this.edges = []
    this.particles = []
    this.timestep = 0
    this.pauseTime = 0
    this.particleSize = 20
    this.trackLength = 2000 // in ms
    this.progress = 0

    this.audioEngine = new AudioEngine(this.trackLength)
    setInterval(() => this.draw(), 1000 / fps)
    this.startTime = Date.now()
  }

  draw() {
    // update progress
    if (!this.paused) {
      this.progress = this.elapsed / this.trackLength
      if (this.progress >= 1) {
        this.progress = 0
        this.startTime = Date.now()
        setTimeout(() => {
          this.audioEngine.resample(this.edges)
          this.audioEngine.play()
        }, 0)
      }
    }

    // update timeline
    this.playhead.style.left = `${this.progress * 100}%`

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
      const toRemove = particleOrEdge.allChildren().concat(particleOrEdge)
      this.particles = this.particles.filter(particle => !toRemove.includes(particle))
      this.edges = this.edges.filter(edge => !toRemove.includes(edge.from) && !toRemove.includes(edge.to))
      return
    }
    this.edges = this.edges.filter(edge => edge !== particleOrEdge)
  }

  get elapsed() { 
    if (this.paused) return this.timestep
    this.timestep = (Date.now() - this.startTime)
    return this.timestep 
  } 

  accelParticle(particle, amount) {
    const angleProgressBefore = particle.angleDelta(this.timestep)
    particle.rotationSpeed = (particle.rotationSpeed * (1 + amount)) + amount
    const angleProgressAfter = particle.angleDelta(this.timestep)
    const angleDelta = angleProgressAfter - angleProgressBefore
    particle.angle -= angleDelta
  }

  scaleRadii(amount) {
    this.particles.forEach(particle => particle.radius *= amount)
  }

  scaleRoot(root, amount) {
    for (const particle of root.allChildren()) {
      particle.radius *= amount
      particle.angle *= amount
    }
  }
}