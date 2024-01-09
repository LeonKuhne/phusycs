import { Phusycs } from './phusycs.js'
import { Particle } from './particle.js'
import { Edge } from './edge.js'

function setup() {
  let selected = null
  const phusycs = new Phusycs(120)
  const speedSensitivity = .001
  const scaleSensitivity = .01
  const scrollThreshold = 20

  // listen for play
  document.getElementById('play').addEventListener('click', () => phusycs.audioEngine.play(phusycs.edges))
  document.getElementById('download').addEventListener('click', () => phusycs.audioEngine.download(phusycs.edges))

  // listen for scroll
  phusycs.canvas.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) < scrollThreshold) return

    // adjust radii
    if (!selected) {
      // increase all radii
      const amount = 1 + (e.deltaY < 0 ? 1 : -1) * scaleSensitivity
      phusycs.scaleRadii(amount)
      return
    }

    // filter particles
    if (!(selected instanceof Particle)) return

    // adjust radius on paused
    if (phusycs.paused) {
      const amount = 1 + (e.deltaY < 0 ? 1 : -1) * scaleSensitivity
      selected.radius *= amount
      return
    }

    // adjust speed
    const amount = speedSensitivity * (e.deltaY < 0 ? 1 : -1)
    phusycs.accelParticle(selected, amount)
  })
  
  window.addEventListener('keydown', e => {
    switch(e.key) {
      // delete selected 
      case 'Backspace':
        if (selected) {
          phusycs.disconnect(selected)
          selected = null
        }
        break
      // toggle pause
      case ' ':
        phusycs.togglePause()
        break
      // deselect
      case 'Escape':
        if (selected) { selected.deselect() }
        selected = null
        break
    }
  })

  // drag particle
  let dragging = null
  phusycs.canvas.addEventListener('mousedown', e => {
    dragging = phusycs.getClickedParticle(e.clientX, e.clientY)
  })
  phusycs.canvas.addEventListener('mousemove', e => {
    if (!dragging || dragging.parent != null) return
    dragging.startPos = { x: e.clientX, y: e.clientY }
  })
  phusycs.canvas.addEventListener('mouseup', e => { 
    // click edge
    if (!dragging) {
      const clickedEdge = phusycs.getClickedEdge(e.clientX, e.clientY)
      if (clickedEdge) {
        selected.deselect()
        selected = clickedEdge
        selected.select()
        return
      }
    }

    // reset context
    let selecting = dragging; 
    dragging = null 
    if (selected) selected.deselect()

    // create edge on shift click
    if (e.shiftKey && selected instanceof Particle && selecting) {
      selected = phusycs.connect(selected, selecting)
      selected?.select()
      return
    }

    // add a new particle
    if (!selecting) { 
      parent = selected instanceof Particle ? selected : null
      selecting = phusycs.addParticle(parent, e.clientX, e.clientY)
      phusycs.particles.push(selecting)
    }

    // select particle
    selecting.select()
    selected = selecting
  })

  // resize canvas
  window.addEventListener('resize', () => {
    phusycs.canvas.width = window.innerWidth
    phusycs.canvas.height = window.innerHeight
  })
  window.dispatchEvent(new Event('resize'))
}

// listen for load
window.addEventListener('load', setup)