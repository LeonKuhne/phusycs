import { Particle } from './particle.js'

export class Edge {
  static SOLO_COLOR = '#fc0'
  static MUTE_COLOR = '#a00'
  static SELECT_COLOR = '#f60'
  static SIZE = 10

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
    ctx.beginPath()
    ctx.strokeStyle = this.selected ? this.color() : this.baseColor
    ctx.lineWidth = Edge.SIZE
    ctx.moveTo(startPos.x, startPos.y)
    ctx.lineTo(endPos.x, endPos.y)
    ctx.stroke()
  }

  color() {
    if (this.solo) return Edge.SOLO_COLOR
    if (this.muted) return Edge.MUTE_COLOR
    return Edge.SELECT_COLOR
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