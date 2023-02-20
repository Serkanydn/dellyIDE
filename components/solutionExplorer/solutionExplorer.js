import FileGateService from '../../services/fileGateService.js'
import FileAddModal from '../modal/fileAddModal.js'
import {useDispatch, useSelector, useSubscribe} from '../../store/index.js'
import {setSelectedFolder} from '../../store/slices/content.js'

import localStorageHelper from '../../utils/localStorageHelper.js'

import ContentEditorHelper from '../../utils/contentEditorHelper.js'
import CustomContextMenu from '../customContextMenu/customContextMenu.js'

import customTemplates from '../../utils/devExtreme/customTemplates.js'

class SolutionExplorer extends HTMLElement {
  constructor() {
    super()

    this.innerHTML = `
            <div id="solutionExplorer" style=" "  ></div>
        `

    this.classList.add('flex-fill')
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

  getStore(domainIds) {
    const self = this
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
        if (domainIds.length === 1) self.treeListInstance.expandRow(files[0].id)

        self.treeListInstance.option('height', self.offsetHeight - 10)
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

    // ? Store Subscribe
    useSubscribe('user.activeUser', async (activeUser) => {
      this.setTreelistItems(activeUser.domainId)
    })

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

        self.setSelectedTreeItem(data)

        if (data.objectType === '0') {
          self.createFolderContextMenu(data)
        }

        if (data.objectType === '1') {
          self.createFileContextMenu(data)
        }

        const {role} = useSelector((state) => state.user.activeUser)
        if (role === 'superAdmin') {
          if (data.objectType === '2') {
            self.createFolderContextMenu(data)
          }
        }
      },
      rowClick(event) {
        const {data} = event
        if (data.objectType === '0' || data.objectType === '2') {
          useDispatch(setSelectedFolder(data))
          return
        }

        const {selectedFolder} = useSelector((state) => state.content)
        if (Object.keys(selectedFolder).length !== 0) {
          useDispatch(setSelectedFolder(null))
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
        selectedItem: data,
      })
    )
  }

  createFileContextMenu(data) {
    document.querySelector('body').append(
      new CustomContextMenu({
        target: '#solutionExplorer .dx-treelist-rowsview .dx-treelist-table tbody .dx-row.dx-data-row td',
        itemType: 'file',
        selectedItem: data,
      })
    )
  }
}

window.customElements.define('solution-explorer-component', SolutionExplorer)

export default SolutionExplorer
