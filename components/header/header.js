import localStorageHelper from '../../utils/localStorageHelper.js'
import FileGateService from '../../services/fileGateService.js'
import UserService from '../../services/userService.js'
import domainService from '../../services/domainService.js'
import FileAddModal from '../modal/fileAddModal.js'
import DomainAddModal from '../modal/domainAddModal.js'
import FileUpdateModal from '../modal/fileUpdateModal.js'
import SweetAlert2Helper from '../../utils/sweetAlert2Helper.js'
import {useDispatch, useSelector} from '../../store/index.js'
import {setUserInitialState} from '../../store/slices/user.js'
import ContentEditorHelper from '../../utils/contentEditorHelper.js'

class Header extends HTMLElement {
  constructor(state) {
    super(state)
    this.fileEditor = document.querySelector('file-editor')
    this.innerHTML = `
   
    <div class="header px-2 py-1" >
      <div id="headerToolbar">
      </div>
    </div>
    `
    this.user = null
    this.selectedDomain = null
    this.miniMapIsShow = true
  }

  repaintToolbox() {
    this.toolbar?.repaint()
  }

  changeTheme(theme) {
    new ContentEditorHelper().changeTheme(theme)
  }

  changeFontSize(fontSize) {
    new ContentEditorHelper().changeFontSize(fontSize)
  }

  async saveFile() {
    new ContentEditorHelper().saveFile()
  }

  async saveAllFiles() {
    new ContentEditorHelper().saveAllFiles()
  }

  async deleteFile() {
    const {id: selectedFileId} = useSelector((state) => state.content.selectedFile)
    if (!selectedFileId) return
    const contentEditorHelper = new ContentEditorHelper()
    contentEditorHelper.deleteFile(selectedFileId)
  }

  async createModal() {
    const fileAddModal = new FileAddModal()
    fileAddModal.open()
  }

  createDomainAddModal() {
    const domainAddModal = new DomainAddModal()
    domainAddModal.open()
  }

  async updateModal() {
    const {id: selectedFileId} = useSelector((state) => state.content.selectedFile)

    if (!selectedFileId) return

    const fileGateService = new FileGateService()
    const {user, content} = useSelector((state) => state)

    const result = await fileGateService.readAllFilesWithDomainId({domainIds: user.activeUser.domainId, sortBy: 'name', sortDesc: 'asc'})

    const {id, parentId, name, objectType, ufId, extension, version, path, domainId} = useSelector((state) => state.content.selectedFile)

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
    // document.body.append(fileUpdateModal)
    fileUpdateModal.open()
  }
  async previewFile() {
    const {id: selectedFileId, domainId} = useSelector((state) => state.content.selectedFile)
    if (!selectedFileId) return

    new ContentEditorHelper().setPreviewWindow(selectedFileId, domainId)
  }

  foldSelection() {
    new ContentEditorHelper().foldSelection()
  }

  unFoldSelection() {
    new ContentEditorHelper().unFoldSelection()
  }

  addCommentLine() {
    new ContentEditorHelper().addCommentLine()
  }

  removeCommentLine() {
    new ContentEditorHelper().removeCommentLine()
  }
  formatDocument() {
    new ContentEditorHelper().formatDocument()
  }

  toggleMinimap() {
    new ContentEditorHelper().toggleMinimap()

    this.miniMapIsShow = !this.miniMapIsShow
  }

  async connectedCallback() {
    const self = this
    if (!localStorageHelper.getItem('theme')) {
      localStorageHelper.setItem('theme', 'vs-light')
    }
    if (!localStorageHelper.getItem('fontSize')) {
      localStorageHelper.setItem('fontSize', '14px')
    }
    if (!localStorageHelper.getItem('openNav')) {
      localStorageHelper.setItem('openNav', 'true')
    }

    const {user, content} = useSelector((state) => state)
    this.user = user

    const headerToolbar = document.querySelector('#headerToolbar')
    this.headerToolbar = new DevExpress.ui.dxToolbar(headerToolbar, {
      items: [
        {
          location: 'before',
          widget: 'dxButton',
          options: {
            type: 'back',
            icon: 'icon/save.svg',
            hint: 'Save file',
            onClick() {
              self.saveFile()
            },
          },
        },
        {
          location: 'before',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            icon: 'icon/save-all.svg',
            hint: 'Save all files',
            onClick() {
              self.saveAllFiles()
            },
          },
        },
        {
          location: 'before',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            icon: 'icon/collapse-all.svg',
            hint: 'Collapse Al',
            onClick() {
              self.foldSelection()
            },
          },
        },
        {
          location: 'before',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            icon: 'icon/expand-all.svg',
            hint: 'Expand All',
            onClick() {
              self.unFoldSelection()
            },
          },
        },
        {
          location: 'before',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            icon: 'icon/comment.svg',
            hint: 'Comment out the selected lines',
            onClick() {
              self.addCommentLine()
            },
          },
        },
        {
          location: 'before',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            icon: 'icon/un-comment.svg',
            hint: 'Uncomment out the selected lines',
            onClick() {
              self.removeCommentLine()
            },
          },
        },
        {
          location: 'before',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            icon: 'icon/format-document.svg',
            hint: 'Format Document',
            onClick() {
              self.formatDocument()
            },
          },
        },
        {
          location: 'before',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            icon: 'icon/preview.svg',
            hint: 'Preview',
            onClick() {
              self.previewFile()
            },
          },
        },
        {
          location: 'before',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            icon: 'icon/minimapShow.svg',
            hint: 'Minimap',
            onClick() {
              self.toggleMinimap()

              if (!self.miniMapIsShow) {
                this.option('icon', 'icon/minimapHide.svg')
              } else {
                this.option('icon', 'icon/minimapShow.svg')
              }
            },
          },
        },
        {
          location: 'before',
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
        {
          location: 'before',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            icon: 'icon/edit.svg',
            hint: 'Update file',
            onClick() {
              self.updateModal()
            },
          },
        },
        {
          location: 'before',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            icon: 'icon/trash.svg',
            hint: 'Delete file',
            onClick() {
              self.deleteFile()
            },
          },
        },
        {
          location: 'before',
          widget: 'dxSelectBox',
          locateInMenu: 'auto',
          options: {
            width: 140,
            dataSource: new DevExpress.data.ArrayStore({
              data: [
                {id: 'light', value: 'Light'},
                {id: 'dark', value: 'Dark'},
              ],
              key: 'id',
            }),
            valueExpr: 'id',
            displayExpr: 'value',
            value: localStorageHelper.getItem('theme'),
            onValueChanged({value}) {
              self.changeTheme(value)
            },
          },
        },
        {
          location: 'before',
          widget: 'dxSelectBox',
          locateInMenu: 'auto',
          options: {
            width: 140,
            dataSource: new DevExpress.data.ArrayStore({
              data: [
                {id: '10px', value: '10px'},
                {id: '11px', value: '11px'},
                {id: '12px', value: '12px'},
                {id: '13px', value: '13px'},
                {id: '14px', value: '14px'},
                {id: '16px', value: '16px'},
                {id: '18px', value: '18px'},
                {id: '20px', value: '20px'},
              ],
              key: 'id',
            }),
            valueExpr: 'id',
            displayExpr: 'value',
            value: localStorageHelper.getItem('fontSize'),
            onValueChanged({value}) {
              self.changeFontSize(value)
            },
          },
        },

        {
          location: 'after',
          locateInMenu: 'auto',
          widget: 'dxButton',
          options: {
            stylingMode: 'text',
            icon: `${localStorageHelper.getItem('openNav') === 'true' ? 'icon/chevron-right.svg' : 'icon/chevron-left.svg'}`,
            hint: `${localStorageHelper.getItem('openNav') === 'true' ? 'Hide panel' : 'Show panel'}`,
            onClick() {
              if (localStorageHelper.getItem('openNav') === 'true') {
                localStorageHelper.setItem('openNav', 'false')

                document.querySelector('.file-content').classList.add('col-md-12')
                document.querySelector('.file-aside').classList.add('d-none')
                this.option('icon', 'icon/chevron-left.svg')
                this.option('hint', 'Show Panel ')
                return
              }
              localStorageHelper.setItem('openNav', 'true')
              document.querySelector('.file-content').classList.remove('col-md-12')
              document.querySelector('.file-aside').classList.remove('d-none')
              this.option('icon', 'icon/chevron-right.svg')
              this.option('hint', 'Hide Panel ')
            },
          },
        },

        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: 'auto',
          // visible: self.user.role === 'superAdmin',
          options: {
            icon: 'icon/web.svg',
            hint: 'Add domain',
            onClick() {
              self.createDomainAddModal()
            },
          },
        },
        {
          location: 'after',
          locateInMenu: 'auto',
          widget: 'dxMenu',
          options: {
            dataSource: [
              {
                icon: 'icon/account.svg',
                items: [{name: 'Logout'}],
              },
            ],
            displayExpr: 'name',
            onItemClick(data) {
              if (data.itemData.name === 'Logout') {
                localStorageHelper.clear()
                location.reload()
              }
            },
          },
        },
        // {
        //   location: 'after',
        //   locateInMenu: 'auto',
        //   widget: 'dxButton',
        //   visible: ((localStorageHelper.getItem("openNav") === "false")),
        //   options: {
        //     icon: 'chevronleft',
        //     onClick() {
        //       localStorageHelper.setItem('openNav', 'true')
        //       document.querySelector('.aside-body').style.display = 'flex'
        //       document.querySelector('.aside-header').style.display = 'flex'
        //       document.querySelector('.openNav').style.display = 'none'
        //       document.querySelector('.resizable-right').style.left = '896px'
        //       document.querySelector('.resizable-right').style.width = '400px'
        //       document.querySelector('.resizable-right').style.removeProperty('right')
        //       document.querySelector('.resizer').style.display = 'block'
        //       Resizable.activeContentWindows[0].changeSize(window.innerWidth, window.innerHeight)
        //       Resizable.activeContentWindows[0].childrenResize()
        //     },
        //   },
        // },
      ],
    })
    // Resizable.resizingEnded = function () {
    //   var width = document.body.clientWidth;
    //   const resizableLeft = document.querySelector('.resizable-left').style.width;
    //   const resizableRight = document.querySelector('.resizable-right').style.width;
    //   const first = width/100;
    //   const resWrap1 = ((parseInt(resizableLeft)/first)/100)
    //   const resWrap2 = ((parseInt(resizableRight)/first)/100)
    //   localStorageHelper.setItem("resWrap1",resWrap1)
    //   localStorageHelper.setItem("resWrap2",resWrap2)
    // }
  }
}

window.customElements.define('header-component', Header)
export default Header
