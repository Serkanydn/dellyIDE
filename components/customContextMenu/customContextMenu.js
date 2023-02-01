import {useDispatch} from '../../store/index.js'
import ContentEditorHelper from '../../utils/contentEditorHelper.js'

class CustomContextMenu extends HTMLElement {
  constructor({mouseX, mouseY, activeContentId}) {
    super()
    this.state = {mouseX, mouseY, activeContentId}
    this.innerHTML = `
    
   <div id="context-menu" class="position-absolute">

     <ul class="list-group">

          <a class="list-group-item list-group-item-light" type="button" data-name="copyPath">
            <i class="me-1 dx-icon-map"></i>
            Copy Path
          </a>

          <a class="list-group-item list-group-item-light" type="button" data-name="close">
            <i class="me-1 dx-icon-close"></i>
            Close
          </a>
          
          <a class="list-group-item list-group-item-light" type="button" data-name="closeAll">
            <i class="me-1 dx-icon-close"></i>
            Close All
          </a>

          <a class="list-group-item list-group-item-light" type="button" data-name="delete">
            <i class="me-1 dx-icon-trash"></i>
            Delete
          </a>

     </ul>
   
   </div>
        `
  }

  handleMouseDown = (event) => {
    // ? 1 = auxclick, 2 = rightclick
    if (event.button === 1 || event.button === 2) {
      this.remove()
      return
    }
  }

  async onItemClick(actionName, contentId) {
    switch (actionName) {
      case 'copyPath': {
        await new ContentEditorHelper().copyPath(contentId)
        break
      }
      case 'delete': {
        await new ContentEditorHelper().deleteFile(contentId)
        break
      }
      case 'close': {
        await new ContentEditorHelper().removeContent(contentId)
        break
      }

      case 'closeAll': {
        new ContentEditorHelper().clearContent()
        break
      }
    }
  }

  connectedCallback() {
    const contextMenu = this.querySelector('#context-menu')

    contextMenu.style.top = `${this.state.mouseY}px`
    contextMenu.style.left = `${this.state.mouseX}px`

    document.addEventListener('click', () => {
      this.remove()
    })

    document.addEventListener('mousedown', this.handleMouseDown)

    this.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', async (event) => {
        const dataName = a.getAttribute('data-name')
        await this.onItemClick(dataName, this.state.activeContentId)
        this.remove()
      })
    })
  }

  disconnectedCallback() {
    document.removeEventListener('mousedown', this.handleMouseDown)
  }
}
window.customElements.define('custom-context-menu', CustomContextMenu)
export default CustomContextMenu
