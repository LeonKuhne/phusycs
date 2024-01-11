


export class MathMenu {
  constructor(elem) {
    this.elem = elem
    this.operators = ['=', '+', '-', '*', '/', '^']
    this.special = {
      '#': particle => particle.depth()
    }
    this.methods = [
      this.tryOperator,
      this.tryDecimal,
      this.tryNumber,
      this.tryBackspace,
      this.trySpecial 
    ]
    this.visible = false
    this.equation = ''

    // listen for inputs
    window.addEventListener('keydown', e => {
      e.preventDefault()
      const prev = this.equation[this.equation.length - 1] || ''
      for (const method of this.methods) {
        const newEquation  = method.call(this, prev, e.key || parseInt(e.data))
        if (newEquation) { this.equation = newEquation; break; }
      }
      this.rerender()
    })

    this.refocus = null
    this.refocusInterval = 100
  }

  show(operator) {
    this.elem.classList.add('show')
    this.equation = operator
    this.elem.focus()
    this.elem.selectionStart = this.elem.selectionEnd = this.elem.value.length
    this.rerender()
    this.visible = true

    // refocus
    this.refocus = setInterval(() => {
      if (this.visible) this.elem.focus()
    }, this.refocusInterval)
  }

  hide() {
    this.elem.classList.remove('show')
    this.visible = false
    this.refocus = clearInterval(this.refocus)
  }

  rerender() {
    this.elem.value = this.equation
    this.elem.style.width = `${this.elem.value.length}ch`
  }

  applyMath(particle) {
    let statement = this.equation.startsWith('=') ? this.equation.slice(1) : `${particle.rotationSpeed}${this.equation}`
    // replace special chars
    for (const [key, value] of Object.entries(this.special)) {
      statement = statement.replace(key, value(particle))
    }
    const value = eval(statement)
    console.log(`${this.equation}: ${statement} = ${value}`)
    particle.rotationSpeed = value
  }

  tryOperator(prev, next) {
    // enter operator
    if (this.operators.includes(next)) {
      if (next === '=') return '='
      // if prev was number accept, otherwise replace last char
      if (!prev || prev.match(/[0-9.]/) || this.isSpecial(prev)) return this.equation + next
      else return this.equation.slice(0, -1) + next
    }
    return null
  }

  tryDecimal(prev, next) {
    if (next === '.') {
      if (this.isSpecial(prev)) return null
      // if there are no decimals between the last operator and the end of the string accept
      const lastDot = this.equation.lastIndexOf('.')
      if (lastDot >= 0) {
        const sinceLastDot = this.equation.slice(lastDot)
        let valid = false
        for (const op of this.operators) if (sinceLastDot.includes(op)) valid = true
        if (!valid) return null 
      }
      return this.equation + next
    }
    return null
  }

  tryNumber(prev, next) {
    if (next.match(/[0-9]/)) {
      if (this.isSpecial(prev)) return null
      return this.equation + next
    }
    return null
  }

  tryBackspace(prev, next) {
    if (next === 'Backspace') {
      if (this.equation.length < 1) return
      return this.equation.slice(0, -1)
    }
    return null
  }

  trySpecial(prev, next) {
    if (this.isSpecial(next)) {
      if (this.operators.includes(prev)) return this.equation + next
    }
  }

  isSpecial(entry) {
    return Object.keys(this.special).includes(entry)
  }
}