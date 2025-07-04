// Model
class LoginModel {
	async signinResponse(email, password) {
		const response = await fetch("/api/user/auth", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password })
		});
		return await response.json();
	}

	async loginStatus(token) {
		const response = await fetch('/api/user/auth', {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			}
		});
		return await response.json();
	}

	async signup(name, email, password){
    const response = await fetch("/api/user",{
        method:"POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, name })
    });
    return await response.json();
	}
}

// View：
class LoginView {
	constructor() {
		this.elements = {
			signinButton: document.querySelector('.header__button--signin'),
			signup: document.querySelector('.signup__content'),
			overlay: document.querySelector('.modal__overlay'),
			signinForm: document.querySelector('#signinForm'),
			signinlink: document.querySelector('.signup__element__link'),
			signupLink: document.querySelector('.signin__element__link'),
			signupForm: document.querySelector('#signupForm'),
			signinRequest: document.querySelector('.signin__element__request'),
			close: document.querySelectorAll('.signin__content__img'),
			homeButton: document.querySelector('.header__title'),
			signupRequest : document.querySelector('.signup__element__request')
			
		};
	}

	signinShow() {
		this.elements.signinForm.classList.add('show');
		setTimeout(()=>{
			this.elements.signinForm.classList.add('animate');
		},50)
		this.elements.overlay.classList.add('modal__overlay__show');
		this.elements.signinRequest.classList.remove('signin__element__request__show');
	}

	signupShow() {
		this.elements.signupForm.classList.add('show');
		setTimeout(()=>{
			this.elements.signupForm.classList.add('animate');
		},50)
		this.elements.signinRequest.classList.remove('signin__element__request__show');
	}

	close() {
		this.elements.signinForm.classList.remove('show');
		this.elements.signinForm.classList.remove('animate');
		this.elements.signupForm.classList.remove('show');
		this.elements.signupForm.classList.remove('animate');
		this.elements.overlay.classList.remove('modal__overlay__show');
	}

	signinRequestShow(message, token) {
		const requestBox = this.elements.signinRequest;
		requestBox.classList.add('signin__element__request__show');
		this.elements.signinForm.insertBefore(
			requestBox,
			this.elements.signinForm.querySelector(".signin__content__buttom")
		);

		if (!token) {
			requestBox.style.color = 'red';
			requestBox.textContent = message;
			return;
		}
		requestBox.style.color = 'green';
		requestBox.textContent = '登入成功';
	}

	signupRequestShow(message, isSuccess) {
		const requestBox = this.elements.signupRequest;
		requestBox.classList.add('signup__element__request__show');
		requestBox.style.color = isSuccess ? 'green' : 'red';
		requestBox.textContent = message;
	}
}

// Controller
class LoginController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
		this.init();
		this.checkLoginStatus();
	}

	init() {
		this.view.elements.signinButton.addEventListener('click', () => {
			this.view.signinShow();
		});

		this.view.elements.signupLink.addEventListener('click', () => {
			this.view.signupShow();
		});

		this.view.elements.signinlink.addEventListener('click', () => {
			this.view.close();
			this.view.signinShow();
		});

		this.view.elements.close.forEach(img => {
			img.addEventListener('click', () => {
				this.view.close();
			});
		});

		this.view.elements.homeButton.addEventListener('click', () => {
			window.location.href = '/';
		});

		this.view.elements.signinForm.addEventListener("submit", async (event) => {
			event.preventDefault();
			const { email, password } = this.getEmailAndPassword('signin');
			const result = await this.model.signinResponse(email, password);
			const { message, token } = result;

			this.view.signinRequestShow(message, token);
			if (token) {
				localStorage.setItem('token', token);

				setTimeout(() => {
					location.reload();
				}, 1000);
			}
		});

		this.view.elements.signupForm.addEventListener("submit", async (event) => {
			event.preventDefault();
		
			const { name, email, password } = this.getEmailAndPassword('signup');
			const result = await this.model.signup(name, email, password);
			if (result.ok || result.token) {
				this.view.signupRequestShow("註冊成功", true);
			} else {
				this.view.signupRequestShow("註冊失敗，" + result.message, false);
			}
		});
	}

	getEmailAndPassword(formType) {
		const data = {};
		const form = document.querySelector(`#${formType}Form`);
		
		if (!form) return null;

		const emailInput = form.querySelector("input[type=email]");
		const passwordInput = form.querySelector("input[type=password]");
		const usernameInput = form.querySelector("#name");

		if (emailInput) data.email = emailInput.value;
		if (passwordInput) data.password = passwordInput.value;
		if (usernameInput) data.name = usernameInput.value;
		return data;
	}

	logOut(statusUpdate) {
		statusUpdate.addEventListener('click', ()=>{
			this.view.elements.signinForm.classList.remove('signin__content__show');
			this.view.elements.signupForm.classList.remove('signup__content__show'); 
			this.view.elements.overlay.classList.remove('modal__overlay__show');
			this.view.elements.signinButton.textContent = '登入/註冊';
			localStorage.clear();
			location.reload();
		});
	}

	async checkLoginStatus() {
		document.addEventListener("DOMContentLoaded", async () => {
			const token = localStorage.getItem('token');
			const result = await this.model.loginStatus(token);
			if (!result.data){
				return;
			}

			this.view.elements.signinButton.style.display = 'none';
			this.view.elements.signinButton.textContent = '登出系統';
			this.view.elements.signinButton.style.display = 'block';
			this.view.elements.signinButton.id = "statusUpdate";

			
			const { name, email, id } = result.data;
			localStorage.setItem('Name', name);
			localStorage.setItem('email', email);
			localStorage.setItem('id', id);
			let statusUpdate = document.querySelector('#statusUpdate')
			this.logOut(statusUpdate);

		});
	}

	
}
const model = new LoginModel();
const view = new LoginView();
const controller = new LoginController(model, view);
