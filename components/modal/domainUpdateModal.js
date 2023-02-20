import SweetAlert2Helper from '../../utils/sweetAlert2Helper.js'
import devExtremeHelper from '../../utils/devExtreme/devExtremeHelper.js'
import DomainService from '../../services/domainService.js'

class DomainUpdateModal extends HTMLElement {
  constructor({id, name}) {
    super()

    this.state = {id, name}
    this.innerHTML = `
   
<div  class="modal fade" id="domainModal" tabindex="-1" aria-labelledby="domainModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">

    <div class="modal-content w-75">
      <div class="modal-header">
        <h5 class="modal-title" id="domainModalLabel">Domain Update</h5>
        <button id="closeIcon" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      
      <div class="modal-body">

        <div id="domainIdGroup">
          <div  class="row mb-2">
            <label for="domainId" class="col-sm-2 col-form-label ">Id</label>
            <div class="col-md-10">
                <div class="form-control form-control-sm" id="domainId" readonly ></div>
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
    this.domainNameInstance = null
    this.domainIdInstance = null
  }

  open() {
    this.modal = new window.bootstrap.Modal(document.getElementById('domainModal'), {
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

    const domainId = document.querySelector('#domainId')
    this.domainIdInstance = new DevExpress.ui.dxTextBox(domainId, {
      value: this.state.id,
    })

    const domainIdValidator = new DevExpress.ui.dxValidator(domainId, {
      validationRules: [
        {
          type: 'required',
          message: 'Id is required',
        },
      ],
    })

    const domainName = document.querySelector('#domainName')
    this.domainNameInstance = new DevExpress.ui.dxTextBox(domainName, {
      value: this.state.name,
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
      text: 'Update',
      type: 'success',
      autoPostback: true,
      onClick: (event) => {
        const {isValid} = event.validationGroup.validate()

        if (!isValid) return

        this.create()
      },
    })
  }

  async create() {
    const solutionExplorer = document.querySelector('solution-explorer-component')

    const id = this.domainIdInstance.option('value')
    const name = this.domainNameInstance.option('value')

    const {data: domainResult} = await new DomainService().update({id, name})
    const {success, message, data: domainData} = domainResult

    console.log(domainResult)

    if (!success) {
      console.log(message)
      SweetAlert2Helper.toastFire({title: message, icon: 'error'})
      return
    }

    this.close()

    solutionExplorer.refreshTreeList()

    SweetAlert2Helper.toastFire({title: message})
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
    devExtremeHelper.removeValidationGroup()
  }
}

window.customElements.define('domain-update-modal-component', DomainUpdateModal)
export default DomainUpdateModal
