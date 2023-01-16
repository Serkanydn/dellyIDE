class Toolbox extends HTMLElement {
  constructor(state) {
    super(state);

    this.innerHTML = `
  
    <div class="toolbox-body">
        Toolbox
    </div> 
    `;
  }

  async connectedCallback() {}
}

window.customElements.define("toolbox-component", Toolbox);

export default Toolbox;
