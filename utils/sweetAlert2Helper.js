class SweetAlert2 {
  static async confirmedSweet({title, text, icon}) {
    return await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      // confirmButtonText: 'Onayla',
      // cancelButtonText: 'İptal',
    })
  }

  static async YesNoCancel({title, text, html, icon}) {
    return Swal.fire({
      title,
      text,
      icon,
      html,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Save',
      denyButtonText: `Don't save`,
    })
  }

  static fire({title, text, timer, showConfirmButton = true, icon = 'success'}) {
    return Swal.fire({
      title,
      text,
      icon,
      showConfirmButton,
      timer,
    })
  }

  static toastFire({title, text, icon = 'success'}) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      },
    })
    Toast.fire({
      icon,
      title,
      text,
    })
  }
}

export default SweetAlert2
