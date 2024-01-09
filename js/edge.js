import { Particle } from './particle.js'

export class Edge {
  static size = 10

  constructor(from, to) {
    this.from = from
    this.to = to
    this.deselect()
  }

  length(time) {
    return Particle.distanceBetween(this.from.at(time), this.to.at(time))
  }

  draw(ctx, time) {
    const startPos = this.from.at(time)
    const endPos = this.to.at(time)
    ctx.beginPath()
    ctx.strokeStyle = this.color
    ctx.lineWidth = Edge.size
    ctx.moveTo(startPos.x, startPos.y)
    ctx.lineTo(endPos.x, endPos.y)
    ctx.stroke()
  }

  distanceFrom(x, y, time) {
    const startPos = this.from.at(time)
    const endPos = this.to.at(time)
    const A = endPos.y - startPos.y
    const B = startPos.x - endPos.x
    const C = endPos.x * startPos.y - startPos.x * endPos.y
    return Math.abs(A * x + B * y + C) / Math.sqrt(A * A + B * B)
  }

  select() { this.color = '#f60' }
  deselect() { this.color = `hsl(${Math.random() * 360}, 35%, 50%)` }
}