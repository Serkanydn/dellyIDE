import FileGateService from '../../services/fileGateService.js'
import SweetAlert2Helper from '../../utils/sweetAlert2Helper.js'
import {useDispatch, useSelector, useSubscribe} from '../../store/index.js'
import {setSelectedFile} from '../../store/slices/content.js'

class FileAddModal extends HTMLElement {
  constructor() {
    super()
    this.innerHTML = `
   
<div  class="modal fade" id="fileModal" tabindex="-1" aria-labelledby="fileModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">

    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="fileModalLabel">File Add</h5>
        <button id="closeIcon" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      
      <div class="modal-body">
         <div class="row  mb-2">
            <div class="col-md-12 d-flex" disabled>
               <label  class="form-label" for="">Type</label>
              <div id="type"></div>
            </div>
         </div>

    
        <div class="row mb-2">
          <label for="name" class="col-sm-2 col-form-label col-form-label-sm">Filename</label>
          <div class="col-md-7 ">
            <div id="name" ></div>
          </div>
      
          <div id="extensionGroup" class="col-md-3" >
            <div id="extension"></div>
          </div>
        </div>

        <div id="ufIdGroup">
        <div  class="row mb-2">
          <label for="ufId" class="col-sm-2 col-form-label col-form-label-sm">UF Id</label>
          <div class="col-md-10">
            <div  id="ufId" ></div>
          </div>
        </div>

        </div>

        <div class="row mb-2">
          <label for="parentId" class="col-sm-2 col-form-label col-form-label-sm">Folder</label>
          <div class="col-md-10">
            <div  id="parentId" ></div>
          </div>
        </div>

  
    
      

      <div class="modal-footer">
         <button id="closeBtn" class="btn btn-secondary shadow-none" data-bs-dismiss="modal" aria-label="Close">Close</button>
     
         <div id="addBtn" ></div>
      
      </div>
    </div>
    </div>
  </div>
</div>

        `

    this.modal = null
    this.parentIdInstance = null
    this.extensionInstance = null
    this.typeInstance = null
    this.nameInstance = null
    this.ufIdInstance = null
  }

  open() {
    this.modal = new window.bootstrap.Modal(document.getElementById('fileModal'), {
      backdrop: 'static',
      keyboard: false,
    })
    this.modal.show()
  }

  close() {
    this.modal.hide()

    setTimeout(() => {
      document.body.removeChild(this)
    }, 100)
  }

  async prepareForm() {
    const self = this

    const fileGateService = new FileGateService()
    const {user, content} = useSelector((state) => state)
    const {data: files} = await fileGateService.readAllFilesWithDomainId(user.activeDomain.id)

    const {id: selectedFolderId, name, objectType: selectedFolderObjectType} = content.selectedFolder

    // let name, ufId, id;
    //  if(file.selectedItem) {
    //   {name,ufId,id}=file.selectedItem
    //  }

    const parentId = document.querySelector('#parentId')
    this.parentIdInstance = new DevExpress.ui.dxSelectBox(parentId, {
      dataSource: new DevExpress.data.ArrayStore({
        data: files.length > 0 && files.filter((file) => file.objectType === '0'),
        key: 'id',
      }),
      placeholder: 'Parent Id',
      displayExpr: 'name',
      valueExpr: 'id',
      showClearButton: true,
      value: selectedFolderObjectType && selectedFolderId && selectedFolderId,
    })

    const extension = document.querySelector('#extension')
    this.extensionInstance = new DevExpress.ui.dxSelectBox(extension, {
      dataSource: new DevExpress.data.ArrayStore({
        data: [
          {id: 'js', value: '.js'},
          {id: 'json', value: '.json'},
          {id: 'css', value: '.css'},
        ],
        key: 'id',
      }),
      placeholder: 'File Extension',
      displayExpr: 'value',
      valueExpr: 'id',
      value: 'js',
    })

    const type = document.querySelector('#type')
    const fileTypes = [
      {id: '0', text: 'Folder'},
      {id: '1', text: 'File'},
    ]
    this.typeInstance = new DevExpress.ui.dxRadioGroup(type, {
      items: fileTypes,
      value: fileTypes[1].id,
      layout: 'horizontal',
      displayExpr: 'text',
      valueExpr: 'id',
      onValueChanged(data) {
        if (data.value === '0') {
          document.querySelector('#name').parentElement.classList.remove('col-md-7')
          document.querySelector('#name').parentElement.classList.add('col-md-10')
          document.querySelector('#ufIdGroup').style.display = 'none'
          document.querySelector('#extensionGroup').style.display = 'none'
        } else {
          document.querySelector('#name').parentElement.classList.remove('col-md-10')
          document.querySelector('#name').parentElement.classList.add('col-md-7')
          document.querySelector('#ufIdGroup').style.display = 'block'
          document.querySelector('#extensionGroup').style.display = 'block'
        }
      },
    })

    const ufIdDiv = document.querySelector('#ufId')

    this.ufIdInstance = new DevExpress.ui.dxTextBox(ufIdDiv, {
      value: '',
    })
    const nameDiv = document.querySelector('#name')

    this.nameInstance = new DevExpress.ui.dxTextBox(nameDiv, {
      value: '',
      onFocusOut(e) {
        self.ufIdInstance.option('value', e.component.option('value'))
      },
    })

    const addBtn = document.querySelector('#addBtn')
    new DevExpress.ui.dxButton(addBtn, {
      text: 'Add',
      type: 'success',
      autoPostback: true,
      onClick: (event) => {
        // const {isValid} = event.validationGroup.validate()

        // if (!isValid) return

        this.create()
      },
    })
  }

  async create() {
    const solutionExplorer = document.querySelector('solution-explorer-component')

    const parentId = this.parentIdInstance.option('value')
    const objectType = this.typeInstance.option('value')
    const name = this.nameInstance.option('value')
    let ufId = this.ufIdInstance.option('value')
    let extension = this.extensionInstance.option('value')

    const {id: domainId} = useSelector((state) => state.user.activeDomain)
    if (objectType === '0') {
      extension = null
      ufId = null
    }

    const fileGateService = new FileGateService()
    const {data: result} = await fileGateService.addFile({
      parentId: parentId || null,
      ufId: ufId || '',
      objectType,
      name,
      extension,
      domainId,
    })

    if (!result.success) {
      SweetAlert2Helper.toastFire({title: result.error.message, icon: 'error'})
      return
    }

    this.close()

    useDispatch(setSelectedFile(result.data))
    await solutionExplorer.treeListAddRow(result.data)

    SweetAlert2Helper.toastFire({title: result.message})
  }

  removeRegisteredValidator(validator) {
    DevExpress.validationEngine.getGroupConfig().removeRegisteredValidator(validator)
  }

  registerValidator(validator) {
    DevExpress.validationEngine.getGroupConfig().registerValidator(validator)
  }

  resetValidatorGroup() {
    DevExpress.validationEngine.resetGroup()
  }

  connectedCallback() {
    const self = this
    const closeBtn = document.querySelector('#closeBtn')
    const closeIcon = document.querySelector('#closeIcon')
    // const nameButton = document.querySelector('#closeIcon')

    closeBtn.addEventListener('click', () => this.close())
    closeIcon.addEventListener('click', () => this.close())

    this.prepareForm()
  }

  disconnectedCallback() {
    DevExpress.validationEngine.removeGroup()
  }
}

window.customElements.define('file-add-modal-component', FileAddModal)
export default FileAddModal
