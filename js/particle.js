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
    ctx.fillStyle = this.color
    ctx.fillRect(pos.x - this.size/2, pos.y - this.size/2, this.size, this.size)
  }

  drawRadius(ctx, radius, time) {
    const pos = this.at(time)
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#666'
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
    ctx.stroke()
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