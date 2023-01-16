import FileGateService from '../../services/fileGateService.js'
import {useDispatch, useSelector} from '../../store/index.js'
import SweetAlert2 from '../../utils/sweetAlert2Helper.js'
import mainConfig from './mainConfig.js'
class ContentEditor extends HTMLElement {
  constructor({id, extension, value = ''}) {
    super()
    this.state = {id, extension, value}
    this.editor = null
    this.solutionExplorer = document.querySelector('solution-explorer-component')
    this.fileEditor = document.querySelector('file-editor')
    //this.asideComponent = document.querySelector('aside-component')
    //this.selectedDomain = null
    // <button id="updateVersion-${this.state.id}" class="btn btn-warning text-white"> <i class="bi bi-pencil-fill" style="font-size:14px"> </i> Version Update</button>

    this.innerHTML = `

        <div class='monaco-container d-flex flex-column h-100' >
        <div id='delly-${this.state.id}'  class='monaco editor' > </div>
        </div>



        `
  }

  //   <div id="monaco-editor-footer" class="d-flex justify-content-between align-items-center gap-2 p-2 border-top ">
  //   <div class="editArea">
  //     <button id="update-${this.state.id}" class="btn btn-secondary"> <i class="bi bi-pencil-fill" style="font-size:14px"> </i> Edit</button>
  //   </div>
  //   <div class="fileActionArea">
  //     <button id="save-${this.state.id}" class="btn btn-success"> <i class="bi bi-save"  style="font-size:14px"> </i> Save</button>
  //     <button id="delete-${this.state.id}" class="btn btn-danger"> <i class="bi bi-trash" style="font-size:14px"> </i> Delete</button>
  //   </div>

  // </div>
  // </div>
  setLayout() {
    this.editor.layout({})
  }

  setContent(_content = '') {
    this.editor.setValue(_content)
  }

  getContent() {
    return this.editor.getValue()
    // JSON.stringify(this.editor.getValue(), null, 4)
  }

  setTheme(theme) {
    this.editor.updateOptions({
      theme,
    })
    // this.editor._themeService.setTheme(theme)
  }
  setFontSize(fontSize) {
    this.editor.updateOptions({
      fontSize,
    })
  }

  getLanguage() {
    return this.editor._configuration._rawOptions.language
  }

  createEditor() {
    const theme = localStorage.getItem('theme') || 'vs-light'
    const fontSize = localStorage.getItem('fontSize') || '7px'
    // console.log(mainConfig)
    const container = document.querySelector(`#delly-${this.state.id}`)
    const {extension, value} = this.state
    const language = this.getExtensionLongName(extension)

    this.editor = monaco.editor.create(container, {
      value,
      language,
      theme,
      fontSize,
      ...mainConfig,
    })

    //this.editor.layout({width: '100%', height: '100%'})

    // this.editor.updateOptions({
    //   minimap: {
    //     enabled: true,
    //   },
    // })
  }

  getExtensionLongName(extension) {
    const names = {
      js: 'javascript',
      css: 'css',
      json: 'json',
      jsx: 'jsx',
    }

    return names[extension]
  }

  async updateFileVersion() {
    const {isConfirmed} = await SweetAlert2.confirmedSweet({text: 'Do you want to update version this file?', icon: 'warning'})
    if (!isConfirmed) return
    const {editor} = this.fileEditor.getContent(this.state.id)

    const newContent = editor.getContent()

    const fileGateService = new FileGateService()
    const {data: updateResult} = await fileGateService.versionUpdate(this.state.id, newContent)
    if (!updateResult.success) {
      SweetAlert2.toastFire({title: updateResult.error.message, icon: 'error'})
      return
    }
    SweetAlert2.toastFire({title: updateResult.message})
  }

  foldSelection() {
    const foldAction = this.editor.getAction('editor.fold')
    foldAction.run()
  }

  unFoldSelection() {
    const unFoldAction = this.editor.getAction('editor.unfold')
    unFoldAction.run()
  }

  addCommentLine() {
    const addCommentLineAction = this.editor.getAction('editor.action.addCommentLine')
    addCommentLineAction.run()
  }

  removeCommentLine() {
    const removeCommentLineAction = this.editor.getAction('editor.action.removeCommentLine')
    removeCommentLineAction.run()
  }

  connectedCallback() {
    this.createEditor()
  }

  disconnectedCallback() {}
}

window.customElements.define('content-editor', ContentEditor)
export default ContentEditor
