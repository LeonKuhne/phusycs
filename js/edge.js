import { Particle } from './particle.js'

export class Edge {
  static SOLO_COLOR = '#fc0'
  static MUTE_COLOR = '#a00'
  static SELECT_COLOR = '#f60'
  static SIZE = 10
  static BORDER_SIZE = 7

  constructor(from, to) {
    this.from = from
    this.to = to
    this.deselect()
    this.muted = false
    this.solo = false
    this.selected = false
    this.baseColor= `hsl(${Math.random() * 360}, 35%, 50%)` 
  }

  length(time) {
    return Particle.distanceBetween(this.from.at(time), this.to.at(time))
  }

  draw(ctx, time) {
    const startPos = this.from.at(time)
    const endPos = this.to.at(time)
    // draw selected and solo/muted 
    let edgeSize = Edge.SIZE
    if (this.selected && (this.solo || this.muted)) {
      Edge.drawLine(ctx, startPos, endPos, edgeSize, this.color())
      edgeSize -= Edge.BORDER_SIZE
    }
    Edge.drawLine(ctx, startPos, endPos, edgeSize, this.selected ? Edge.SELECT_COLOR : this.color())
  }

  static drawLine(ctx, start, end, size, color=this.color()) {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }

  color() {
    if (this.solo) return Edge.SOLO_COLOR
    if (this.muted) return Edge.MUTE_COLOR
    return this.baseColor
  }

  distanceFrom(x, y, time) {
    const startPos = this.from.at(time)
    const endPos = this.to.at(time)
    const A = endPos.y - startPos.y
    const B = startPos.x - endPos.x
    const C = endPos.x * startPos.y - startPos.x * endPos.y
    return Math.abs(A * x + B * y + C) / Math.sqrt(A * A + B * B)
  }

  select() { this.selected = true }
  deselect() { this.selected = false }
}