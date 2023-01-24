import Aside from '../aside/aside.js'
import FileGateService from '../../services/fileGateService.js'
import localStorageHelper from '../../utils/localStorageHelper.js'
import {useDispatch, useSelector, useSubscribe} from '../../store/index.js'
import ContentEditorHelper from '../../utils/contentEditorHelper.js'
import {setSelectedFile} from '../../store/slices/content.js'

class FileEditor extends HTMLElement {
  constructor(state) {
    super(state)

    this.innerHTML = `
 
        <div  class='file-body ' id="main">
            <div class='resizable-left file-content' id='win1' >
                <div class="file-editor-nav-buttons w-100 nav  "></div>

                <div class="splashScreen">
                      <div class="companyName">
                          <a href="#">  <span> Delly</span>Editor </a>
                      </div>
                      <div class="welcomeText">
                      <h4>Recently Files</h4>
                    </div>
                    <div class="welcomeDesc">
                      <div class="recentlyOpenedFiles">
                      </div>
                    </div>
                </div>
                <div class="editors"></div>
            </div>
            <div class="resizable-right" id="win2">
                <div class="file-menu"></div>
            </div>
      </div>
    `
  }

  async preparingLayouts() {
    const fileMenu = document.querySelector('.file-menu')

    const asideComponent = new Aside()
    fileMenu.appendChild(asideComponent)

    // ? Store Subscribe
    useSubscribe('content.selectedFile', async (selectedFile) => {
      if (selectedFile.objectType === '1') {
        await new ContentEditorHelper().changeContent(selectedFile.id)
      }
    })

    document.addEventListener('keydown', this.ctrlSaveEvent)

    const openedFiles = localStorageHelper.getOpenedFiles()

    if (openedFiles.length > 0) {
      await new ContentEditorHelper().LoadContents(openedFiles)
      const fileGateService = new FileGateService()
      const {data: file} = await fileGateService.readFileById(openedFiles.pop())
      useDispatch(setSelectedFile(file))
    }
  }

  async ctrlSaveEvent(event) {
    const {id: selectedFileId} = useSelector((state) => state.content.selectedFile)
    if (!selectedFileId) return
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()
      const contentEditorHelper = new ContentEditorHelper()
      await contentEditorHelper.saveFile()
    }
  }

  preparingResizable() {
    const header = document.querySelector('header-component')
    const height = window.innerHeight - 60
    document.getElementById('main').style.width = `${window.innerWidth}px`
    document.getElementById('main').style.height = `${height}px`
    const sizes = {
      win1: localStorageHelper.getItem('resWrap1') || '0.7',
      win2: localStorageHelper.getItem('resWrap2') || '0.3',
    }
    Resizable.initialise('main', sizes)

    Resizable.resizingEnded = () => {
      const resWrap1 = `${Resizable.activeContentWindows[0].children[0].width / window.innerWidth}`
      const resWrap2 = `${Resizable.activeContentWindows[0].children[1].width / window.innerWidth}`
      localStorageHelper.setItem('resWrap1', resWrap1)
      localStorageHelper.setItem('resWrap2', resWrap2)
    }
  }

  async connectedCallback() {
    this.preparingResizable()
    this.preparingLayouts()
    this.getRecentlyOpenedFiles()
    this.openRecentlyFiles()

    window.addEventListener('resize', (event) => {
      event.stopPropagation()
      this.resizeControl()
    })
  }

  getRecentlyOpenedFiles() {
    var files = JSON.parse(localStorageHelper.getItem('recentlyOpenedFiles'))
    const recentlyOpenedFiles = document.querySelector('.recentlyOpenedFiles')
    var items = ''

    if (!files) return

    files.reverse()
    files.map(function (element) {
      items += `<li> <a href='#' class="openRecent" data-id="${element.id}" > ${element.name} </a></li>`
    })
    recentlyOpenedFiles.innerHTML = items
  }
  openRecentlyFiles() {
    var file = document.querySelectorAll('.openRecent')
    file.forEach((item) => {
      item.addEventListener('click', function handleClick(event) {
        new ContentEditorHelper().loadContent(event.target.getAttribute('data-id'))
      })
    })
  }
  resizeControl() {
    const header = document.querySelector('header-component')
    const {id: selectedFileId} = useSelector((state) => state.content.selectedFile)

    if (selectedFileId) {
      const contentEditor = document.querySelector(`content-editor[data-id='${selectedFileId}']`)
      contentEditor.setLayout()
    }

    if (localStorageHelper.getItem('openNav') === 'true') {
      localStorageHelper.setItem('resWrap1', localStorageHelper.getItem('resWrap1') || '0.7')
      localStorageHelper.setItem('resWrap2', localStorageHelper.getItem('resWrap2') || '0.3')
      document.querySelector('.aside-body').style.display = 'flex'
      document.querySelector('.aside-header').style.display = 'flex'
      document.querySelector('.resizable-right').style.left = '896px'
      document.querySelector('.resizable-right').style.width = '400px'
      document.querySelector('.resizable-right').style.removeProperty('right')
      document.querySelector('.resizer').style.display = 'block'

      Resizable.activeContentWindows[0].changeSize(window.innerWidth, window.innerHeight - header.offsetHeight)
      Resizable.activeContentWindows[0].childrenResize()
    }
    if (localStorageHelper.getItem('openNav') === 'false') {
      // localStorageHelper.setItem('openNav', '0')

      Resizable.activeContentWindows[0].changeSize(window.innerWidth, window.innerHeight - header.offsetHeight)
      Resizable.activeContentWindows[0].childrenResize()
      document.querySelector('.aside-body').style.display = 'none'
      document.querySelector('.aside-header').style.display = 'none'
      document.querySelector('.resizable-left').style.width = '100%'
      document.querySelector('.resizable-right').style.right = '0px'
      document.querySelector('.resizable-right').style.width = '0px'
      document.querySelector('.resizable-right').style.removeProperty('left')
      document.querySelector('.resizer').style.display = 'none'
    }
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.ctrlSaveEvent)
  }
}

window.customElements.define('file-editor', FileEditor)
export default FileEditor
