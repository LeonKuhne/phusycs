import { Phusycs } from './phusycs.js'
import { Particle } from './particle.js'
import { Edge } from './edge.js'

function setup() {
  let selected = null
  const phusycs = new Phusycs(120)
  const scrollSensitivity = .0001
  const scrollThreshold = 20

  // listen for play
  document.getElementById('play').addEventListener('click', () => phusycs.audioEngine.play(phusycs.edges))
  document.getElementById('download').addEventListener('click', () => phusycs.audioEngine.download(phusycs.edges))

  // listen for scroll
  phusycs.canvas.addEventListener('wheel', e => {
    if (!selected || !(selected instanceof Particle) || Math.abs(e.deltaY) < scrollThreshold) return
    // adjust speed
    const angleProgressBefore = selected.angleDelta(phusycs.timestep)
    const scrollStep = scrollSensitivity * (e.deltaY < 0 ? 1 : -1)
    selected.rotationSpeed = (selected.rotationSpeed * (1 + scrollStep)) + scrollStep
    const angleProgressAfter = selected.angleDelta(phusycs.timestep)
    const angleDelta = angleProgressAfter - angleProgressBefore
    selected.angle -= angleDelta
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
    // check if edge clicked
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
}

// listen for load
window.addEventListener('load', setup)