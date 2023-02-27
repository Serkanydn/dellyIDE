import {useSelector} from '../../store/index.js'
import ContentEditorHelper from '../contentEditorHelper.js'

class CustomTemplates {
  getTreeListCellTemplate(container, options, fileDraggable, isFilePreviewWithCtrlClick = false) {
    const {data} = options
    const {id, name, ufId, extension, objectType, domainId} = data
    // console.log(name)

    const title = name || ufId || id

    let smallTextContent = ufId
    if ((!name && !ufId) || name === ufId) smallTextContent = ''
    const template = `
        <div  class="d-flex tree-list-draggable-item">
            <img src="icon/${
              objectType === '1' ? extension : objectType === '0' ? 'folder' : 'web'
            }.svg" style="width:20px;objectFit:'cover'" class="img"/>
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

    if (fileDraggable && objectType === '1') {
      const draggable = element.querySelector('.tree-list-draggable-item')
      draggable.setAttribute('draggable', true)
      draggable.setAttribute('role', 'button')
      draggable.addEventListener('dragstart', (event) => {
        const {selectedFile} = useSelector((state) => state.content)

        const draggedFileDomain = selectedFile.domainId === data.domainId ? 'myspace' : data.domainId
        event.dataTransfer.setData(
          'text/plain',
          `const ${data.name || 'module1'} = require("${draggedFileDomain}/${data.ufId || data.id}");`
        )
      })
    }

    if (isFilePreviewWithCtrlClick && objectType === '1') {
      const fileItem = element.querySelector('.tree-list-draggable-item')
      fileItem.addEventListener('click', () => {
        if (!window.event.ctrlKey) return

        new ContentEditorHelper().setPreviewWindow(id, domainId)
      })
    }

    container.append(element)
  }
}

export default new CustomTemplates()
