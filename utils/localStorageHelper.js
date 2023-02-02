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
  setRecentlyFiles(data) {
    if (!this.getItem('recentlyOpenedFiles')) {
      var item = [{name: data.name || data.ufId || data.id + '.' + data.extension, id: data.id}]
      this.setItem('recentlyOpenedFiles', JSON.stringify(item))
      return
    }
    var files = JSON.parse(this.getItem('recentlyOpenedFiles'))
    var hasId = files.some((file) => file.id === data.id)

    if (hasId) {
      var item = {name: data.name || data.ufId || data.id + '.' + data.extension, id: data.id}
      var reOrderFiles = files.filter(function (item) {
        return item.id != data.id
      })
      reOrderFiles.push(item)
      this.setItem('recentlyOpenedFiles', JSON.stringify(reOrderFiles))
      return
    }
    var item = {name: data.name || data.ufId || data.id + '.' + data.extension, id: data.id}
    if (Object.keys(files).length > 4) {
      files.shift()
      files.push(item)
      this.setItem('recentlyOpenedFiles', JSON.stringify(files))
      return
    }
    files.push(item)
    this.setItem('recentlyOpenedFiles', JSON.stringify(files))
  }
  setOrderRecentlyFiles(data){
    var files = JSON.parse(this.getItem('recentlyOpenedFiles'))
    var item = {name: data[0].name || data[0].ufId || data[0].id + '.' + data[0].extension, id: data[0].id}
    var reOrderFiles = files.filter(function (item) {
      return item.id != data[0].id
    })
    reOrderFiles.push(item)
    this.setItem('recentlyOpenedFiles', JSON.stringify(reOrderFiles))
  }
  removeFromRecentlyFiles(id){
    var files = JSON.parse(this.getItem('recentlyOpenedFiles'))
    var reOrderFiles = files.filter(function (item) {
      return item.id != id
    })
    this.setItem('recentlyOpenedFiles', JSON.stringify(reOrderFiles))
  }
  clearRecentlyOpenedFiles(){
    this.removeItem('recentlyOpenedFiles')
  }
  getAccessToken() {
    return this.getItem('access_token')
  }

  getRefreshToken() {
    return this.getRefreshToken('refresh_token')
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
