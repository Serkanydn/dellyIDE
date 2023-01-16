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

  static fire(title, timer = 1000, icon = 'success') {
    Swal.fire({
      title,
      icon,
      showConfirmButton: false,
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
