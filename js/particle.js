export class Particle {
  constructor(parent, x, y, size, timestep) {
    this.parent = parent
    this.startPos = { x, y }
    this.radius = parent ? Particle.distanceBetween(parent.at(timestep), this.startPos) : null;
    this.angle = parent ? Particle.angleBetween(parent.at(timestep), this.startPos) : null;
    this.size = size
    this.rotationSpeed = 1
    this.startTime = timestep
    this.deselect()
  }

  // lookup particle position at a specific time/tick
  at(time) {
    if (!this.parent) return this.startPos
    let pos = { ...this.parent.at(time) }
    const angle = this.angle + this.angleDelta(time)
    pos.x += this.radius * Math.cos(angle)
    pos.y += this.radius * Math.sin(angle)
    return pos
  }

  angleDelta(time) {
    return (time - this.startTime) * this.rotationSpeed
  }

  draw(ctx, time) {
    const pos = this.at(time)
    // draw particle
    ctx.fillStyle = this.color
    ctx.fillRect(pos.x - this.size/2, pos.y - this.size/2, this.size, this.size)
    // draw a circle around parent with this radius
    if (this.parent) {
      this.parent.drawRadius(ctx, this.radius, time)
    }
  }

  drawRadius(ctx, radius, time) {
    const pos = this.at(time)
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'red'
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
    ctx.stroke()
  }

  select() { this.color = 'tan' }
  deselect() { this.color = 'green' }
  distanceFrom(x, y, time) { return Particle.distanceBetween(this.at(time), { x, y }) }
  static distanceBetween(a, b) { return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) }
  static angleBetween(a, b) { return Math.atan2(b.y - a.y, b.x - a.x) }
}