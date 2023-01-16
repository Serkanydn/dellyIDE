import FileGateService from '../../services/fileGateService.js'

class Modal extends HTMLElement {
  constructor(state) {
    super()
    this.state = state
    this.innerHTML = `
<div class="modal fade" id="fileModal" tabindex="-1" aria-labelledby="fileModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="fileModalLabel">Modal title</h5>
        <button id="closeIcon" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <div class="row  mb-2">

          <div class="col-md-6"">
            <label  class="form-label" for="parentId">Parent Id</label>
            <div id="parentId" ></div>
          </div>
    
          <div class="col-md-6"">
            <label  class="form-label" for="">Tip</label>
            <div id="type" ></div>
          </div>
        </div>

        <div class="row mb-2">
          <div class="col-md-6">
            <label for="name" class="form-label">Ad</label>
            <div id="name"></div>
          </div>

     
          <div id="ufIdGroup" class="col-md-6" style="display:${
            this.state?.modalType === 'update' ? (this.state?.fileData?.objectType !== 'folder' ? 'block' : 'none') : 'block'
          }">
            <label for="ufId" class="form-label">User Friendly Name</label>
            <div id="ufId" ></div>
          </div> 
           

        </div>
  
        <div  id="extendsGroup" class="  mb-2" style="display:${
          this.state?.modalType === 'update' ? (this.state?.fileData?.objectType !== 'folder' ? 'block' : 'none') : 'block'
        }">
          <label for="">Referanslar</label>
          <div id="extends"></div>
        </div>

      </div>

      <div class="modal-footer">
      <button id="closeBtn" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Kapat</button>
      ${
        this.state?.modalType === 'add'
          ? '<button id="addBtn" class="btn btn-primary">Ekle</button>'
          : '<button id="addBtn" class="btn btn-primary">Güncelle</button>'
      }
      </div>
    </div>
  </div>
</div>

        `
  }

  open() {
    this.fileModal.show()
  }

  close() {
    this.fileModal.hide()

    setTimeout(() => {
      document.body.removeChild(this)
    }, 100)
  }

  async save() {
    const solutionExplorer = document.querySelector('solution-explorer-component')

    const parentId = this.parentIdInstance.option('value')
    const objectType = this.typeInstance.option('value')
    const name = this.nameInstance.option('value')
    const ufId = this.ufIdInstance.option('value')
    const refs = this.refsInstance.option('value').map((file) => (typeof file === 'string' ? file : file.id))

    const self = this
    let result = {}
    const fileGateService = new FileGateService()
    if (this.state.modalType === 'update') {
      result = await fileGateService.update({
        id: this.state?.fileData.id,
        parentId,
        objectType,
        name,
        ufId: ufId || null,
        extends: refs,
        content: self.state?.fileData.content,
      })

      const files = await fileGateService.readAllFiles()
      solutionExplorer.setTreelistItems(files)
      solutionExplorer.onSelectedTreeItemChanged(result.updatedData)
      this.close()

      return
    }

    result = await fileGateService.addFile({
      objectType,
      parentId,
      name,
      ufId: ufId || null,
      extends: refs,
      content: '',
    })

    const files = await fileGateService.readAllFiles()

    solutionExplorer.setTreelistItems(files)
    solutionExplorer.onSelectedTreeItemChanged(result.updatedData)
    this.close()
  }

  async connectedCallback() {
    this.modal = document.querySelector('.modal')

    this.addBtn = document.querySelector('#addBtn')
    this.updateBtn = document.querySelector('#updateBtn')
    this.closeBtn = document.querySelector('#closeBtn')
    this.closeIcon = document.querySelector('#closeIcon')

    this.addBtn?.addEventListener('click', () => this.save())
    this.updateBtn?.addEventListener('click', () => this.save())
    this.closeBtn.addEventListener('click', () => this.close())
    this.closeIcon.addEventListener('click', () => this.close())

    const parentId = document.querySelector('#parentId')
    const type = document.querySelector('#type')
    const name = document.querySelector('#name')
    const ufId = document.querySelector('#ufId')
    const refs = document.querySelector('#extends')

    this.parentIdInstance = new DevExpress.ui.dxSelectBox(parentId, {
      dataSource: new DevExpress.data.ArrayStore({
        data: this.state?.files.filter((file) => file.objectType === 'folder'),
        key: 'id',
      }),
      placeholder: 'Parent Id',
      displayExpr: 'name',
      valueExpr: 'id',
      value: this.state?.fileData?.objectType === 'folder' && this.state.modalType === 'add' ? this.state?.fileData?.id : null,
    })

    this.typeInstance = new DevExpress.ui.dxSelectBox(type, {
      items: ['file', 'folder'],
      placeholder: 'Tip',
      value: this.state?.modalType === 'update' && this.state?.fileData?.id ? this.state.fileData.objectType : 'file',
      onValueChanged(data) {
        if (data.value === 'folder') {
          document.querySelector('#ufIdGroup').style.display = 'none'
          document.querySelector('#extendsGroup').style.display = 'none'
        } else {
          document.querySelector('#ufIdGroup').style.display = 'block'
          document.querySelector('#extendsGroup').style.display = 'block'
        }
      },
    })

    this.nameInstance = new DevExpress.ui.dxTextBox(name, {
      value: this.state?.modalType === 'update' && this.state?.fileData?.name,
    })

    this.ufIdInstance = new DevExpress.ui.dxTextBox(ufId, {
      value: this.state?.modalType === 'update' && this.state?.fileData?.ufId,
    })

    this.refsInstance = new DevExpress.ui.dxTagBox(refs, {
      dataSource: new DevExpress.data.ArrayStore({
        data: this.state?.files.filter((file) => file.objectType === 'file'),
        key: 'id',
      }),
      displayExpr: 'name',
      valueExpre: 'id',
      value: this.state?.fileData && this.state?.fileData.extends ? [...this.state.fileData.extends] : [],
    })

    this.fileModal = new window.bootstrap.Modal(document.getElementById('fileModal'), {
      keyboard: false,
    })

    // if (this.state?.fileData?.objectType === 'folder') {
    //   document.querySelector('#ufIdGroup').style.display = 'none'
    //   document.querySelector('#extendsGroup').style.display = 'none'
    // }

    const modalToggle = new CustomEvent('modalToggle', {
      detail: {fileModal: this.fileModal},
    })
    this.dispatchEvent(modalToggle)
  }

  disconnectedCallback() {
    this.addBtn?.removeEventListener('click', this.save)
    this.updateBtn?.removeEventListener('click', this.save)
    this.closeBtn.removeEventListener('click', this.close)
    this.closeIcon.removeEventListener('click', this.close)
  }
}

window.customElements.define('modal-component', Modal)
export default Modal
