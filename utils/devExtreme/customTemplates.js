import {useSelector} from '../../store/index.js'

class CustomTemplates {
  getTreeListCellTemplate(container, options, fileDraggable) {
    const {data} = options
    const {id, name, ufId, extension, objectType} = data
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
        // event.dataTransfer.setData('text/plain', `"@@include myspace/${data.ufId || data.id}@@"`)
        const {domainId} = useSelector((state) => state.user.activeUser)
        console.log(domainId.length > 1)
        const isMultipleDomain = domainId.length > 1
        event.dataTransfer.setData(
          'text/plain',
          `const ${data.name || 'module1'} = require("${isMultipleDomain ? data.domainId : 'myspace'}/${data.ufId || data.id}");`
        )
      })
    }

    container.append(element)
  }
}

export default new CustomTemplates()
