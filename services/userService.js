import localStorageHelper from '../utils/localStorageHelper.js'

class UserService {
  constructor() {
    const baseURL = `${window.config.webServiceUrl}/user`
    this.userClient = axios.create({
      baseURL,
      timeout: 1000,
      headers: {
        Authorization: `Baerer ${localStorageHelper.getAccessToken()}`,
      },
    })
  }
  async login({email, password}) {
    return await axios.post(`${window.config.webServiceUrl}/user/login`, {email, password})
    // return await axios.post(`http://localhost:3000/user/login`, {email, password})
  }

  async getActiveUserDomains() {
    const domains = await this.userClient.get(`/domain`)
    return domains
  }
  async getActiveUser() {
    return await this.userClient.get()
  }
}

export default UserService
