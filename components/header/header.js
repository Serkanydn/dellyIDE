import localStorageHelper from '../../utils/localStorageHelper.js'
import FileGateService from '../../services/fileGateService.js'
import UserService from '../../services/userService.js'
import FileAddModal from '../modal/fileAddModal.js'
import FileUpdateModal from '../modal/fileUpdateModal.js'
import SweetAlert2Helper from '../../utils/sweetAlert2Helper.js'
import {useDispatch, useSelector} from '../../store/index.js'
import {setActiveUser, setActiveDomain, setUserInitialState} from '../../store/slices/user.js'
import ContentEditorHelper from '../../utils/contentEditorHelper.js'

class Header extends HTMLElement {
  constructor(state) {
    super(state)
    this.fileEditor = document.querySelector('file-editor')
    this.innerHTML = `
   
    <div class="header" >
      <div id="headerToolbar">
      </div>
    </div>
    `
    this.user = null
    this.activeDomainId = null
    this.selectedDomain = null
  }

  repaintToolbox() {
    this.toolbar?.repaint()
  }

  getActiveDomain() {
    return this.activeDomainId
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
    document.body.appendChild(fileAddModal)
    fileAddModal.open()
  }

  async updateModal() {
    const {id: selectedFileId} = useSelector((state) => state.content.selectedFile)

    if (!selectedFileId) return

    const fileGateService = new FileGateService()
    const {id: domainId, name: domainName} = useSelector((state) => state.user.activeDomain)
    const result = await fileGateService.readAllFilesWithDomainId(domainId)

    const {id, parentId, name, objectType, ufId, extension, version} = useSelector((state) => state.content.selectedFile)

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

  async connectedCallback() {
    const self = this
    if (!localStorageHelper.getItem('theme')) {
      localStorageHelper.setItem('theme', 'vs-light')
    }
    if (!localStorageHelper.getItem('fontSize')) {
      localStorageHelper.setItem('fontSize', '10px')
    }
    if (!localStorageHelper.getItem('openNav')) {
      localStorageHelper.setItem('openNav', 'true')
    }

    const userService = new UserService()
    const {data: user} = await userService.getActiveUser()

    const {id: domainId, name} =
      user.domainList.find((domain) => domain.id === localStorageHelper.getItem('activeDomainId')) || user.domainList[0]

    // useDispatch(setActiveUser())
    useDispatch(setUserInitialState({user, activeDomain: {id: domainId, name}}))
    localStorageHelper.setItem('activeDomainId', domainId)

    const headerToolbar = document.querySelector('#headerToolbar')
    this.headerToolbar = new DevExpress.ui.dxToolbar(headerToolbar, {
      items: [
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
          location: 'before',
          widget: 'dxButton',
          options: {
            type: 'back',
            icon: 'save',
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
            icon: 'repeat',
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
            icon: 'trash',
            hint: 'Delete file',
            onClick() {
              self.deleteFile()
            },
          },
        },
        {
          location: 'before',
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
        {
          location: 'before',
          widget: 'dxButton',
          locateInMenu: 'auto',
          options: {
            icon: 'edit',
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
            icon: 'collapse',
            hint: 'Fold the selected lines',
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
            icon: 'expand',
            hint: 'Unfold the selected lines',
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
            icon: 'increaseindent',
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
            icon: 'decreaseindent',
            hint: 'Uncomment out the selected lines',
            onClick() {
              self.removeCommentLine()
            },
          },
        },
        {
          location: 'after',
          locateInMenu: 'auto',
          widget: 'dxButton',
          options: {
            icon: `${localStorageHelper.getItem('openNav') === 'true' ? 'chevronright' : 'chevronleft'}`,
            hint: `${localStorageHelper.getItem('openNav') === 'true' ? 'Hide panel' : 'Show panel'}`,
            onClick() {
              if (localStorageHelper.getItem('openNav') === 'true') {
                localStorageHelper.setItem('openNav', 'false')
                document.querySelector('.aside-body').style.display = 'none'
                document.querySelector('.aside-header').style.display = 'none'
                document.querySelector('.resizable-left').style.width = '100%'
                document.querySelector('.resizable-right').style.right = '0px'
                document.querySelector('.resizable-right').style.width = '0px'
                document.querySelector('.resizable-right').style.removeProperty('left')
                document.querySelector('.resizer').style.display = 'none'
                this.option('icon', 'chevronleft')
                this.option('hint', 'Show Panel ')
                return
              }

              localStorageHelper.setItem('openNav', 'true')
              document.querySelector('.aside-body').style.display = 'flex'
              document.querySelector('.aside-header').style.display = 'flex'
              document.querySelector('.resizable-right').style.left = '896px'
              document.querySelector('.resizable-right').style.width = '400px'
              document.querySelector('.resizable-right').style.removeProperty('right')
              document.querySelector('.resizer').style.display = 'block'
              Resizable.activeContentWindows[0].changeSize(window.innerWidth, window.innerHeight - self.offsetHeight)
              Resizable.activeContentWindows[0].childrenResize()
              this.option('icon', 'chevronright')
              this.option('hint', 'Hide Panel ')
            },
          },
        },
        {
          location: 'after',
          widget: 'dxSelectBox',
          visible: user.domainList.length > 1,
          locateInMenu: 'auto',
          options: {
            width: 140,
            items: user.domainList,
            valueExpr: 'id',
            displayExpr: 'name',
            value: domainId,
            onValueChanged(_args) {
              const {id, name} = _args.component.option('selectedItem')
              useDispatch(setActiveDomain({id, name}))
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
                icon: 'user',
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
