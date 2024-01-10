import { Phusycs } from './phusycs.js'
import { Particle } from './particle.js'

function setup() {
  let selected = []
  const phusycs = new Phusycs(120)
  const speedSensitivity = .001
  const scaleSensitivity = .01
  const scrollThreshold = 20

  // 
  // helpers

  function deselectAll() {
    for (const particle of selected) particle.deselect()
    selected = []
  }

  // listen for play
  document.getElementById('play').addEventListener('click', () => phusycs.audioEngine.play(phusycs.edges))
  document.getElementById('download').addEventListener('click', () => phusycs.audioEngine.download(phusycs.edges))

  // listen for scroll
  phusycs.canvas.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) < scrollThreshold) return

    // adjust radii
    if (!selected.length) {
      // increase all radii
      const amount = 1 + (e.deltaY < 0 ? 1 : -1) * scaleSensitivity
      phusycs.scaleRadii(amount)
      return
    }

    // filter for one particle
    if (selected.length > 1 || !(selected[0] instanceof Particle)) return

    // increase node tree radius
    if (!selected[0].parent) {
      const amount = 1 + (e.deltaY < 0 ? 1 : -1) * scaleSensitivity
      phusycs.scaleRoot(selected[0], amount)
      return
    }

    // adjust radius on paused
    if (phusycs.paused) {
      const amount = 1 + (e.deltaY < 0 ? 1 : -1) * scaleSensitivity
      selected[0].radius *= amount
      return
    }

    // adjust speed
    const amount = speedSensitivity * (e.deltaY < 0 ? 1 : -1)
    phusycs.accelParticle(selected[0], amount)
  })
  
  window.addEventListener('keydown', e => {
    switch(e.key) {
      // delete selected 
      case 'Backspace':
        for (const particle of selected) phusycs.disconnect(particle)
        selected = []
        break
      // toggle pause
      case ' ':
        phusycs.togglePause()
        break
      // deselect
      case 'Escape':
        deselectAll()
        break
    }
  })

  function select(...selecting) {
    deselectAll()
    if (!selecting.length) return
    for (const particle of selecting) particle.select()
    selected = selecting
  }

  // drag particle
  let dragging = null
  phusycs.canvas.addEventListener('mousedown', e => {
    dragging = phusycs.getClickedParticle(e.clientX, e.clientY)
  })
  phusycs.canvas.addEventListener('mousemove', e => {
    if (!dragging || dragging.parent != null) return
    dragging.startPos = { x: e.clientX, y: e.clientY }
    // todo select multiple here
  })
  phusycs.canvas.addEventListener('mouseup', e => { 
    // click edge
    if (!dragging) {
      const clickedEdge = phusycs.getClickedEdge(e.clientX, e.clientY)
      if (clickedEdge) {
        select(clickedEdge)
        return
      }
    }

    // reset context
    let selecting = dragging; 
    dragging = null 

    // filter single selections
    if (selected.length > 1) return;

    // create edge on shift click
    if (e.shiftKey && selected[0] instanceof Particle && selecting) {
      const edge = phusycs.connect(selected[0], selecting)
      select(edge)
      return
    }

    // add new particle
    if (!selecting) { 
      parent = selected[0] instanceof Particle ? selected[0] : null
      selecting = phusycs.addParticle(parent, e.clientX, e.clientY)
      phusycs.particles.push(selecting)
    }

    // select particle
    select(selecting)
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