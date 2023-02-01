import {useDispatch} from '../../store/index.js'
import ContentEditorHelper from '../../utils/contentEditorHelper.js'

class CustomContextMenu extends HTMLElement {
  constructor({mouseX, mouseY, target, activeContentId}) {
    super()
    this.state = {mouseX, mouseY, target, activeContentId}
    this.innerHTML = `
    
   <div id="custom-context-menu" >
   </div>
        `
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
    const contextMenu = this.querySelector('#custom-context-menu')
    const self = this

    const menuItems = [
      {id: 'copyPath', text: 'Copy Path', icon: 'dx-icon-map'},
      {id: 'close', text: 'Close', icon: 'dx-icon-close'},
      {id: 'closeAll', text: 'Close All', icon: 'dx-icon-close'},
      {id: 'delete', text: 'Delete', icon: 'dx-icon-trash'},
    ]

    this.contextMenu = new DevExpress.ui.dxContextMenu(contextMenu, {
      dataSource: menuItems,
      target: self.state.target,
      width: '150px',
      itemTemplate(itemData) {
        const template = document.createElement('div')
        template.style.height = '25px'
        template.classList.add('d-flex', 'align-items-center')
        if (itemData.icon) {
          const span = document.createElement('span')
          span.classList.add(itemData.icon, 'me-2')
          template.appendChild(span)
        }

        template.append(itemData.text)
        return template
      },
      onItemClick(event) {
        self.onItemClick(event.itemData.id, self.state.activeContentId)
        self.remove()
      },
      closeOnOutsideClick() {
        self.remove()
      },
    })
  }

  disconnectedCallback() {
    this.contextMenu.dispose()
  }
}
window.customElements.define('custom-context-menu', CustomContextMenu)
export default CustomContextMenu
