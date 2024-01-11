import { Phusycs } from './phusycs.js'
import { Particle } from './particle.js'
import { Edge } from './edge.js'

function setup() {
  const phusycs = new Phusycs(120)
  const speedSensitivity = .001
  const scaleSensitivity = .01
  const scrollThreshold = 20
  let selected = []
  let selecting = []
  let dragStart = null
  let dragEnd = null
  let dragging = false

  // 
  // helpers

  function deselectAll() {
    for (const particle of selected) particle.deselect()
    selected = []
    selecting = []
  }

  function select(...selection) {
    deselectAll()
    if (!selection.length) return
    for (const particle of selection) particle.select()
    selected = selection
    selection = []
    dragStart = null
    dragEnd = null
    dragging = false
  }

  //
  // listeners

  // trigger download
  document.getElementById('play').addEventListener('click', () => phusycs.togglePause())
  document.getElementById('download').addEventListener('click', () => phusycs.audioEngine.download(phusycs.edges))
  document.getElementById('help').addEventListener('click', () => document.getElementById('instructions').classList.toggle('show'))
  document.getElementById('instructions').addEventListener('click', () => document.getElementById('instructions').classList.remove('show'))

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

    // filter particles
    const selectedParticles = selected.filter(particle => particle instanceof Particle)
    if (!selectedParticles.length) return

    // increase node tree radius
    const roots = selectedParticles.filter(particle => !particle.parent)
    if (roots.length) {
      const amount = 1 + (e.deltaY < 0 ? 1 : -1) * scaleSensitivity
      for (const root of roots) phusycs.scaleRoot(root, amount)
      return
    }

    // adjust radius on paused
    if (phusycs.paused) {
      const amount = 1 + (e.deltaY < 0 ? 1 : -1) * scaleSensitivity
      for (const particle of selectedParticles) particle.radius *= amount
      return
    }

    // adjust speed
    const amount = speedSensitivity * (e.deltaY < 0 ? 1 : -1)
    for (const particle of selectedParticles) phusycs.accelParticle(particle, amount)
  })
  
  window.addEventListener('keydown', e => {
    switch(e.key) {
      // delete selected 
      case 'Backspace':
        for (const particle of selected) phusycs.disconnect(particle)
        selected = []
        deselectAll()
        break
      // toggle pause
      case ' ':
        phusycs.togglePause()
        break
      // deselect
      case 'Escape':
        deselectAll()
        break
      // mute selected
      case 'm':
        for (const edge of selected.filter(edge => edge instanceof Edge)) {
          edge.muted = !edge.muted
          if (edge.muted) edge.solo = false
        }
        break
      // solo selected
      case 's':
        for (const edge of selected.filter(edge => edge instanceof Edge)) {
          edge.solo = !edge.solo
          if (edge.solo) edge.muted = false
        }
        break
    }
  })

  phusycs.canvas.addEventListener('mousedown', e => {
    // capture drag
    dragStart = { x: e.clientX, y: e.clientY }
    dragEnd = { x: e.clientX, y: e.clientY }
    const particle = phusycs.getClickedParticle(e.clientX, e.clientY)
    if (particle) {
      dragging = true;
      selecting = [particle]
    }
  })

  phusycs.canvas.addEventListener('mousemove', e => {
    // drag
    if (!dragStart) return
    const dragFrom = { ...dragEnd }
    dragEnd = { x: e.clientX, y: e.clientY }

    // select box 
    if (!dragging) {
      selecting = phusycs.inBox(dragStart, dragEnd)
      // draw selection box
      const ctx = phusycs.canvas.getContext('2d')
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 1
      ctx.strokeRect(dragStart.x, dragStart.y, e.clientX - dragStart.x, e.clientY - dragStart.y)
      return
    }

    // drag roots
    const roots = selected.filter(particle => !particle.parent)
    if (!roots.length) return
    const dragDelta = { x: dragEnd.x - dragFrom.x, y: dragEnd.y - dragFrom.y}
    for (const particle of roots) {
      particle.startPos.x += dragDelta.x
      particle.startPos.y += dragDelta.y
    } 
  })

  phusycs.canvas.addEventListener('mouseup', e => { 
    switch(selecting.length) {

      // no selection
      case 0:
        // click edge
        const clickedEdge = phusycs.getClickedEdge(e.clientX, e.clientY)
        if (clickedEdge) {
          select(clickedEdge)
          return
        }
        // add particle
        parent = selected[0] instanceof Particle ? selected[0] : null
        const particle = phusycs.addParticle(parent, e.clientX, e.clientY)
        select(particle)
        return;
      
      // one selection
      case 1:
        // create edge 
        if (e.shiftKey && selected.length === 1 && selected[0] instanceof Particle && selecting.length) {
          const edge = phusycs.connect(selected[0], selecting[0])
          select(edge)
          return
        }
        break;
    }

    // select particle
    select(...selecting)
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