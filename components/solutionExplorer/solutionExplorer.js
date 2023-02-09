import FileGateService from '../../services/fileGateService.js'
import FileAddModal from '../modal/fileAddModal.js'
import FileUpdateModal from '../modal/fileUpdateModal.js'
import {useDispatch, useSelector, useSubscribe} from '../../store/index.js'
import {setSelectedFile, setSelectedFolder} from '../../store/slices/content.js'

import SweetAlert2 from '../../utils/sweetAlert2Helper.js'
import localStorageHelper from '../../utils/localStorageHelper.js'

import ContentEditorHelper from '../../utils/contentEditorHelper.js'
import CustomContextMenu from '../customContextMenu/customContextMenu.js'

class SolutionExplorer extends HTMLElement {
  constructor() {
    super()

    this.innerHTML = `
            <div id="solutionExplorer" class="h-100"  ></div>
        `
  }

  setSelectedTreeItem(file) {
    this.selectedTreeItem = file
    this.treeListInstance.option('selectedRowKeys', [file.id])
  }

  clearSelectedTreeItem() {
    this.selectedTreeItem = null
    this.treeListInstance.option('selectedRowKeys', [])
  }

  getSelectedRowKey() {
    return this.treeListInstance.getSelectedRowKeys()[0]
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
          sortDesc: 'asc',
          domainId: id,
        }
        const {data: files} = await new FileGateService().readAllFilesWithDomainId(request)

        // files.forEach((element) => {
        //   console.log('"id": ', element.id, ' ----- ', '"parentId": ', element.parentId)
        // })
        // console.log('-------------------------------------------------------------------------------------------------------------------')
        // console.log(files)

        return {
          data: files,
          // totalCount: files.length + 1,
        }
      },
    })
  }

  setRecentlyFiles(data) {
    localStorageHelper.setRecentlyFiles(data)
  }
  setTreelistItems(domainId) {
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
      // const files = await fileGateService.readAllFilesWithDomainId({domainId: activeDomain.id})
      // console.log('domainSubs')
      // this.setTreelistItems(files.data, activeDomain.id)
      this.setTreelistItems(activeDomain.id)

      const storageActiveDomainId = localStorageHelper.getItem('activeDomainId')
      if (storageActiveDomainId !== activeDomain.id) {
        const contentEditorHelper = new ContentEditorHelper()
        await contentEditorHelper.clearContent()
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
      self.setSelectedTreeItem(selectedFile)
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
      // loadPanel: {
      //   enabled: false,
      // },
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
            location: 'after',
            widget: 'dxButton',
            options: {
              icon: 'refresh',
              onClick: () => {
                self.refreshTreeList()
              },
            },
          },
          {
            location: 'after',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
              icon: 'add',
              hint: 'Add new file',
              onClick() {
                self.createModal()
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

            const title = name || ufId || id

            let smallTextContent = ufId || id
            if ((!name && !ufId) || name === ufId) smallTextContent = ''
            const template = `
            <div class="d-flex">
                <img src="icon/${data.extension ? data.extension : 'folder'}.svg" style="width:20px;objectFit:'cover'" class="img"/>
                <div>
                  <small class="me-2" style="user-select:none">${title}</small>
                  ${
                    objectType === '1'
                      ? `
                    <small style="font-size:.7rem;user-select:none;" class="text-muted" disabled>
                    ${smallTextContent}
                    </small>
                  
                  `
                      : ''
                  }
                </div>
            </div>
            `
            const element = document.createRange().createContextualFragment(template)

            container.append(element)
          },
        },
      ],
    })

    this.treeListInstance.on({
      contextMenuPreparing(event) {
        // ? Treelistteki itemların dışına tıklanırsa data olmadığı için patlayabiliyor.
        if (!event.row?.data) return

        const {data} = event.row
        if (data) {
          self.setSelectedTreeItem(data)
        }

        if (data.objectType === '0') {
          self.createFolderContextMenu(data)
        }

        if (data.objectType === '1') {
          self.createFileContextMenu(data)
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
        // new ContentEditorHelper().changeContent(row.data)
        // console.log(row.data)
        // useDispatch(setSelectedFile(row.data.id))
      },
    })
  }

  async createModal() {
    const fileAddModal = new FileAddModal()
    document.body.appendChild(fileAddModal)
    fileAddModal.open()
  }

  createFolderContextMenu(data) {
    const menuItems = [
      {id: 'newAdd', text: 'Add New', icon: 'dx-icon-add'},
      {id: 'update', text: 'Update info', icon: 'dx-icon-edit'},
      {id: 'delete', text: 'Delete', icon: 'dx-icon-trash'},
    ]

    document.querySelector('body').append(
      new CustomContextMenu({
        target: '#solutionExplorer .dx-treelist-rowsview .dx-treelist-table tbody .dx-row.dx-data-row td',
        items: menuItems,
        selectedFile: data,
      })
    )
  }

  createFileContextMenu(data) {
    const menuItems = [
      {id: 'preview', text: 'Preview', icon: 'dx-icon-find'},
      {id: 'duplicate', text: 'Duplicate', icon: 'dx-icon-copy'},
      {id: 'copyUrl', text: 'Copy Url', icon: 'dx-icon-map'},
      {id: 'copyId', text: 'Copy Id', icon: 'dx-icon-copy'},
      {id: 'newAdd', text: 'Add New', icon: 'dx-icon-add'},
      {id: 'update', text: 'Update info', icon: 'dx-icon-edit'},
      {id: 'delete', text: 'Delete', icon: 'dx-icon-trash'},
    ]

    document.querySelector('body').append(
      new CustomContextMenu({
        target: '#solutionExplorer .dx-treelist-rowsview .dx-treelist-table tbody .dx-row.dx-data-row td',
        items: menuItems,
        selectedFile: data,
      })
    )
  }
}

window.customElements.define('solution-explorer-component', SolutionExplorer)

export default SolutionExplorer
