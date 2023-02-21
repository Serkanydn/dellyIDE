import FileGateService from '../../services/fileGateService.js'
import SweetAlert2Helper from '../../utils/sweetAlert2Helper.js'
import {useDispatch, useSelector, useSubscribe} from '../../store/index.js'
import {setSelectedFile, setSelectedFolder} from '../../store/slices/content.js'
import devExtremeHelper from '../../utils/devExtreme/devExtremeHelper.js'
import customTemplates from '../../utils/devExtreme/customTemplates.js'
import BaseModal from './baseModal.js'

const modalBody = `<div class="row  mb-2">
<div class="col-md-12 d-flex" disabled>
   <label  class="form-label" for="">Type</label>
  <div id="type" class="ml-1"></div>
</div>
</div>


<div class="row mb-2">
<label for="name" class="col-sm-2 col-form-label ">Filename</label>
<div class="col-md-7 ">
<div class="form-control form-control-sm" id="name" ></div>
</div>

<div id="extensionGroup" class="col-md-3" >
<div class="form-control form-control-sm" id="extension"></div>
</div>
</div>

<div id="ufIdGroup">
<div  class="row mb-2">
<label for="ufId" class="col-sm-2 col-form-label ">UF Id</label>
<div class="col-md-10">
<div class="form-control form-control-sm" id="ufId" ></div>
</div>
</div>

</div>

<div class="row mb-2">
<label for="parentId" class="col-sm-2 col-form-label ">Folder</label>
<div class="col-md-10">
<div class="form-control form-control-sm" id="parentId" ></div>
</div>
</div>`

const modalFooter = `<div id="addBtn" ></div>`
class FileAddModal extends BaseModal {
  constructor() {
    super({body: modalBody, footer: modalFooter, title: 'File Add'})

    this.parentIdInstance = null
    this.extensionInstance = null
    this.typeInstance = null
    this.nameInstance = null
    this.ufIdInstance = null
    this.selectedDomainId = null
  }

  async prepareForm() {
    const self = this

    const fileGateService = new FileGateService()
    const {user, content} = useSelector((state) => state)
    const {data: files} = await fileGateService.readAllFilesWithDomainId({
      domainIds: user.activeUser.domainId,
      sortBy: 'name',
      sortDesc: 'asc',
    })
    const {id: selectedFolderId, name, objectType: selectedFolderObjectType, domainId} = content.selectedFolder

    self.selectedDomainId = domainId

    const parentId = document.querySelector('#parentId')

    this.parentIdInstance = new DevExpress.ui.dxDropDownBox(parentId, {
      value: (selectedFolderObjectType === '0' || selectedFolderObjectType === '2') && selectedFolderId ? selectedFolderId : null,
      displayExpr(item) {
        if (item) return item.name || item.id
      },
      valueExpr: 'id',
      validationMessagePosition: 'left',
      placeholder: 'Select a value...',
      showClearButton: false,
      dataSource: files.length > 0 && files.filter((file) => file.objectType === '0' || file.objectType === '2'),
      contentTemplate(contentTemplateEvent) {
        const value = contentTemplateEvent.component.option('value')
        const div = document.createElement('div')

        self.treeListInstance = new DevExpress.ui.dxTreeList(div, {
          dataSource: contentTemplateEvent.component.getDataSource(),
          rootValue: null,
          keyExpr: 'id',
          parentIdExpr: 'parentId',
          readOnly: false,
          highlightChanges: true,
          showRowLines: true,
          showBorders: false,
          height: '100%',
          selection: {
            mode: 'single',
            recursive: false,
          },
          filterRow: {
            visible: true,
          },
          showColumnHeaders: false,
          selectedRowKeys: [value],
          columns: [
            {
              dataField: 'name',
              caption: 'File Name',
              cellTemplate(container, options) {
                customTemplates.getTreeListCellTemplate(container, options, false)
              },
            },
          ],
          displayExpr(item) {
            if (item) return item.name || item.id
          },
          onRowClick({data, component}) {
            const selectedKeys = component.option('selectedRowKeys')
            contentTemplateEvent.component.option('value', selectedKeys[0])
            if (data.objectType === '2') {
              self.selectedDomainId = data.domainId
              return
            }
          },
        })

        contentTemplateEvent.component.on('valueChanged', (args) => {
          if (!args.value) return
          contentTemplateEvent.component.close()
        })

        return self.treeListInstance.element()
      },
    })

    const parentIdValidator = new DevExpress.ui.dxValidator(parentId, {
      validationRules: [
        {
          type: 'required',
          message: 'Folder is required',
          validationMessagePosition: 'left',
        },
      ],
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
        if (self.ufIdInstance.option('value') === '') self.ufIdInstance.option('value', e.component.option('value'))
      },
    })

    const addBtn = document.querySelector('#addBtn')
    new DevExpress.ui.dxButton(addBtn, {
      text: 'Add',
      type: 'success',
      autoPostback: true,
      onClick: (event) => {
        const {isValid} = event.validationGroup.validate()

        if (!isValid) return

        this.create()
      },
    })

    devExtremeHelper.registerValidators([parentIdValidator])
  }

  async create() {
    const solutionExplorer = document.querySelector('solution-explorer-component')

    const parentId = this.parentIdInstance.option('value')
    const objectType = this.typeInstance.option('value')
    const name = this.nameInstance.option('value')
    let ufId = this.ufIdInstance.option('value')
    let extension = this.extensionInstance.option('value')

    const domainId = this.selectedDomainId

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

    if (result.data.objectType !== '0') {
      useDispatch(setSelectedFile(result.data))
      useDispatch(setSelectedFolder({}))
    }

    solutionExplorer.refreshTreeList()

    SweetAlert2Helper.toastFire({title: result.message})
  }

  connectedCallback() {
    this.prepareForm()
  }

  disconnectedCallback() {
    devExtremeHelper.removeValidationGroup()
  }
}

window.customElements.define('file-add-modal-component', FileAddModal)
export default FileAddModal
