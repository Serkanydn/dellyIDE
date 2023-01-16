import SolutionExplorer from '../solutionExplorer/solutionExplorer.js'
import Toolbox from '../toolbox/toolbox.js'

class Aside extends HTMLElement {
  constructor() {
    super()

    // <button id="update" class="btn btn-success ">Güncelle</button>
    this.fileEditor = document.querySelector('file-editor')
    //   <div class="openNav">
    //   <button id="nav-open-button" class="btn btn-light bi bi-chevron-double-left" data-id="0"> </button>
    // </div>
    // <div class="hideNav">
    //       <button id="nav-hide-button" class="btn btn-light bi bi-chevron-double-right" data-id="0"> </button>
    //     </div>
    this.innerHTML = `
    <div class="aside">
    <div class="aside-header"> 
      <div id="toolbarArea"></div>
    </div>
    <div class="aside-body">
       <div class="aside-content"> 
      </div>
      <nav class="aside-nav">
            <div class="nav nav-tabs nav-justified buttons" id="nav-tab" role="tablist">
              <button
                class="nav-link active"
                id="solutionExplorer"
                data-bs-toggle="tab"
                href="#solutionExplorer"
                role="tab"
                aria-controls="nav-preview"
                aria-selected="true"
                >Explorer</button
              >
              <button
                class="nav-link"
                id="toolbox"
                data-bs-toggle="tab"
                href="#toolbox"
                role="tab"
                aria-controls="nav-formatEditor"
                aria-selected="false"
                >Toolbox</button
              >
            </div>
            </nav>
  </div> 
    `
  }

  async connectedCallback() {
    this.solutionExplorer = new SolutionExplorer()

    const asideContent = document.querySelector('.aside-content')
    asideContent.appendChild(this.solutionExplorer)

    this.toolBox = new Toolbox()
    this.toolBox.style.display = 'none'
    asideContent.appendChild(this.toolBox)

    const mainButtons = document.querySelectorAll(' .buttons button')
    mainButtons.forEach((button) => {
      button.addEventListener('click', () => {
        mainButtons.forEach((btn) => {
          btn.classList.remove('active')
        })

        button.classList.add('active')
        const {id} = button
        switch (id) {
          case 'solutionExplorer': {
            this.solutionExplorer.style.display = 'block'
            this.toolBox.style.display = 'none'
            break
          }

          case 'toolbox': {
            this.solutionExplorer.style.display = 'none'
            this.toolBox.style.display = 'block'
            break
          }
        }
      })
    })
  }
}

window.customElements.define('aside-component', Aside)

export default Aside
