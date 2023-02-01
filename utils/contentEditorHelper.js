import {useDispatch, useSelector} from '../store/index.js'
import FileGateService from '../services/fileGateService.js'
import SweetAlert2Helper from './sweetAlert2Helper.js'
import {setSelectedFile} from '../store/slices/content.js'
import EditorNavButton from '../components/editorNavButton/editorNavButton.js'
import ContentEditor from '../components/contentEditor/contentEditor.js'
import localStorageHelper from './localStorageHelper.js'
import SweetAlert2 from './sweetAlert2Helper.js'

class ContentEditorHelper {
  constructor() {
    this.solutionExplorer = document.querySelector('solution-explorer-component')
  }

  getContentEditorWithDataId(id) {
    return document.querySelector(`content-editor[data-id='${id}']`)
  }

  getNavButtonWithDataId(id) {
    return document.querySelector(`editor-nav-button[data-id='${id}']`)
  }

  getOpenedContentEditors() {
    return Array.from(document.querySelectorAll('content-editor'))
  }

  getOpenedNavButtons() {
    return Array.from(document.querySelectorAll('editor-nav-button'))
  }

  getActiveContentEditor() {
    const {id: selectedFile} = useSelector((state) => state.content.selectedFile)
    return document.querySelector(`content-editor[data-id='${selectedFile}']`)
  }

  getActiveNavButton() {
    const {id: selectedFile} = useSelector((state) => state.content.selectedFile)
    return document.querySelector(`editor-nav-button[data-id='${selectedFile}']`)
  }

  async saveFile() {
    const activeContentEditor = this.getActiveContentEditor()
    if (!activeContentEditor) return

    const {id} = activeContentEditor.state

    const newContent = activeContentEditor.getContent()

    const fileGateService = new FileGateService()
    const {data: updateResult} = await fileGateService.updateContent(id, newContent)

    if (!updateResult.success) {
      SweetAlert2Helper.toastFire({title: updateResult.error.message, icon: 'error'})
      return
    }

    SweetAlert2Helper.toastFire({title: updateResult.message})
    await this.solutionExplorer.treeListUpdateRow(updateResult.data)
  }

  async saveAllFiles() {
    const openedContentEditors = this.getOpenedContentEditors()
    if (openedContentEditors.length === 0) return

    const contents = []
    openedContentEditors.forEach((contentEditor) => {
      const value = {id: contentEditor.state.id, content: contentEditor.getContent()}
      contents.push(value)
    })

    const fileGateService = new FileGateService()
    const {data: result} = await fileGateService.updateAllContents(contents)

    SweetAlert2Helper.toastFire({title: result.message})
  }

  async deleteFile(_contentId) {
    const {isConfirmed} = await SweetAlert2Helper.confirmedSweet({text: 'Do you want to delete the file?', icon: 'warning'})
    if (!isConfirmed) return
    const fileGateService = new FileGateService()
    const {data: deletedItemResult} = await fileGateService.disableFile(_contentId)
    const contentEditor = this.getContentEditorWithDataId(_contentId)
    await this.solutionExplorer.treeListDeleteRow(_contentId)
    if (contentEditor) this.removeContent(_contentId)
    localStorageHelper.removeFromRecentlyFiles(_contentId)
    const fileEditor = document.querySelector('file-editor')
    fileEditor.getRecentlyOpenedFiles()
    fileEditor.openRecentlyFiles()
    SweetAlert2Helper.toastFire({title: deletedItemResult.message})
  }

  async loadContent(_contentId) {
    const fileGateService = new FileGateService()
    const {data: result} = await fileGateService.readFileById(_contentId)

    const {data} = result

    const {id, name, ufId, path, extension, content} = data
    localStorageHelper.addOpenedFile(_contentId)

    // ! Nav
    const editorNavButtons = document.querySelector('.file-editor-nav-buttons')
    editorNavButtons.classList.add('nav-tabs')

    const editorNavButton = new EditorNavButton({title: name || ufId || id, contentId: id, extension, data, path})
    editorNavButton.setAttribute('data-id', id)
    editorNavButtons.append(editorNavButton)

    // ! Editor
    const editor = new ContentEditor({id, extension, value: content})
    editor.setAttribute('data-id', id)
    const editors = document.querySelector('.file-content .editors')
    editors.append(editor)

    useDispatch(setSelectedFile(data))

    document.querySelector('.splashScreen').style.display = 'none'
  }

  async LoadContents(_contentIds) {
    for (const contentId of _contentIds) {
      await this.changeContent(contentId)
    }
  }

  async removeContent(_contentId) {
    const contentEditor = this.getContentEditorWithDataId(_contentId)
    const navButton = this.getNavButtonWithDataId(_contentId)

    if (!contentEditor || !navButton) return

    contentEditor.remove()
    navButton.remove()
    localStorageHelper.removeOpenedFile(_contentId)

    const openedContentEditors = this.getOpenedContentEditors()
    if (openedContentEditors.length > 0) {
      const activeContentEditor = this.getActiveContentEditor()
      if (!activeContentEditor) {
        const {
          state: {id},
        } = openedContentEditors.at(-1)

        await this.changeContent(id)
        const fileGateService = new FileGateService()
        const {data: result} = await fileGateService.readFileById(id)
        const {data} = result
        useDispatch(setSelectedFile(data))
      }

      return
    }

    useDispatch(setSelectedFile({}))
    document.querySelector('.file-editor-nav-buttons').classList.remove('nav-tabs')
    const fileEditor = document.querySelector('file-editor')
    fileEditor.getRecentlyOpenedFiles()
    fileEditor.openRecentlyFiles()
    document.querySelector('.splashScreen').style.display = 'block'
  }

  async changeContent(_contentId) {
    let incomingEditor
    const contentEditors = this.getOpenedContentEditors()
    const editorNavButtons = this.getOpenedNavButtons()

    contentEditors.forEach((editor) => {
      editor.classList.add('d-none')
      const editorId = editor.getAttribute('data-id')

      if (editorId === _contentId) {
        incomingEditor = _contentId
        editor.classList.remove('d-none')
      }
    })

    editorNavButtons.forEach((editorNavButton) => {
      const selectButton = editorNavButton.getSelectButton()
      selectButton.classList.remove('active')
      const selectButtonId = editorNavButton.getAttribute('data-id')
      if (selectButtonId === _contentId) {
        selectButton.classList.add('active')
      }
    })

    if (incomingEditor === _contentId) return
    await this.loadContent(_contentId)
  }

  changeFontSize(fontSize) {
    localStorageHelper.setItem('fontSize', fontSize)
    const contentEditors = this.getOpenedContentEditors()
    if (contentEditors.length > 0) {
      contentEditors.forEach(({state}) => {
        const contentEditor = document.querySelector(`content-editor[data-id='${state.id}']`)
        contentEditor.setFontSize(fontSize)
      })
    }
  }

  changeTheme(theme) {
    localStorageHelper.setItem('theme', theme)
    const devExtremeDarkTheme = document.querySelector('#devExtremeDarkTheme')
    const body = document.querySelector('body')

    if (theme === 'light') {
      devExtremeDarkTheme.setAttribute('href', '')
      body.classList.add(`bg-light`)
      body.classList.remove('bg-dark')
    } else {
      devExtremeDarkTheme.setAttribute('href', './vendor/devExtreme/css/dx.dark.css')
      body.classList.remove(`bg-light`)
      body.classList.add('bg-dark')
    }
    const contentEditors = this.getOpenedContentEditors()

    if (contentEditors.length > 0) {
      contentEditors.forEach(({state}) => {
        const contentEditor = document.querySelector(`content-editor[data-id='${state.id}']`)
        contentEditor.setTheme(theme)
      })
    }

    //     DARK_STYLE_LINK.setAttribute("href", DARK_THEME_PATH);
  }

  clearContent() {
    const contentEditors = this.getOpenedContentEditors()
    contentEditors.forEach((editor) => {
      editor.remove()
    })

    const editosNavButtons = this.getOpenedNavButtons()
    editosNavButtons.forEach((editorNavButton) => {
      editorNavButton.remove()
    })

    const fileEditorNavButtons = document.querySelector('.file-editor-nav-buttons')
    fileEditorNavButtons.classList.remove('nav-tabs')
    const fileEditor = document.querySelector('file-editor')
    fileEditor.getRecentlyOpenedFiles()
    fileEditor.openRecentlyFiles()
    document.querySelector('.splashScreen').style.display = 'block'

    useDispatch(setSelectedFile(null))
  }

  async copyPath(_contentId) {
    const {data: result} = await new FileGateService().readFileById(_contentId)
    const {success, message, data} = result

    if (!success) {
      SweetAlert2.toastFire({
        title: message,
      })
      return
    }

    const {id, ufId, domainId, objectType, extension} = data

    if (objectType === '0') return

    let path

    if (ufId) path = `${config.webServiceUrl}/${domainId}/${ufId}.${extension}`
    else path = `${config.webServiceUrl}/${domainId}/${id}.${extension}`

    this.copyTextToClipboard(path)
    SweetAlert2.toastFire({
      title: 'Copied',
    })
  }

  foldSelection() {
    this.getActiveContentEditor()?.foldSelection()
  }

  unFoldSelection() {
    this.getActiveContentEditor()?.unFoldSelection()
  }

  addCommentLine() {
    this.getActiveContentEditor()?.addCommentLine()
  }

  removeCommentLine() {
    this.getActiveContentEditor()?.removeCommentLine()
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

export default ContentEditorHelper
