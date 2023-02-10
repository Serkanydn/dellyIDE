import FileGateService from '../../services/fileGateService.js'
import {useDispatch, useSelector} from '../../store/index.js'
import {setSelectedFile} from '../../store/slices/content.js'
import SweetAlert2Helper from '../../utils/sweetAlert2Helper.js'
import ContentEditorHelper from '../../utils/contentEditorHelper.js'
class FileUpdateModal extends HTMLElement {
  constructor({id, parentId, name, objectType, ufId, refs, extension, domainName, domainId, version, path, files}) {
    super()
    this.state = {id, parentId, name, objectType, ufId, refs, extension, domainName, domainId, version, path, files}

    this.innerHTML = `

<div class="modal fade" id="fileModal" tabindex="-1" aria-labelledby="fileModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content w-75">
      <div class="modal-header">
        <h5 class="modal-title" id="fileModalLabel">File Update</h5>
        <button id="closeIcon" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

          <div class="modal-body">

         

          <div class="row  mb-2" ${this.state?.objectType !== '0' ? 'disabled' : ''} >
          <div class="col-md-12 d-flex" disabled>
             <label  class="form-control-label" for="">Type</label>
            <div  id="type"></div>
          </div>
          </div>

      

       <div id="fileIdGroup" class="col-md-12"  >
       <div  class="row mb-2">
         <label for="version" class="col-md-2 col-form-label ">Id</label>
          
         <div class="col-md-10">
           <div class="input-group input-group-sm">
           <div class="form-control" id="fileId" ></div>
           <div  class="input-group-text" id="fileIdCopyButton"></div>
           </div>
        </div>
     </div> 


      
    
        <div class="row mb-2">

          <label for="name" class="col-sm-2 col-form-label">File Name</label>
          <div class=${this.state?.objectType !== '0' ? 'col-md-7' : 'col-md-10'}>
            <div class="form-control form-control-sm" id="name" ></div>
          </div>

          <div id="extensionGroup" class="col-md-3" style="display:${this.state?.objectType !== '0' ? 'block' : 'none'}" >
            <div class="form-control form-control-sm" id="extension"></div>
          </div>

        </div>



        <div id="ufIdGroup" class="col-md-12" style="display:${this.state?.objectType !== '0' ? 'block' : 'none'}">
        <div  class="row mb-2">
          <label for="ufId" class="col-sm-2 col-form-label ">UF Id</label>
          <div class="col-md-10">
            <div class="form-control form-control-sm"  id="ufId" ></div>
          </div>
          </div> 

          </div>
      


           <div id="versionGroup" class="col-md-12" style="display:${this.state?.objectType !== '0' ? 'block' : 'none'}" >
        <div  class="row mb-2">
          <label for="version" class="col-sm-2 col-form-label ">Version</label>
          <div class="col-md-10">
            <div class="form-control form-control-sm"  id="version" ></div>
          </div>
      </div> 
     

        <div  class="row mb-2">
          <label for="parentId" class="col-sm-2 col-form-label ">Folder</label>
          <div class="col-md-10">
            <div class="form-control form-control-sm"  id="parentId" ></div>
          </div>
          </div>

      </div>

 

      <div class="modal-footer">
      <button id="closeBtn" class="btn btn-secondary shadow-none" data-bs-dismiss="modal" aria-label="Close">Close</button>
  
        <div id="updateBtn"></div>
      
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

  prepareForm() {
    const self = this

    const parentId = document.querySelector('#parentId')
    this.parentIdInstance = new DevExpress.ui.dxSelectBox(parentId, {
      dataSource: new DevExpress.data.ArrayStore({
        data: this.state?.files.data.filter(
          (file) => file.objectType === '0' && file.id !== this.state.id && file.parentId !== this.state.id
        ),
        key: 'id',
      }),
      placeholder: 'Parent Id',
      displayExpr(item) {
        if (item) return item.name || item.id
      },
      valueExpr: 'id',
      showClearButton: true,
      value: this.state?.parentId,
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
      value: self.state.extension,
    })

    const type = document.querySelector('#type')
    const fileTypes = [
      {id: '0', text: 'Folder'},
      {id: '1', text: 'File'},
    ]
    this.typeInstance = new DevExpress.ui.dxRadioGroup(type, {
      items: fileTypes,
      value: self.state.objectType,
      layout: 'horizontal',
      displayExpr: 'text',
      valueExpr: 'id',
      disabled: true,
    })

    const fileId = document.querySelector('#fileId')
    this.fileIdInstance = new DevExpress.ui.dxTextBox(fileId, {
      value: this.state?.id,
      disabled: true,
    })

    const fileIdCopyButton = document.querySelector('#fileIdCopyButton')
    this.fileIdCopyButtonInstance = new DevExpress.ui.dxButton(fileIdCopyButton, {
      // width: 50,
      icon: 'copy',
      hint: 'Copy Id',
      // width: 120,
      onClick() {
        new ContentEditorHelper().copyTextToClipboard(self.state.id)
        SweetAlert2Helper.toastFire({title: 'Id Copied', icon: 'success'})
      },
    })

    const ufId = document.querySelector('#ufId')
    this.ufIdInstance = new DevExpress.ui.dxTextBox(ufId, {
      value: this.state?.ufId?.replace(`${this.state.domainName}/`, ''),
    })

    const name = document.querySelector('#name')
    this.nameInstance = new DevExpress.ui.dxTextBox(name, {
      value: this.state?.name,
      onFocusOut(e) {
        self.ufIdInstance.option('value', e.component.option('value'))
      },
    })

    // new DevExpress.ui.dxValidator(name, {
    //   validationRules: [
    //     {
    //       type: 'required',
    //       message: 'Filename field is required.',
    //     },
    //   ],
    // })

    const version = document.querySelector('#version')

    this.versionInstance = new DevExpress.ui.dxTextBox(version, {
      value: this.state?.version,
    })

    const updateBtn = document.querySelector('#updateBtn')
    new DevExpress.ui.dxButton(updateBtn, {
      text: 'Update',
      type: 'success',
      autoPostback: true,
      onClick: (event) => {
        this.update()
      },
    })
  }

  async update() {
    const solutionExplorer = document.querySelector('solution-explorer-component')

    const parentId = this.parentIdInstance.option('value')
    const objectType = this.typeInstance.option('value')
    const name = this.nameInstance.option('value')
    const ufId = this.ufIdInstance.option('value')
    const extension = this.extensionInstance.option('value')
    const version = this.versionInstance.option('value')

    const {domainId} = this.state

    const object = {
      id: this.state?.id,
      ufId: ufId || '',
      parentId,
      objectType,
      extension,
      name,
      domainId,
      version,
    }

    const fileGateService = new FileGateService()
    const {data: result} = await fileGateService.update(object)

    if (!result.success) {
      SweetAlert2Helper.toastFire({title: result.error.message, icon: 'error'})
      return
    }
    const editorNavButton = document.querySelector(`editor-nav-button[data-id="${this.state?.id}"`)
    if (editorNavButton) {
      editorNavButton.setAttribute('data-parentId', parentId)
    }

    this.close()

    const {id: selectedFileId} = useSelector((state) => state.content.selectedFile)

    const updatedFile = result.data

    // ! Dosya güncellenince ismi contente yansısın diye.

    // * Folder
    if (updatedFile.objectType === '0') {
      const editorNavButtons = Array.from(document.querySelectorAll(`editor-nav-button[data-parentId="${updatedFile.id}"`))
      editorNavButtons.forEach((editorNavButton) => {
        // if (!editorNavButton.state.path.includes(updatedFile.path)) {
        const selectButton = editorNavButton.querySelector('[id^="select"]')
        selectButton.title = `${updatedFile.path}/${editorNavButton.state.title}`
        // }
      })
    }

    // * File
    if (updatedFile.objectType === '1') {
      const editorNavButton = document.querySelector(`editor-nav-button[data-id="${this.state?.id}"`)
      if (editorNavButton) {
        const oldBtnTitle = `${editorNavButton.state.title}.${editorNavButton.state.extension}`
        const newBtnTitle = `${updatedFile.name || updatedFile.ufId || updatedFile.id}.${updatedFile.extension}`
        if (
          oldBtnTitle !== newBtnTitle ||
          editorNavButton.state.ufId !== updatedFile.ufId ||
          editorNavButton.state.path !== updatedFile.path
        ) {
          const selectButton = editorNavButton.querySelector(`#select-${this.state?.id}`)
          selectButton.innerText = newBtnTitle
          selectButton.title = updatedFile.path
          editorNavButton.state.path = updatedFile.path
          editorNavButton.state.data = updatedFile
          if (selectedFileId === updatedFile.id) useDispatch(setSelectedFile(updatedFile))
        }
      }
    }

    SweetAlert2Helper.toastFire({title: result.message})
    solutionExplorer.refreshTreeList()
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

  async connectedCallback() {
    const self = this

    this.closeBtn = document.querySelector('#closeBtn')
    this.closeIcon = document.querySelector('#closeIcon')

    this.closeBtn.addEventListener('click', () => this.close())
    this.closeIcon.addEventListener('click', () => this.close())

    this.prepareForm()
  }

  disconnectedCallback() {
    DevExpress.validationEngine.removeGroup()
  }
}

window.customElements.define('file-update-modal', FileUpdateModal)
export default FileUpdateModal
