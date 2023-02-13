import {useDispatch, useSelector} from '../../store/index.js'
import {setSelectedFile} from '../../store/slices/content.js'
import ContentEditorHelper from '../../utils/contentEditorHelper.js'
import CustomContextMenu from '../customContextMenu/customContextMenu.js'

class EditorNavButton extends HTMLElement {
  constructor({title, data, contentId, extension}) {
    super()
    this.state = {title, data, contentId, extension}
    this.solutionExplorer = document.querySelector('solution-explorer-component')
    this.innerHTML = `
    <div id="editorNavItem-${this.state.contentId}" class="nav-item">
      <div class=" position-relative">
         <button id="select-${this.state.contentId}" class="nav-link active" data-bs-toggle="tooltip" data-bs-placement="right">${this.state.title}.${this.state.extension} <label id="isChanged" style="display:none"> * </label></button>
         <button id="remove-${this.state.contentId}" class="remove-button p-0 m-0 position-absolute translate-middle badge bg-white text-dark border-0 rounded-pill "><i class="bi bi-x"></i> </button>
      </div>
    </div>
        `
  }

  connectedCallback() {
    const selectButton = this.getSelectButton()
    // new bootstrap.Tooltip(selectButton)

    selectButton.addEventListener('click', () => {
      useDispatch(setSelectedFile(this.state.data))
    })

    const removeButton = this.getRemoveButton()

    removeButton.addEventListener('click', async () => {
      await new ContentEditorHelper().removeContent(this.state.contentId)
    })

    const editorNavItem = this.getEditorNavItemButton()

    editorNavItem.addEventListener('auxclick', async (event) => {
      if (event.which !== 2) return

      event.preventDefault()
      await new ContentEditorHelper().removeContent(this.state.contentId)
    })

    editorNavItem.addEventListener('mousedown', (event) => {
      if (event.which !== 3) return

      editorNavItem.oncontextmenu = (event) => {
        event.preventDefault()

        document
          .querySelector('body')
          .append(new CustomContextMenu({target: this, itemType: 'editorNavButton', selectedFile: this.state.data}))
      }
    })
  }

  getSelectButton() {
    return document.querySelector(`#select-${this.state.contentId}`)
  }

  getRemoveButton() {
    return document.querySelector(`#remove-${this.state.contentId}`)
  }

  getEditorNavItemButton() {
    return document.querySelector(`#editorNavItem-${this.state.contentId}`)
  }

  disconnectedCallback() {}
}

window.customElements.define('editor-nav-button', EditorNavButton)
export default EditorNavButton
