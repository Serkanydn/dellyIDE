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
            <div id="solutionExplorer" class="h-100"  ></div>
            <div id="context-menu"></div>
        `
  }

  setSelectedTreeItem(file) {
    this.selectedTreeItem = file
    // this.treeListInstance.option('selectedRowKeys', [file.id])
  }

  clearSelectedTreeItem() {
    this.selectedTreeItem = null
    this.treeListInstance.option('selectedRowKeys', [])
  }

  getSelectedTreeItem() {
    return this.selectedTreeItem
  }
  refreshTreeList() {
    this.treeListInstance.refresh()
  }

  async reloadTreeList() {
    const dataSource = this.treeListInstance.getDataSource()
    await dataSource.reload()
  }

  getTreelistItems() {
    return this.treeListInstance.option('dataSource')
  }

  getStore(id) {
    return new DevExpress.data.CustomStore({
      totalCount: 100,
      key: 'id',
      async load(loadOptions) {
        // console.log('loadOptions.filter', loadOptions.filter)
        // console.log(loadOptions)

        const request = {
          filter: loadOptions.filter,
          row1: loadOptions.skip,
          row2: loadOptions.skip + loadOptions.take,
          sortBy: 'createdAt',
          sortDesc: 'desc',
          domainId: id,
        }
        const {data: files} = await new FileGateService().readAllFilesWithDomainId(request)

        // files.forEach((element) => {
        //   console.log('"id": ', element.id, ' ----- ', '"parentId": ', element.parentId)
        // })
        // console.log('-------------------------------------------------------------------------------------------------------------------')
        console.log(files)

        return {
          data: files,
          totalCount: files.length + 1,
        }
      },
    })
  }

  setRecentlyFiles(data) {
    localStorageHelper.setRecentlyFiles(data)
  }
  setTreelistItems(items, domainId) {
    const customStore = this.getStore(domainId)

    this.treeListInstance.option('dataSource', customStore)
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

  connectedCallback() {
    const self = this

    const fileGateService = new FileGateService()

    useSubscribe('user.activeDomain', async (activeDomain) => {
      const files = await fileGateService.readAllFilesWithDomainId({domainId: activeDomain.id})
      // console.log('domainSubs')
      this.setTreelistItems(files.data, activeDomain.id)

      const storageActiveDomainId = localStorageHelper.getItem('activeDomainId')
      if (storageActiveDomainId !== activeDomain.id) {
        const contentEditorHelper = new ContentEditorHelper()
        contentEditorHelper.clearContent()
        localStorageHelper.removeOpenedFiles()
        localStorageHelper.clearRecentlyOpenedFiles()
        contentEditorHelper.refreshRecentlyOpenedFiles()

        // * Headerda active domain değiştikten sonra storage ile redux'taki domain eşit olmuyor if'in içerisine giriyor.
        // * Açılmış contentleri tekrar yükleyebilmek için headerda local storage'e set ettiğimiz activeDomainId'yi buraya taşımak zorunda kaldık.
        // * Aksi halde headerda redux'a activeDomain'i attığımız için burası açılışta da çalışıyor ve  storage'deki openFiles'lar siliniyor.
        localStorageHelper.setItem('activeDomainId', activeDomain.id)
      }

      self.treeListInstance.searchByText('')
    })

    // ? Store Subscribe
    useSubscribe('content.selectedFile', async (selectedFile) => {
      if (Object.keys(selectedFile).length === 0) {
        self.clearSelectedTreeItem()
        return
      }

      if (selectedFile.objectType === '1') {
        self.setSelectedTreeItem(selectedFile)
      }
    })

    const folders = document.querySelector('#solutionExplorer')

    this.treeListInstance = new DevExpress.ui.dxTreeList(folders, {
      // dataSource: [],
      remoteOperations: {
        filtering: true,
        paging: true,
      },
      rootValue: null,
      allowColumnResizing: true,
      columnResizingMode: 'widget',
      columnAutoWidth: true,
      keyExpr: 'id',
      readOnly: false,
      parentIdExpr: 'parentId',
      hasItemsExpr: (data) => !data.extension,
      showColumnHeaders: false,
      width: '100%',
      height: '100%',
      noDataText: ' ',
      searchPanel: {
        visible: true,
        highlightCaseSensitive: true,
      },
      highlightChanges: true,
      showRowLines: true,
      showBorders: false,
      loadPanel: {
        enabled: false,
      },
      selection: {
        mode: 'single',
        recursive: false,
      },
      paging: {
        enabled: true,
        pageSize: 5,
      },
      pager: {
        allowedPageSizes: [5, 10, 20],
        showPageSizeSelector: true,
        // showInfo: true,
        showNavigationButtons: true,
      },
      toolbar: {
        items: [
          {
            widget: 'dxButton',
            location: 'after',
            options: {
              icon: 'refresh',
              onClick: () => {
                self.refreshTreeList()
              },
            },
          },
          'searchPanel',
        ],
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
            // icon.classList.add(`folder-${id}`)
            icon.style.width = '20px'
            icon.style.objectFit = 'cover'
            icon.classList.add('img')
            icon.src = `icon/${data.extension ? data.extension : 'folder'}.svg`

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
      rowExpanding(event) {
        // const img = document.querySelector(`.folder-${event.key}`)
        // console.log(img)
        // img.src = 'icon/folderOpen.svg'
        // self.refreshTreeList()
        // const img = row.element.querySelector('#img')
        // console.log(img)
      },
      rowDblClick(row) {
        if (row.data.objectType === '0') {
          const {id: key} = row.data
          if (this.isRowExpanded(key)) this.collapseRow(key)
          else this.expandRow(key)

          return
        }
        self.setRecentlyFiles(row.data)
        new ContentEditorHelper().changeContent(row.data.id)
      },
    })

    const contextMenu = this.querySelector('#context-menu')
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
      target: '#solutionExplorer .dx-treelist-rowsview .dx-treelist-table tbody .dx-row.dx-data-row td ',
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
      async onItemClick(event) {
        switch (event.itemData.id) {
          case 'open': {
            const {id, objectType} = self.selectedTreeItem
            if (objectType === '0') return

            await new ContentEditorHelper().changeContent(id)

            break
          }
          case 'duplicate': {
            const selectedFile = self.getSelectedTreeItem()
            const fileGateService = new FileGateService()
            const {data: result} = await fileGateService.copyFile(selectedFile)
            // self.treeListAddRow(result.data)
            self.refreshTreeList()

            break
          }
          case 'copyPath': {
            const {id} = self.selectedTreeItem

            await new ContentEditorHelper().copyPath(id)

            break
          }
          case 'newAdd': {
            const {id, objectType} = self.selectedTreeItem
            if (objectType === '0') {
              useDispatch(setSelectedFolder(self.selectedTreeItem))
            } else {
              useDispatch(setSelectedFolder(null))
            }

            self.createModal()
            break
          }

          case 'update': {
            self.updateModal(self.selectedTreeItem)
            break
          }
          case 'delete': {
            const {id} = self.selectedTreeItem
            await new ContentEditorHelper().deleteFile(id)

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
}

window.customElements.define('solution-explorer-component', SolutionExplorer)

export default SolutionExplorer
