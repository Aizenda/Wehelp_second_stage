// 1. 首頁返回功能
function homepage(className) {
	const button = document.querySelector(`.${className}`);
	if (button) {
			button.addEventListener("click", () => {
					window.location.href = "/";
			});
	} else {
			console.error(`Element with class "${className}" not found.`);
	}
}
homepage("header__title");

// 2. URL 和 ID 處理
const URL = window.location.pathname.split("/");
const id  = URL[URL.length - 1];

// 3. DOM 元素選取
const main = document.querySelector("main");
const spanImg = document.querySelector(".attraction__element__image");
const dot = document.querySelector(".attraction__element__dots")
const spanName = document.querySelector(".order__element__name");
const spanCategory = document.querySelector(".order__element__category");
const spanOrder = document.querySelector(".order__element");
const introduce = document.querySelector(".describe__element__introduce");
const address = document.querySelector(".describe__element__address");
const transportation = document.querySelector(".describe__element__transportation");

// 4. 時間選擇price更新
const radios  = document.querySelectorAll("input[name='time']");
const priceSpan  = document.querySelector("#price");
radios.forEach(radio => {
	radio.addEventListener("change", function () {
			priceSpan.textContent = this.value;
	});
});

// 5. 景點數據獲取和渲染
async function getAttractionData(id) {
	const attraction_url = `/api/attraction/${id}`;
	const attraction_response = await fetch(attraction_url);
	const response_data = await attraction_response.json();

	if (!attraction_response.ok) {
			showError(response_data.message);
			return null;
	}

	return response_data.data;
}

function showError(message) {
	while (main.firstChild) {
			main.removeChild(main.firstChild);
	}
	const err_element = document.createElement("div");
	err_element.classList.add("err__element");
	err_element.textContent = `ERROR: ${message}`;
	main.appendChild(err_element);
}

function preloadImages(imageUrls, callback) {
	let loadedCount = 0;
	const images = [];

	imageUrls.forEach((url, index) => {
			images[index] = new Image();
			images[index].src = url;
			images[index].onload = () => {
					loadedCount++;
					if (loadedCount === imageUrls.length) {
							callback();
					}
			};
	});
}

function createSlider(images) {


	preloadImages(images, () => {
			images.forEach((imgurl, index) => {
					const slide = document.createElement("div");
					slide.classList.add("attraction__element__slide");
					slide.style.backgroundImage = `url("${imgurl}")`;

					if (index === 0) {
							slide.style.display = "inline-block";
					} else {
							slide.style.display = "none";
					}

					spanImg.appendChild(slide);

					// 建立點
					const dots = document.createElement("span");
					dots.classList.add("attraction__element__dot");
					if (index === 0) {
							dots.classList.add("attraction__element__blackDot");
					}

					dots.addEventListener("click", function () {
							currentSlide(index + 1);
					});

					dot.appendChild(dots);
			});
	});
}

function renderAttractionInfo(data) {
	spanName.textContent = data.name;
	spanCategory.textContent = `${data.category} at ${data.mrt}`;
	introduce.textContent = data.description;
	address.textContent = data.address;
	transportation.textContent = data.transport;
}

async function getAttraction(id) {
	const attraction_data = await getAttractionData(id);
	if (attraction_data) {
			renderAttractionInfo(attraction_data);
			createSlider(attraction_data.images);
	}
}

getAttraction(id);

// 6. 輪播功能
let slideIndex = 0;

function plusDivs(n) {
	showDivs(slideIndex += n);
}

function currentSlide(n){ 
	showDivs(slideIndex = n);
}

function showDivs(n) {
	const slides = document.querySelectorAll(".attraction__element__slide");
	const dots = document.querySelectorAll(".attraction__element__dot")
	if(n >= slides.length){slideIndex = 0};
	if(n < 0){slideIndex = slides.length - 1};

	for (let i = 0; i < slides.length; i++) {
			slides[i].style.display = "none";
	}

	for (i = 0; i < dots.length; i++) {
			dots[i].classList.remove("attraction__element__blackDot");
	}

	slides[slideIndex].style.display = "block";
	dots[slideIndex].classList.add("attraction__element__blackDot");
}

//7.點擊左右箭頭顏色改變
const rightArrow = document.querySelector(".attraction__element__rightArrow");
rightArrow.addEventListener("mousedown", () => {
	rightArrow.src = "/static/imgs/Hovered_right.png";
});

rightArrow.addEventListener("mouseup", () => {
	rightArrow.src = "/static/imgs/arrow right.png";
});

const leftArrow = document.querySelector(".attraction__element__leftArrow");
leftArrow.addEventListener("mousedown", () => {
	leftArrow.src = "/static/imgs/Hovered_left.png";
});

leftArrow.addEventListener("mouseup", () => {
	leftArrow.src = "/static/imgs/arrow left.png";
});