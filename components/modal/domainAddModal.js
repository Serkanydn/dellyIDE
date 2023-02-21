import SweetAlert2Helper from '../../utils/sweetAlert2Helper.js'
import devExtremeHelper from '../../utils/devExtreme/devExtremeHelper.js'
import DomainService from '../../services/domainService.js'
import BaseModal from './baseModal.js'

const modalBody = `
<div id="domainIdGroup">
<div  class="row mb-2">
  <label for="domainId" class="col-sm-2 col-form-label ">Id</label>
  <div class="col-md-10">
      <div class="form-control form-control-sm" id="domainId" ></div>
  </div>
</div>
</div>

<div id="domainNameGroup">
<div  class="row mb-2">
<label for="domainName" class="col-sm-2 col-form-label ">Name</label>
<div class="col-md-10">
    <div class="form-control form-control-sm" id="domainName" ></div>
</div>
</div>
</div>

`

const modalFooter = `
<div id="addBtn" ></div>

`
class DomainAddModal extends BaseModal {
  constructor() {
    super({body: modalBody, footer: modalFooter, title: 'Domain Add'})

    this.domainNameInstance = null
    this.domainIdInstance = null
  }

  async prepareForm() {
    const domainId = document.querySelector('#domainId')
    this.domainIdInstance = new DevExpress.ui.dxTextBox(domainId, {
      value: this.uuidv4(),
    })

    const domainIdValidator = new DevExpress.ui.dxValidator(domainId, {
      validationRules: [
        {
          type: 'required',
          message: 'Id is required',
        },
        // {
        //   type: 'stringLength',
        //   min: 16,
        //   message: 'Id must be 16 characters',
        // },
        // {
        //   type: 'stringLength',
        //   max: 16,
        //   message: 'Id must be 16 characters',
        // },
      ],
    })

    const domainName = document.querySelector('#domainName')
    this.domainNameInstance = new DevExpress.ui.dxTextBox(domainName, {
      value: '',
    })

    const domainNameValidator = new DevExpress.ui.dxValidator(domainName, {
      validationRules: [
        {
          type: 'required',
          message: 'Name is required',
        },
      ],
    })

    devExtremeHelper.registerValidators([domainIdValidator, domainNameValidator])

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
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  async create() {
    const solutionExplorer = document.querySelector('solution-explorer-component')

    const id = this.domainIdInstance.option('value')
    const name = this.domainNameInstance.option('value')

    const {data: domainResult} = await new DomainService().create({id, name})
    const {success, message, data: domainData} = domainResult

    if (!success) {
      SweetAlert2Helper.toastFire({title: message, icon: 'error'})
      return
    }

    this.close()

    solutionExplorer.refreshTreeList()

    SweetAlert2Helper.toastFire({title: message})
  }

  connectedCallback() {
    const self = this
    this.prepareForm()
  }

  disconnectedCallback() {
    devExtremeHelper.removeValidationGroup()
  }
}

window.customElements.define('domain-add-modal-component', DomainAddModal)
export default DomainAddModal
