import localStorageHelper from '../utils/localStorageHelper.js'

class DomainService {
  constructor() {
    const baseURL = `${window.config.webServiceUrl}/user`
    this.domainClient = axios.create({
      baseURL,
      timeout: 1000,
      headers: {
        Authorization: `Baerer ${localStorageHelper.getAccessToken()}`,
      },
    })
  }
  async create({id, name}) {
    return await this.domainClient.post(`${window.config.webServiceUrl}/domain`, {id, name})
  }
  async update({id, name, domainId}) {
    return await this.domainClient.patch(`${window.config.webServiceUrl}/domain/${id}`, {name, domainId})
  }
}

export default DomainService
