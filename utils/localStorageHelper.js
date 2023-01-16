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
}

export default new LocalStorageHelper()
