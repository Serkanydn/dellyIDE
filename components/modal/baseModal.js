class BaseModal extends HTMLElement {
  constructor({body, footer, title}) {
    super()
    this.render(body, footer, title)
  }

  render(modalBody, modalFooter, title) {
    this.innerHTML = `
    <div  class="modal fade" id="baseModal" tabindex="-1" aria-labelledby="baseModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
  
      <div class="modal-content w-75">
        <div class="modal-header">
          <h5 class="modal-title" id="baseModalLabel">${title}</h5>
          <button id="closeIcon" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        
        <div class="modal-body">${modalBody}</div>
  

      <div class="modal-footer">
      <button id="closeBtn" class="btn btn-secondary shadow-none" data-bs-dismiss="modal" aria-label="Close">Close</button>
      ${modalFooter}
      </div>

    </div>
  </div>
</div>

        `

    const closeBtn = this.querySelector('#closeBtn')
    const closeIcon = this.querySelector('#closeIcon')

    closeBtn.addEventListener('click', () => this.close())
    closeIcon.addEventListener('click', () => this.close())

    const isDarkMode = localStorage.getItem('theme')
    if (isDarkMode === 'dark') {
      closeIcon.classList.add('btn-close-white')
    }
  }

  open() {
    document.body.appendChild(this)
    this.modal = new window.bootstrap.Modal(document.getElementById('baseModal'), {
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
}

export default BaseModal
