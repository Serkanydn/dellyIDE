import UserService from '../../services/userService.js'
import localStorageHelper from '../../utils/localStorageHelper.js'
import SweetAlert2 from '../../utils/sweetAlert2Helper.js'
class Login extends HTMLElement {
  constructor(state) {
    super(state)

    this.innerHTML = `
 
      <div class="wrapper fadeInDown">
      <div id="formContent" class="bg-white w-90 p-0 text-center rounded position-relative">
        <!-- Tabs Titles -->
    
        <!-- Icon -->
        <div class="fadeIn first loginLogo">
        <a href="#">  <span> Delly</span>Editor </a>
        </div>
    
        <!-- Login Form -->
        <form>
        
        <input type="text" id="email" class="loginInput border-0 text-center text-decoration-none d-inline-block  m-1 fadeIn second"  placeholder="E-posta" value="" aria-describedby="inputGroupPrepend"  />
      
          
          <input type="password" id="password" class="loginInput border-0 text-center text-decoration-none d-inline-block  m-1 fadeIn third"  placeholder="Şifre" value="">


          <div id="loginValidation" class="alert alert-danger d-none" role="alert"></div>

          <input type="submit" id="login" class="loginButton fadeIn border-0 fourth text-white text-center text-uppercase d-inline-block text-decoration-none" value="Login">

          
        </form>
    
        <!-- Remind Passowrd -->
        <div id="formFooter text-center">
         <a class="underlineHover" style="text-decoration:none" href="#">Forgot Password?</a>
        </div>
    
      </div>
    </div>
      `
    // admin@admin.com
    // aretedellyadmin*
  }

  connectedCallback() {
    const login = document.querySelector('#login')

    login.addEventListener('click', async (event) => {
      event.preventDefault()

      const email = document.querySelector('#email').value
      const password = document.querySelector('#password').value
      const loginValidation = document.querySelector('#loginValidation')
      loginValidation.classList.add('d-none')

      const {data} = await new UserService().login({email, password})

      if (!data.success) {
        if (data.error) {
          SweetAlert2.toastFire({title: data.error?.message, icon: 'error'})
          return
        }

        if (data.errors.length > 0) {
          loginValidation.classList.remove('d-none')
          loginValidation.innerHTML = ''
          data.errors.forEach((error) => {
            const parag = document.createElement('p')
            parag.textContent = error.message
            loginValidation.appendChild(parag)
          })
          return
        }
      }
      // localStorageHelper.setItem('user', JSON.stringify(data.data))
      localStorageHelper.setItem('access_token', data.data.tokens.accessToken)
      localStorageHelper.setItem('refresh_token', data.data.tokens.refreshToken)

      location.reload()
    })
  }
}

window.customElements.define('login-component', Login)
export default Login
