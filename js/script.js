import { Phusycs } from './phusycs.js'
import { Particle } from './particle.js'
import { Edge } from './edge.js'

function setup() {
  let selected = null
  const scrollSensitivity = .0001
  const phusycs = new Phusycs(60)

  // listen for scroll
  phusycs.canvas.addEventListener('wheel', e => {
    if (!selected || !(selected instanceof Particle)) return
    selected.rotationSpeed += e.deltaY * scrollSensitivity
  })

  window.addEventListener('keydown', e => {
    switch(e.key) {
      // delete selected 
      case 'Backspace':
        if (selected) phusycs.disconnect(selected)
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
    if (!dragging || dragging.parent) return
    dragging.x += e.clientX - dragging.x
    dragging.y += e.clientY - dragging.y
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