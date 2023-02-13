import FileGateService from '../../services/fileGateService.js'
import {useDispatch, useSelector} from '../../store/index.js'
import SweetAlert2 from '../../utils/sweetAlert2Helper.js'
import mainConfig from './mainConfig.js'
class ContentEditor extends HTMLElement {
  constructor({id, extension, value = ''}) {
    super()
    this.state = {id, extension, value, editorContentChange: false}
    this.editor = null
    this.solutionExplorer = document.querySelector('solution-explorer-component')
    this.fileEditor = document.querySelector('file-editor')

    this.innerHTML = `
        <div class='monaco-container h-100 ' >
        <div id='delly-${this.state.id}'  class='monaco editor h-100 w-100' > </div>
        </div>
        `
  }

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
      theme: `vs-${theme}`,
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
    const theme = localStorage.getItem('theme') || 'light'
    const fontSize = localStorage.getItem('fontSize') || '7px'
    const container = document.querySelector(`#delly-${this.state.id}`)
    const {extension, value} = this.state
    const language = this.getExtensionLongName(extension)
    this.editor = monaco.editor.create(container, {
      value,
      language,
      theme: `vs-${theme}`,
      fontSize,
      ...mainConfig,
    })

    this.editor.getModel().onDidChangeContent((event) => {
      // console.log('editor change')
      const activeEditorNavButton = this.getChangedEditorNavButton(this.state.id)
      activeEditorNavButton.lastChild.style.display = 'inline-block'
      this.state.editorContentChange = true
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
    const foldAction = this.editor.getAction('editor.foldAll')
    foldAction.run()
  }

  unFoldSelection() {
    const unFoldAction = this.editor.getAction('editor.unfoldAll')
    unFoldAction.run()
  }

  addCommentLine() {
    if (!this.getSelectionText()) return
    const addCommentLineAction = this.editor.getAction('editor.action.addCommentLine')
    addCommentLineAction.run()
  }

  removeCommentLine() {
    if (!this.getSelectionText()) return
    const removeCommentLineAction = this.editor.getAction('editor.action.removeCommentLine')
    removeCommentLineAction.run()
  }
  formatDocument() {
    const formatDocumentAction = this.editor.getAction('editor.action.formatDocument')
    formatDocumentAction.run()
  }

  getSelectionText() {
    return this.editor.getModel().getValueInRange(this.editor.getSelection())
  }
  getChangedEditorNavButton(id) {
    return document.querySelector('#select-' + id)
  }
  connectedCallback() {
    this.createEditor()
  }

  disconnectedCallback() {}
}

window.customElements.define('content-editor', ContentEditor)
export default ContentEditor
