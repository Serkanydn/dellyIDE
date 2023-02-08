import FileGateService from '../../services/fileGateService.js'
import {useDispatch, useSelector} from '../../store/index.js'
import {setSelectedFolder} from '../../store/slices/content.js'
import ContentEditorHelper from '../../utils/contentEditorHelper.js'
import FileAddModal from '../modal/fileAddModal.js'
import FileUpdateModal from '../modal/fileUpdateModal.js'

class CustomContextMenu extends HTMLElement {
  constructor({items, target, selectedFile}) {
    super()
    this.state = {items, target, selectedFile}
    this.innerHTML = `
    
   <div id="custom-context-menu" >
   </div>
        `
  }

  async onItemClick(actionName, fileId) {
    switch (actionName) {
      case 'duplicate': {
        const fileGateService = new FileGateService()
        const {data: result} = await fileGateService.copyFile(this.state.selectedFile)
        const solutionExplorer = document.querySelector('solution-explorer-component')
        solutionExplorer.refreshTreeList()

        break
      }
      case 'newAdd': {
        if (this.state.selectedFile.objectType === '0') {
          useDispatch(setSelectedFolder(this.state.selectedFile))
        } else {
          useDispatch(setSelectedFolder(null))
        }

        this.createModal()
        break
      }
      case 'update': {
        this.updateModal(this.state.selectedFile)
        break
      }
      case 'preview': {
        window.open(window.config.webServiceUrl, '_blank')
        break
      }
      case 'copyUrl': {
        const {id, ufId, domainId, objectType} = this.state.selectedFile
        await new ContentEditorHelper().copyUrl({id, ufId, domainId, objectType})
        break
      }
      case 'copyId': {
        const {id, ufId, objectType} = this.state.selectedFile
        await await new ContentEditorHelper().copyId({id, ufId, objectType})
        break
      }
      case 'close': {
        await new ContentEditorHelper().removeContent(fileId)
        break
      }

      case 'closeAll': {
        await new ContentEditorHelper().clearContent()
        break
      }
      case 'delete': {
        const {id, objectType} = this.state.selectedFile
        await new ContentEditorHelper().deleteFile(id)
        if (objectType === '0') useDispatch(setSelectedFolder(null))
        break
      }
    }
  }

  async createModal() {
    const fileAddModal = new FileAddModal()
    document.body.appendChild(fileAddModal)
    fileAddModal.open()
  }

  async updateModal(item) {
    const fileGateService = new FileGateService()
    const {id: domainId, name: domainName} = useSelector((state) => state.user.activeDomain)
    const result = await fileGateService.readAllFilesWithDomainId({domainId})
    // const recently = this.setRecentlyFiles(this.state);

    const {id, parentId, name, objectType, ufId, extension, version, path} = item

    const fileUpdateModal = new FileUpdateModal({
      files: result,
      id,
      parentId,
      name,
      ufId,
      extension,
      domainId,
      objectType,
      domainName,
      version,
      path,
    })

    document.body.append(fileUpdateModal)
    fileUpdateModal.open()
  }

  connectedCallback() {
    console.log(this.state.selectedFile)
    const contextMenu = this.querySelector('#custom-context-menu')
    const self = this

    this.contextMenu = new DevExpress.ui.dxContextMenu(contextMenu, {
      dataSource: self.state.items,
      target: self.state.target,
      width: '150px',
      itemTemplate(itemData) {
        const template = `
        <div style="height:25px;" class="d-flex align-items-center">
        ${itemData.icon && `<span class="${itemData.icon} me-2"></span>`}

        ${itemData.text}
        </div>
        `
        return document.createRange().createContextualFragment(template)
      },
      onItemClick(event) {
        self.onItemClick(event.itemData.id, self.state.selectedFile.id)
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
