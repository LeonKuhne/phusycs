export class Particle {
  constructor(parent, x, y, size, timestep) {
    if (parent) parent.children.push(this)
    this.parent = parent
    this.children = []
    this.startPos = { x, y }
    this.radius = parent ? Particle.distanceBetween(parent.at(timestep), this.startPos) : null;
    this.angle = parent ? Particle.angleBetween(parent.at(timestep), this.startPos) : null;
    this.size = size
    this.rotationSpeed = 0.0001
    this.startTime = timestep
    this.deselect()
  }

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
    let size = this.size * this.mass() ** 0.5
    // if no parrent draw border
    if (!this.parent) {
      ctx.fillStyle = '#fff'
      ctx.fillRect(pos.x - size/2, pos.y - size/2, size, size)
      size -= 2
    }
    ctx.fillStyle = this.color
    ctx.fillRect(pos.x - size/2, pos.y - size/2, size, size)
  }

  drawPaused(ctx, time) {
    // write the speed of the particle onto the particle
    const pos = this.at(time)
    const size = this.size * this.mass() ** 0.5
    ctx.fillStyle = '#fff'
    ctx.font = '12px sans-serif'
    // write speed in scientific notation
    let speed = this.rotationSpeed.toExponential(2)
    // center the text bellow the particle
    const textWidth = ctx.measureText(speed).width
    ctx.fillText(speed, pos.x - textWidth/2, pos.y + size/2 + 12)
  }

  drawRadius(ctx, radius, time, lineColor) {
    const pos = this.at(time)
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = lineColor
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
    ctx.stroke()
  }

  mass() {
    let mass = 1
    this.children.forEach(child => mass += child.mass())
    return mass
  }

  select() { this.color = '#f60' }
  deselect() { this.color = `hsl(${Math.random() * 360}, 35%, 50%)` }
  distanceFrom(x, y, time) { return Particle.distanceBetween(this.at(time), { x, y }) }
  static distanceBetween(a, b) { return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) }
  static angleBetween(a, b) { return Math.atan2(b.y - a.y, b.x - a.x) }

  allChildren() {
    let children = [...this.children]
    this.children.forEach(child => children = children.concat(child.allChildren()))
    return children
  }
}