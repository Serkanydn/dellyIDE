import FileGateService from '../../services/fileGateService.js'
import {useDispatch, useSelector} from '../../store/index.js'
import {setSelectedFolder} from '../../store/slices/content.js'
import ContentEditorHelper from '../../utils/contentEditorHelper.js'
import FileAddModal from '../modal/fileAddModal.js'
import FileUpdateModal from '../modal/fileUpdateModal.js'
import {setActiveDomain} from '../../store/slices/user.js'
import DomainUpdateModal from '../modal/domainUpdateModal.js'

class CustomContextMenu extends HTMLElement {
  constructor({itemType, target, selectedFile}) {
    super()
    this.state = {itemType, target, selectedFile}
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
        } else if (this.state.selectedFile.objectType === '2') {
          useDispatch(setSelectedFolder(this.state.selectedFile))
          useDispatch(setActiveDomain({id: this.state.selectedFile.domainId, name: this.state.selectedFile.name}))
        } else {
          useDispatch(setSelectedFolder(null))
          useDispatch(setActiveDomain(null))
        }

        this.createModal()
        break
      }
      case 'update': {
        const {objectType, id, name} = this.state.selectedFile

        if (objectType === '2') {
          this.domainUpdateModal(this.state.selectedFile)
          useDispatch(setActiveDomain({id: this.state.selectedFile.domainId, name}))
          break
        }

        this.updateModal(this.state.selectedFile)
        break
      }
      case 'preview': {
        const {id, domainId} = this.state.selectedFile
        const newWindow = window.open(`${window.config.previewUrl}${domainId}/${id}`, '_blank')
        setTimeout(() => {
          console.log(newWindow)
          newWindow.location.reload()
        }, 3000)
        break
      }
      case 'copyUrl': {
        const {id, ufId, domainId, objectType} = this.state.selectedFile
        await new ContentEditorHelper().copyUrl({id, ufId, domainId, objectType})
        break
      }
      case 'copyId': {
        const {id, ufId, objectType} = this.state.selectedFile
        await new ContentEditorHelper().copyId({id, ufId, objectType})
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
        if (objectType === '0' || objectType === '2') {
          useDispatch(setSelectedFolder(null))
          useDispatch(setActiveDomain(null))
        }

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
    const {user, content} = useSelector((state) => state)
    // const {id: domainId, name: domainName} = useSelector((state) => state?.user?.activeDomain)
    const result = await fileGateService.readAllFilesWithDomainId({domainIds: user.activeUser.domainId, sortBy: 'name', sortDesc: 'asc'})
    // const recently = this.setRecentlyFiles(this.state);

    const {id, parentId, name, objectType, ufId, extension, domainId, version, path} = item

    const fileUpdateModal = new FileUpdateModal({
      files: result,
      id,
      parentId,
      name,
      ufId,
      extension,
      domainId,
      objectType,
      version,
      path,
    })

    document.body.append(fileUpdateModal)
    fileUpdateModal.open()
  }

  async domainUpdateModal(item) {
    const {id, name} = item
    const domainUpdateModal = new DomainUpdateModal({id, name})
    document.body.append(domainUpdateModal)
    domainUpdateModal.open()
    console.log('domain update modal')
  }

  connectedCallback() {
    const contextMenu = this.querySelector('#custom-context-menu')
    const self = this

    this.contextMenu = new DevExpress.ui.dxContextMenu(contextMenu, {
      dataSource: self.getItems(self.state.itemType),
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

  getItems(itemType) {
    const items = {
      file: [
        {id: 'preview', text: 'Preview', icon: 'dx-icon-find'},
        {id: 'duplicate', text: 'Duplicate', icon: 'dx-icon-copy'},
        {id: 'copyUrl', text: 'Copy Url', icon: 'dx-icon-map'},
        {id: 'copyId', text: 'Copy Identity', icon: 'dx-icon-copy'},
        {id: 'newAdd', text: 'Add New', icon: 'dx-icon-add'},
        {id: 'update', text: 'Update info', icon: 'dx-icon-edit'},
        {id: 'delete', text: 'Delete', icon: 'dx-icon-trash'},
      ],
      folder: [
        {id: 'newAdd', text: 'Add New', icon: 'dx-icon-add'},
        {id: 'update', text: 'Update info', icon: 'dx-icon-edit'},
        {id: 'delete', text: 'Delete', icon: 'dx-icon-trash'},
      ],
      editorNavButton: [
        {id: 'preview', text: 'Preview', icon: 'dx-icon-find'},
        {id: 'copyUrl', text: 'Copy Url', icon: 'dx-icon-map'},
        {id: 'copyId', text: 'Copy Identity', icon: 'dx-icon-copy'},
        {id: 'close', text: 'Close', icon: 'dx-icon-close'},
        {id: 'closeAll', text: 'Close All', icon: 'dx-icon-close'},
      ],
    }
    return items[itemType]
  }

  disconnectedCallback() {
    this.contextMenu.dispose()
  }
}
window.customElements.define('custom-context-menu', CustomContextMenu)
export default CustomContextMenu
