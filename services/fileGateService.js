import localStorageHelper from '../utils/localStorageHelper.js'

class FileGateService {
  constructor() {
    const baseURL = `${window.config.webServiceUrl}/FileGate`
    this.fileClient = axios.create({
      baseURL,
      timeout: 1000,
      headers: {
        Authorization: `Baerer ${localStorageHelper.getAccessToken()}`,
      },
    })
  }
  async readFileById(id, native = true) {
    return await this.fileClient.post('/read', {id, native})
  }

  async addFile(data) {
    return await this.fileClient.post('/create', data)
  }
  async copyFile(data) {
    return await this.fileClient.post('/copy', data)
  }

  async readFileByUfId(ufId) {
    return await axios.post(` ${baseURL}/read`, {ufId})
  }

  async update(data) {
    return await this.fileClient.patch('/update', data)
  }

  async updateContent(id, content) {
    return await this.fileClient.patch(`/updateContent/${id}`, {content})
  }

  async updateAllContents(idAndContentsArray) {
    return await this.fileClient.patch(`/updateAllContents`, {contents: idAndContentsArray})
  }

  async disableFile(id) {
    return await this.fileClient.delete(`/delete?id=${id}`)
  }

  async readAllFiles(where) {
    const {data: files} = await this.fileClient.post('/readAllFiles')
    return files
  }

  async readAllFilesWithDomainId(domainId) {
    const {data: files} = await this.fileClient.post('/readAllFiles', {domainId})
    return files
  }

  async versionUpdate(id, content) {
    return await this.fileClient.patch(`/versionUpdate/${id}`, {content})
  }
}

export default FileGateService
