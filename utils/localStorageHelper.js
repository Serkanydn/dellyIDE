class LocalStorageHelper {
  getItem(property) {
    return localStorage.getItem(property)
  }
  setItem(property, value) {
    localStorage.setItem(property, value)
  }

  removeItem(property) {
    localStorage.removeItem(property)
  }

  clear() {
    localStorage.clear()
  }

  getAccessToken() {
    return localStorage.getItem('access_token')
  }

  getRefreshToken() {
    return localStorage.getRefreshToken('refresh_token')
  }

  getActiveUserDomains() {
    const user = JSON.parse(this.getItem('user'))

    return user.domainList.map((domain) => ({
      id: domain.id,
      name: domain.name,
    }))
  }

  getUserEmail() {
    const user = JSON.parse(this.getItem('user'))

    return user.email
  }

  addOpenedFile(fileId) {
    let openedFiles = this.getItem('openedFiles')
    if (openedFiles) {
      openedFiles = JSON.parse(openedFiles)
      const isThere = openedFiles.some((id) => id === fileId)
      if (!isThere) this.setItem('openedFiles', JSON.stringify([...openedFiles, fileId]))
      return
    }

    this.setItem('openedFiles', JSON.stringify([fileId]))
  }

  removeOpenedFile(fileId) {
    const openedFiles = this.getItem('openedFiles')
    const openedFilesArr = JSON.parse(openedFiles)
    if (openedFiles) {
      if (openedFilesArr.length > 1) {
        this.setItem('openedFiles', JSON.stringify(openedFilesArr.filter((id) => id !== fileId)))
        return
      }
    }

    this.removeItem('openedFiles')
  }

  getOpenedFiles() {
    const openedFiles = this.getItem('openedFiles')

    if (openedFiles) return JSON.parse(this.getItem('openedFiles'))

    return []
  }

  removeOpenedFiles() {
    this.removeItem('openedFiles')
  }
}

export default new LocalStorageHelper()
