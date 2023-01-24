import FileGateService from '../../services/fileGateService.js'
import FileAddModal from '../modal/fileAddModal.js'
import FileUpdateModal from '../modal/fileUpdateModal.js'
import {useDispatch, useSelector, useSubscribe} from '../../store/index.js'
import {setSelectedFile, setSelectedFolder} from '../../store/slices/content.js'

import SweetAlert2 from '../../utils/sweetAlert2Helper.js'
import localStorageHelper from '../../utils/localStorageHelper.js'

import ContentEditorHelper from '../../utils/contentEditorHelper.js'

class SolutionExplorer extends HTMLElement {
  constructor() {
    super()

    this.innerHTML = `
            <div id="solutionExplorer"></div>
            <div id="contextMenu"></div>
        `
  }

  setSelectedTreeItem(file) {
    this.selectedTreeItem = file
    this.treeListInstance.option('selectedRowKeys', [file.id])
  }
  getSelectedTreeItem() {
    return this.selectedTreeItem
  }
  refreshTreeList() {
    this.treeListInstance.refresh()
  }

  getTreelistItems() {
    return this.treeListInstance.option('dataSource')
  }
  setRecentlyFiles(data){
    localStorageHelper.setRecentlyFiles(data);
   
  }
  setTreelistItems(items) {
    this.treeListInstance.option('dataSource', items)
  }

  async treeListAddRow(file) {
    const dataSource = this.treeListInstance.getDataSource()
    await dataSource.store().insert(file)
    await dataSource.reload()
  }

  async treeListUpdateRow(file) {
    const {id, ...values} = file
    const dataSource = this.treeListInstance.getDataSource()
    await dataSource.store().update(id, values)
    await dataSource.reload()
  }

  async treeListDeleteRow(id) {
    const dataSource = this.treeListInstance.getDataSource()
    await dataSource.store().remove(id)
    await dataSource.reload()
  }

  clearSelection() {
    this.treeListInstance.clearSelection()
    this.selectedTreeItem = null
  }

  async connectedCallback() {
    const self = this

    const fileGateService = new FileGateService()

    useSubscribe('user.activeDomain', async (activeDomain) => {
      const files = await fileGateService.readAllFilesWithDomainId(activeDomain.id)
      this.setTreelistItems(files.data)

      const contentEditorHelper = new ContentEditorHelper()
      contentEditorHelper.clearContent()
      localStorageHelper.setItem('activeDomainId', activeDomain.id)

      self.treeListInstance.searchByText('')
    })

    const folders = document.querySelector('#solutionExplorer')

    this.treeListInstance = new DevExpress.ui.dxTreeList(folders, {
      dataSource: [],
      rootValue: null,
      allowColumnResizing: true,
      columnResizingMode: 'widget',
      columnAutoWidth: true,
      keyExpr: 'id',
      readOnly: false,
      parentIdExpr: 'parentId',
      showColumnHeaders: false,
      width: '100%',
      noDataText: ' ',
      searchPanel: {
        visible: true,
        highlightCaseSensitive: true,
      },
      highlightChanges: true,
      showRowLines: true,
      showBorders: true,
      selection: {
        mode: 'single',
        recursive: false,
      },

      columns: [
        {
          dataField: 'name',
          caption: 'File Name',
          cellTemplate(container, options) {
            const {data} = options
            const {id, name, ufId, objectType} = data
            const mainDiv = document.createElement('div')
            mainDiv.classList.add('d-flex')

            const icon = document.createElement('img')
            icon.classList.add('img')
            icon.src = `icon/${data.extension ? data.extension : 'folder'}.png`

            const contentDiv = document.createElement('div')
            const text = document.createElement('small')
            text.textContent = name || ufId || id
            text.classList.add('me-2')
            text.style.userSelect = 'none'

            contentDiv.append(text)

            if (objectType === '1') {
              const small = document.createElement('small')
              small.style.fontSize = '.7em'
              small.style.userSelect = 'none'
              small.classList.add('text-muted')
              small.setAttribute('disabled', 'disabled')
              small.textContent = ufId || id

              if ((!name && !ufId) || name === ufId) small.textContent = ''
              contentDiv.append(small)
            }

            mainDiv.append(icon, contentDiv)
            container.append(mainDiv)
          },
        },
      ],
    })

    this.treeListInstance.on({
      contextMenuPreparing(event) {
        // ? Treelistteki itemların dışına tıklanırsa data olmadığı için patlayabiliyor.
        if (event.row?.data) {
          self.setSelectedTreeItem(event.row?.data)
        }
      },
      rowClick({data}) {
        if (data.objectType === '0') {
          useDispatch(setSelectedFolder(data))
          return
        }
        const {selectedFolder} = useSelector((state) => state.content)
        if (Object.keys(selectedFolder).length !== 0) {
          useDispatch(setSelectedFolder(null))
        }
      },
      rowDblClick(row) {
        if (row.data.objectType === '0') {
          const {id: key} = row.data
          if (this.isRowExpanded(key)) this.collapseRow(key)
          else this.expandRow(key)

          return
        }
        self.setRecentlyFiles(row.data);
        useDispatch(setSelectedFile(row.data))
      },
    })

    const contextMenu = document.querySelector('#contextMenu')
    const menuItems = [
      {id: 'open', text: 'Open', icon: 'dx-icon-folder'},
      {id: 'duplicate', text: 'Duplicate', icon: 'dx-icon-copy'},
      {id: 'copyPath', text: 'Copy Path', icon: 'dx-icon-map'},
      {id: 'newAdd', text: 'Add New', icon: 'dx-icon-add'},
      {id: 'update', text: 'Update', icon: 'dx-icon-edit'},
      {id: 'delete', text: 'Delete', icon: 'dx-icon-trash'},
    ]

    this.contextMenu = new DevExpress.ui.dxContextMenu(contextMenu, {
      dataSource: menuItems,
      target: '#solutionExplorer td',
      width: '150px',
      itemTemplate(itemData) {
        const template = document.createElement('div')
        template.style.height = '25px'
        template.classList.add('d-flex', 'align-items-center')
        if (itemData.icon) {
          const span = document.createElement('span')
          span.classList.add(itemData.icon, 'mr-2')
          template.appendChild(span)
        }

        template.append(itemData.text)
        return template
      },
      async onItemClick(event) {
        switch (event.itemData.id) {
          case 'open': {
            const {id, objectType} = self.selectedTreeItem
            if (objectType === '0') return

            const contentEditorHelper = new ContentEditorHelper()
            await contentEditorHelper.changeContent(id)

            break
          }
          case 'duplicate': {
            const selectedFile = self.getSelectedTreeItem()
            const fileGateService = new FileGateService()
            const {data: result} = await fileGateService.copyFile(selectedFile)
            self.treeListAddRow(result.data)

            break
          }
          case 'copyPath': {
            const {id, ufId, domainId, objectType, extension} = self.selectedTreeItem
            if (objectType === '0') return

            let path

            if (ufId) path = `${config.webServiceUrl}/${domainId}/${ufId}.${extension}`
            else path = `${config.webServiceUrl}/${domainId}/${id}.${extension}`

            self.copyTextToClipboard(path)
            SweetAlert2.toastFire({
              title: 'Copied',
            })

            break
          }
          case 'newAdd': {
            self.createModal()
            break
          }

          case 'update': {
            self.updateModal(self.selectedTreeItem)
            break
          }
          case 'delete': {
            const {id} = self.selectedTreeItem
            const contentEditorHelper = new ContentEditorHelper()
            await contentEditorHelper.deleteFile(id)

            break
          }

          default:
            break
        }
      },
    })
  }

  async createModal() {
    const fileAddModal = new FileAddModal()
    document.body.appendChild(fileAddModal)
    fileAddModal.open()
  }

  async updateModal(item) {
    const fileGateService = new FileGateService()
    const {id: domainId, name: domainName} = useSelector((state) => state.user.activeDomain)
    const result = await fileGateService.readAllFilesWithDomainId(domainId)
    // const recently = this.setRecentlyFiles(this.state);

    const {id, parentId, name, objectType, ufId, extension, version} = item

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
    })

    document.body.append(fileUpdateModal)
    fileUpdateModal.open()
  }

  fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement('textarea')
    textArea.value = text

    // Avoid scrolling to bottom
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.position = 'fixed'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      var successful = document.execCommand('copy')
      var msg = successful ? 'successful' : 'unsuccessful'
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err)
    }

    document.body.removeChild(textArea)
  }
  copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(text)
      return
    }
    navigator.clipboard.writeText(text).then(
      () => {
        // console.log('Async: Copying to clipboard was successful!')
      },
      (err) => {
        console.error('Async: Could not copy text: ', err)
      }
    )
  }
}

window.customElements.define('solution-explorer-component', SolutionExplorer)

export default SolutionExplorer
