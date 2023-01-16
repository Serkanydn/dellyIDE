const captureProps = (element) => {
  return Array.from(element.attributes).reduce((acc, {name, value}) => {
    acc[name] = value
    return acc
  }, {})
}

class BaseComponent extends HTMLElement {
  constructor(state = {}) {
    super()

    this.props = captureProps(this)
    this.state = state

    this.attachShadow({mode: 'open'})
    this.rend()
  }

  static createComponent(name, element) {
    window.customElements.define(name, element)
  }

  setState(newState) {
    this.state = {...this.state, ...newState}
    this.rend()
  }

  rend() {
    this.props = captureProps(this)
    this.shadowRoot.innerHTML = this.render(this.state, this.props)
    this.afterRender()
  }

  render(state, props) {
    return ``
  }

  afterRender() {}
}

export default BaseComponent
