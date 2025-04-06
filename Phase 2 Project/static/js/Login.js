const signinButton = document.querySelector(".header__button__signin");
const signup = document.querySelector(".signup__content");
const overlay = document.querySelector(".modal__overlay");
const signinForm = document.querySelector("#signinForm");

// 打開登入視窗
signinButton.addEventListener("click", (event) => {
    signinForm.classList.add("signin__content__show");
    overlay.classList.add("modal__overlay__show");
});

// 處理登入
signinForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const email = signinForm.querySelector("input[name='email']").value;
    const password = signinForm.querySelector("input[name='password']").value;
    const signinRequest = document.querySelector(".signin__element__request"); 
    signinRequest.classList.add("signin__element__request__show");
    signinForm.insertBefore(signinRequest, signinForm.querySelector(".signin__content__buttom"));
    
    const response = await fetch("/api/user/auth", { 
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });
    
    const result = await response.json();

    localStorage.setItem("token", result.token);
    
    if (response.ok) {
        signinRequest.classList.add("signin__element__request__show");
        signinRequest.style.color = "green";
        signinRequest.textContent = "登入成功";
        
        // 登入成功後的處理
        setTimeout(() => {
            signinForm.classList.remove("signin__content__show");
            overlay.classList.remove("modal__overlay__show");
            location.reload();
        }, 1500);
    } else {
        signinRequest.classList.add("signin__element__request__show");
        signinRequest.style.color = "red";
				signinRequest.textContent = ""
        signinRequest.textContent = "登入失敗，" + (result.message || "請檢查帳號密碼");
    }
});

// 處理註冊
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const signupRequest = document.querySelector(".signup__element__request");

    const response = await fetch("/api/user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();
    if (response.ok) {
        signupRequest.classList.add("signup__element__request__show");
        signupRequest.style.color = "green";
        signupRequest.textContent = ""
        signupRequest.textContent = "註冊成功";
    } else {
        signupRequest.classList.add("signup__element__request__show");
        signupRequest.style.color = "red";
        signupRequest.textContent = ""
        signupRequest.textContent = "註冊失敗，" + result.message;
    }
});

//網頁更新
document.addEventListener("DOMContentLoaded",async ()=>{
	const token = localStorage.getItem("token")
	const signoutButtom = document.querySelector("#signin")

	const res = await fetch("/api/user/auth",{
		method:"GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer${token}`
		}
	});

	const result  = await res.json()
    
	if(!result.data){
		return;
	}
	
	signoutButtom.textContent = "登出";
	signinButton.id = "statusUpdate";
	
	//登出
	const signout_buttom = document.querySelector("#statusUpdate")
	signout_buttom.addEventListener("click", ()=>{
	localStorage.removeItem("token");
	signout_buttom.id = "signin"
	signinForm.classList.remove("signin__content__show");
	overlay.classList.remove("modal__overlay__show");
	location.reload();
	})
})

// 關閉註冊視窗
const signupClose = document.querySelector(".signup__content__img");
signupClose.addEventListener("click", () => {
    signup.classList.remove("signup__content__show");
    overlay.classList.remove("modal__overlay__show");
});

// 關閉登入視窗
const signinClose = document.querySelector(".signin__content__img");
signinClose.addEventListener("click", () => {
    signinForm.classList.remove("signin__content__show");
    overlay.classList.remove("modal__overlay__show");
});

// 切換到登入視窗
const signinLink = document.querySelector(".signup__element__link");
signinLink.addEventListener("click", () => {
    signup.classList.remove("signup__content__show");
    signinForm.classList.add("signin__content__show");
});

// 切換到註冊視窗
const signupLink = document.querySelector(".signin__element__link");
signupLink.addEventListener("click", () => {
    signinForm.classList.remove("signin__content__show");
    signup.classList.add("signup__content__show");
});
