import './vendor/devExtreme/js/dx.all.js'
import './vendor/devExtreme/js/jquery.min.js'
import Header from './components/header/header.js'
import FileEditor from './components/fileEditor/fileEditor.js'
import Login from './components/login/login.js'
import SweetAlert2Helper from './utils/sweetAlert2Helper.js'

import localStorageHelper from './utils/localStorageHelper.js'
import {registerDependency} from './components/contentEditor/dependencyConfig.js'

import ContentEditorHelper from './utils/contentEditorHelper.js'
import {useDispatch} from './store/index.js'
import UserService from './services/userService.js'
import {setUserInitialState} from './store/slices/user.js'

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
loadScript('./config.js').then(async (response) => {
  if (response.status) {
    window.config = config
    const root = document.querySelector('#root')

    if (!localStorageHelper.getAccessToken()) {
      root.append(new Login())
      const spinner = document.querySelector('#spinner-container')
      spinner.style.display = 'none'
      spinner.style.opacity = 0
      root.style.opacity = 1
    } else {
      await getUser()
    }
  }
})

const getUser = async () => {
  try {
    const userService = new UserService()
    const {data: user} = await userService.getActiveUser()

    useDispatch(setUserInitialState({user}))

    const theme = localStorage.getItem('theme') || 'light'
    root.style.opacity = 0
    new ContentEditorHelper().changeTheme(theme)
    const div = document.createElement('div')
    div.classList.add('d-flex', 'flex-column', 'h-100')
    div.append(new Header())
    div.append(new FileEditor())
    root.append(div)
    registerDependency()

    const spinner = document.querySelector('#spinner-container')
    setTimeout(() => {
      spinner.style.display = 'none'
      spinner.style.opacity = 0
      root.style.opacity = 1
    }, 500)
  } catch (error) {
    if (!error.response.data.success) {
      localStorageHelper.clear()
      SweetAlert2Helper.fire({title: 'Jwt expired. Please login again.', showConfirmButton: false, icon: 'info'})
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  }
}
