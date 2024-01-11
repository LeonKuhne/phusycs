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
  const speedSensitivity = .0005
  const scaleSensitivity = .01
  const scrollThreshold = 1
  const minDragDistance = 20
  const randomizeAmount = .01

  let selected = []
  let selecting = []
  let dragStart = null
  let dragEnd = null
  let dragging = false
  let shiftSpeed = 100
  let shiftScale = 5
  let slowSpeed = 0.01

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
    for (const particle of selection) particle.select()
    selected = selection
    selection = []
    dragStart = null
    dragEnd = null
    dragging = false
    phusycs.stopDraw('selection-box')
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

  function connectedEdges() {
    return selected.reduce((acc, particleOrEdge) => {
      const addIfMissing = edge => {
        const exists = acc.find(item => phusycs.equalsEdgePath(item, edge.from, edge.to))
        if (!exists) acc.push(edge)
      }
      if (particleOrEdge instanceof Edge) addIfMissing(particleOrEdge)
      else {
        for (const edge of phusycs.edges) {
          if (edge.from === particleOrEdge || edge.to === particleOrEdge) addIfMissing(edge)
        }
      }
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
    e.preventDefault()
    e.stopPropagation()
    if (Math.abs(e.deltaY) < scrollThreshold) return

    // adjust radii
    if (!selected.length) {
      // increase all radii
      const scale = (e.shiftKey ? scaleSensitivity * shiftScale : scaleSensitivity)
      const amount = 1 + (e.deltaY < 0 ? 1 : -1) * scale
      phusycs.scaleRadii(amount)
      return
    }

    // filter particles
    const selectedParticles = connectedParticles(selected) 
    if (!selectedParticles.length) return

    // increase node tree radius
    const roots = selectedParticles.filter(particle => !particle.parent)
    if (roots.length) {
      const scale = (e.shiftKey ? scaleSensitivity * shiftScale : scaleSensitivity)
      const amount = 1 + (e.deltaY < 0 ? 1 : -1) * scale
      for (const root of roots) phusycs.scaleRoot(root, amount)
      return
    }

    // adjust radius on paused
    if (phusycs.paused) {
      const scale = (e.shiftKey ? scaleSensitivity * shiftScale : scaleSensitivity)
      const amount = 1 + (e.deltaY < 0 ? 1 : -1) * scale
      for (const particle of selectedParticles) particle.radius *= amount
      return
    }

    // adjust speed
    const speed = (e.shiftKey ? speedSensitivity * shiftSpeed : speedSensitivity)
    const amount = speed * (e.deltaY < 0 ? 1 : -1)
    for (const particle of selectedParticles) phusycs.accelParticle(particle, amount)
  })

  //
  // keyboard input
  
  window.addEventListener('keydown', e => {
    switch(e.key) {
      // slowmo
      case 'Shift':
        phusycs.slowmo = slowSpeed
        break;
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
      case 'M':
        for (const edge of connectedEdges()) {
          edge.muted = !edge.muted
          if (edge.muted) edge.solo = false
        }
        break
      // solo selected
      case 's':
      case 'S':
        for (const edge of connectedEdges()) {
          edge.solo = !edge.solo
          if (edge.solo) edge.muted = false 
        }
        break
      case 'a':
      case 'A':
        select(...phusycs.particles)
        break
      // connect selected particles
      case 'c':
      case 'C':
        if (selected.length < 2) return
        const selectedParticles = connectedParticles(selected)
        for (const from of selectedParticles) {
          for (const to of selectedParticles) {
            if (from === to) continue
            phusycs.connect(from, to)
          }
        }
        break
      // disconnect edges between selected particles
      case 'd':
      case 'D':
        for (const from of connectedParticles()) {
          for (const to of connectedParticles()) {
            if (from === to) continue
            phusycs.disconnectPath(from, to)
          }
        }
        break
      // randomize selected particles
      case 'r':
      case 'R':
        if (mathMenu.visible) return
        let amount = randomizeAmount
        if (e.shiftKey) amount *= shiftSpeed
        console.log(amount)
        for (const particle of connectedParticles()) {
          particle.rotationSpeed += (Math.random() * 2 - 1) * amount
        }
        break;

      // toggle math menu
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
        if (!mathMenu.visible || !mathMenu.isReady()) return
        mathMenu.hide()
        for (const particle of connectedParticles()) mathMenu.applyMath(particle)
        break;
    }
  })

  window.addEventListener('keyup', e => {
    switch(e.key) {
      case 'Shift':
        phusycs.slowmo = 1
        break
    }
  })

  //
  // mouse input

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
    if (!dragStart) return
    const dragFrom = { ...dragEnd }
    dragEnd = { x: e.clientX, y: e.clientY }

    // drag view
    if (e.ctrlKey || e.metaKey) {
      phusycs.panView({ x: dragEnd.x - dragFrom.x, y: dragEnd.y - dragFrom.y})
      return
    }


    // select box 
    if (!dragging) {
      selecting = phusycs.inBox(dragStart, dragEnd)
      // draw selection box
      phusycs.onDraw('selection-box', (ctx) => {
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 1
        ctx.strokeRect(dragStart.x, dragStart.y, e.clientX - dragStart.x, e.clientY - dragStart.y)
      })
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
    const particles = selected.filter(entry => entry instanceof Particle)
    if (!selecting.length && dragDistance < minDragDistance) {
      // connect selected to new head
      if (e.button === 2) { 
        const particle = phusycs.addParticle(null, e.clientX, e.clientY)
        for (const target of particles) target.setParent(particle, phusycs.elapsed)
        select(particle)
        return
      } 
      if (particles.length > 1) return
      // add orbiting particle
      const target = particles?.[0] || null
      const particle = phusycs.addParticle(target, e.clientX, e.clientY)
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

  // disable context menu
  phusycs.canvas.addEventListener('contextmenu', e => e.preventDefault())

  // resize canvas
  window.addEventListener('resize', () => {
    phusycs.canvas.width = window.innerWidth
    phusycs.canvas.height = window.innerHeight
  })
  window.dispatchEvent(new Event('resize'))
}

// listen for load
window.addEventListener('load', setup)