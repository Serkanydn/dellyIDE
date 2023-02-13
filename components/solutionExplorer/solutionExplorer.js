import FileGateService from '../../services/fileGateService.js'
import FileAddModal from '../modal/fileAddModal.js'
import {useDispatch, useSelector, useSubscribe} from '../../store/index.js'
import {setSelectedFolder} from '../../store/slices/content.js'

import localStorageHelper from '../../utils/localStorageHelper.js'

import ContentEditorHelper from '../../utils/contentEditorHelper.js'
import CustomContextMenu from '../customContextMenu/customContextMenu.js'
import {setActiveDomain} from '../../store/slices/user.js'

import customTemplates from '../../utils/devExtreme/customTemplates.js'

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

  // ! userId göndereceğiz.
  getStore(domainIds) {
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
          sortBy: 'name',
          sortDesc: 'asc',
          domainIds,
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
  setTreelistItems(domainIds) {
    const customStore = this.getStore(domainIds)

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

    // useSubscribe('user.activeDomain', async (activeDomain) => {
    //   // const files = await fileGateService.readAllFilesWithDomainId({domainId: activeDomain.id})
    //   // console.log('domainSubs')
    //   // this.setTreelistItems(files.data, activeDomain.id)
    //   console.log('girdi')
    //   this.setTreelistItems(activeDomain.id)

    //   const storageActiveDomainId = localStorageHelper.getItem('activeDomainId')
    //   if (storageActiveDomainId !== activeDomain.id) {
    //     const contentEditorHelper = new ContentEditorHelper()
    //     await contentEditorHelper.clearContent()
    //     localStorageHelper.removeOpenedFiles()
    //     localStorageHelper.clearRecentlyOpenedFiles()
    //     contentEditorHelper.refreshRecentlyOpenedFiles()

    //     // * Headerda active domain değiştikten sonra storage ile redux'taki domain eşit olmuyor if'in içerisine giriyor.
    //     // * Açılmış contentleri tekrar yükleyebilmek için headerda local storage'e set ettiğimiz activeDomainId'yi buraya taşımak zorunda kaldık.
    //     // * Aksi halde headerda redux'a activeDomain'i attığımız için burası açılışta da çalışıyor ve  storage'deki openFiles'lar siliniyor.
    //     localStorageHelper.setItem('activeDomainId', activeDomain.id)
    //   }

    //   self.treeListInstance.searchByText('')
    // })

    useSubscribe('user.activeUser', async (activeUser) => {
      this.setTreelistItems(activeUser.domainId)
    })

    // ? Store Subscribe
    useSubscribe('content.selectedFile', async (selectedFile) => {
      self.setSelectedTreeItem(selectedFile)
    })

    const folders = document.querySelector('#solutionExplorer')
    var draggingGroupName = 'appointmentsGroup'

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
              icon: 'icon/refresh.svg',
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
              icon: 'icon/add.svg',
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
            customTemplates.getTreeListCellTemplate(container, options, true)
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

        if (data.objectType === '0' || data.objectType === '2') {
          self.createFolderContextMenu(data)
        }

        if (data.objectType === '1') {
          self.createFileContextMenu(data)
        }
      },
      rowClick(event) {
        const {data} = event
        if (data.objectType === '0') {
          useDispatch(setSelectedFolder(data))
          return
        }
        if (data.objectType === '2') {
          useDispatch(setSelectedFolder(data))
          useDispatch(setActiveDomain({id: data.id, name: data.name}))
          return
        }
        const {selectedFolder} = useSelector((state) => state.content)
        if (Object.keys(selectedFolder).length !== 0) {
          useDispatch(setSelectedFolder(null))
          useDispatch(setActiveDomain(null))
        }
      },
      rowDblClick(row) {
        if (row.data.objectType === '0' || row.data.objectType === '2') {
          const {id: key} = row.data
          if (this.isRowExpanded(key)) this.collapseRow(key)
          else this.expandRow(key)

          return
        }
        self.setRecentlyFiles(row.data)
        new ContentEditorHelper().changeContent(row.data.id)
      },
    })
  }

  createDraggable() {}

  async createModal() {
    const fileAddModal = new FileAddModal()
    document.body.appendChild(fileAddModal)
    fileAddModal.open()
  }

  createFolderContextMenu(data) {
    document.querySelector('body').append(
      new CustomContextMenu({
        target: '#solutionExplorer .dx-treelist-rowsview .dx-treelist-table tbody .dx-row.dx-data-row td',
        itemType: 'folder',
        selectedFile: data,
      })
    )
  }

  createFileContextMenu(data) {
    document.querySelector('body').append(
      new CustomContextMenu({
        target: '#solutionExplorer .dx-treelist-rowsview .dx-treelist-table tbody .dx-row.dx-data-row td',
        itemType: 'file',
        selectedFile: data,
      })
    )
  }
}

window.customElements.define('solution-explorer-component', SolutionExplorer)

export default SolutionExplorer
