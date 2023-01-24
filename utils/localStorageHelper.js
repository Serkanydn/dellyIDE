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
  setRecentlyFiles(data){
    if(!localStorage.getItem("recentlyOpenedFiles")){
      var item ={"name":data.ufId+'.'+data.extension,"id":data.id}
        localStorage.setItem("recentlyOpenedFiles",JSON.stringify(item))
      return;
    }
    var files = JSON.parse(localStorage.getItem("recentlyOpenedFiles"));
    var hasId = false;
    for (let key in files) { 
      if(files[key].id===data.id){
         hasId = true;
        }
      }
    if(hasId===true){
      var item = [
        {"name":data.ufId+'.'+data.extension,"id":data.id}]
      var reOrderFiles = files.filter(function(item){ return item.id != data.id })  
      reOrderFiles.push(item);
      localStorage.setItem("recentlyOpenedFiles",JSON.stringify(reOrderFiles))
      return;
    }
    var item = [
      {"name":data.ufId+'.'+data.extension,"id":data.id}]
    if(Object.keys(files).length>4){
        files.shift();
        files.push(item);
        localStorage.setItem("recentlyOpenedFiles",JSON.stringify(files))
        return;
      } 
      files.push(item);
      localStorage.setItem("recentlyOpenedFiles",JSON.stringify(files))
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
