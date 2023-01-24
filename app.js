import './vendor/devExtreme/js/dx.all.js'
import './vendor/devExtreme/js/jquery.min.js'
import Header from './components/header/header.js'
import FileEditor from './components/fileEditor/fileEditor.js'
import Login from './components/login/login.js'

import localStorageHelper from './utils/localStorageHelper.js'
import {registerDependency} from './components/contentEditor/dependencyConfig.js'

import ContentEditorHelper from './utils/contentEditorHelper.js'

// const LoadCSS = (cssURL) =>
//   new Promise((resolve) => {
//     var link = document.createElement('link')

//     link.rel = 'stylesheet'

//     link.href = cssURL

//     document.head.appendChild(link)

//     link.onload = function () {
//       resolve()
//     }
//   })

//   (async()=>{
//     await LoadCSS('./vendor/devExtreme/css/dx.light.css')
//     await LoadCSS('./vendor/monaco-editor/min/vs/editor/editor.main.css')
//     await LoadCSS('./vendor/bootstrap/css/bootstrap.min.css')
//   })

const loadScript = (src, async = true, type = 'text/javascript') =>
  new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script')
      const container = document.head || document.body

      script.type = type
      script.async = async
      script.src = src

      script.addEventListener('load', () => {
        resolve({status: true})
      })

      script.addEventListener('error', () => {
        reject({
          status: false,
          message: `Failed to load the script ${src}`,
        })
      })

      container.appendChild(script)
    } catch (err) {
      reject(err)
    }
  })

loadScript('./config.js').then((response) => {
  if (response.status) {
    window.config = config
    const root = document.querySelector('#root')

    if (!localStorageHelper.getAccessToken()) root.append(new Login())
    else {
      const theme = localStorage.getItem('theme') || 'light'

      new ContentEditorHelper().changeTheme(theme)
      root.append(new Header())
      root.append(new FileEditor())
      registerDependency()
    }
  }
})
