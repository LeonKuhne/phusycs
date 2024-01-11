import { Phusycs } from './phusycs.js'
import { Particle } from './particle.js'
import { Edge } from './edge.js'
import { MathMenu } from './math-menu.js'

function setup() {
  const instructions = document.getElementById('instructions')
  const helpButton = document.getElementById('help')
  const tripButton = document.getElementById('trip')
  const mathMenu = new MathMenu(document.getElementById('math-menu'))

  const phusycs = new Phusycs(60)
  const speedSensitivity = .001
  const scaleSensitivity = .01
  const scrollThreshold = 20
  const minDragDistance = 20

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
    selection = selection.filter(item => item != null)
    if (!selection.length) return
    for (const particle of selection) particle.select()
    selected = selection
    selection = []
    dragStart = null
    dragEnd = null
    dragging = false
  }

  function connectedParticles() {
    return selected.reduce((acc, particleOrEdge) => {
      const addIfMissing = particle => {
        if (!acc.includes(particle)) acc.push(particle)
      }
      if (particleOrEdge instanceof Edge) {
        addIfMissing(particleOrEdge.from)
        addIfMissing(particleOrEdge.to)
      } else addIfMissing(particleOrEdge)
      return acc
    }, [])
  }

  //
  // listeners

  // trigger download
  document.getElementById('play').addEventListener('click', () => phusycs.togglePause())
  document.getElementById('download').addEventListener('click', () => phusycs.audioEngine.download(phusycs.edges))
  instructions.addEventListener('click', () => instructions.classList.remove('show'))

  // toggle help menu
  helpButton.addEventListener('click', () => {
    instructions.classList.toggle('show')
    helpButton.classList.toggle('active')
  })

  // toggle trippy mode
  tripButton.addEventListener('click', () => {
    phusycs.clearScreen = !phusycs.clearScreen
    if (phusycs.clearScreen) {
      tripButton.style.color = '#fff'
      phusycs.lineColor = '#666'
    } else {
      tripButton.style.color = `hsl(${Math.random() * 360}, 35%, 50%)`
      phusycs.lineColor = '#000'
      phusycs.fillScreen('#666')
    }
  })

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
    const selectedParticles = connectedParticles(selected) 
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
        if (mathMenu.visible) return
        for (const entry of selected) phusycs.disconnect(entry)
        selected = []
        deselectAll()
        break
      // toggle pause
      case ' ':
        phusycs.togglePause()
        break
      // deselect
      case 'Escape':
        if (mathMenu.visible) { mathMenu.hide(); return }
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
      case 'a':
        select(...phusycs.particles)
        break
      case 'c':
        if (selected.length < 2) return
        // connect selected particles
        const selectedParticles = connectedParticles(selected)
        for (const from of selectedParticles) {
          for (const to of selectedParticles) {
            if (from === to) continue
            phusycs.connect(from, to)
          }
        }
        break
      case 'd':
        // disconnect edges between selected particles
        for (const from of connectedParticles()) {
          for (const to of connectedParticles()) {
            if (from === to) continue
            phusycs.disconnectPath(from, to)
          }
        }
        break
      case '=':
      case '+':
      case '-':
      case '*':
      case '/':
      case '^':
        if (!selected.length || mathMenu.visible) return
        mathMenu.show(e.key)
        e.preventDefault()
        break;
      case 'Enter':
        // submit equation
        if (!mathMenu.visible) return
        mathMenu.hide()
        for (const particle of connectedParticles()) {
          mathMenu.applyMath(particle)
        }
        break;
    }
  })

  phusycs.canvas.addEventListener('mousedown', e => {
    // capture drag
    dragStart = { x: e.clientX, y: e.clientY }
    dragEnd = { x: e.clientX, y: e.clientY }
    // select particle
    const particle = phusycs.getClickedParticle(e.clientX, e.clientY)
    if (particle) {
      dragging = true;
      selecting = [particle]
      return
    }
    // select edge
    const edge = phusycs.getClickedEdge(e.clientX, e.clientY)
    if (edge) selecting = [edge]
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
    const roots = selecting.filter(particle => particle instanceof Particle && !particle.parent)
    if (!roots.length) return
    const dragDelta = { x: dragEnd.x - dragFrom.x, y: dragEnd.y - dragFrom.y}
    for (const particle of roots) {
      particle.startPos.x += dragDelta.x
      particle.startPos.y += dragDelta.y
    } 
  })

  phusycs.canvas.addEventListener('mouseup', e => { 
    // add particle
    const dragDistance = Particle.distanceBetween(dragStart, dragEnd)
    if (!selecting.length && dragDistance < minDragDistance) {
      parent = selected[0] instanceof Particle ? selected[0] : null
      const particle = phusycs.addParticle(parent, e.clientX, e.clientY)
      select(particle)
      return;
    }

    // select particle
    if (e.shiftKey) {
      const toRemove = selected.filter(entry => selecting.includes(entry))
      selecting = selected
        .concat(selecting)
        .filter(entry => !toRemove.includes(entry))
    }
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