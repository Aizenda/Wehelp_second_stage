
const AttractionModel = {
	async getAttractionData(id) {
		const attraction_url = `/api/attraction/${id}`;
		const attraction_response = await fetch(attraction_url);
		const response_data = await attraction_response.json();

		if (!attraction_response.ok) {
			return { error: true, message: response_data.message };
		}

		return { error: false, data: response_data.data };
	}
};

const AttractionView = {
	init(loader){
		this.loader = loader;
		this.minTime();
	},
	elements: {
		main: document.querySelector("main"),
		spanImg: document.querySelector(".attraction__element__image"),
		dot: document.querySelector(".attraction__element__dots"),
		spanName: document.querySelector(".order__element__name"),
		spanCategory: document.querySelector(".order__element__category"),
		spanOrder: document.querySelector(".order__element"),
		introduce: document.querySelector(".describe__element__introduce"),
		address: document.querySelector(".describe__element__address"),
		transportation: document.querySelector(".describe__element__transportation"),
		radios: document.querySelectorAll("input[name='time']"),
		priceSpan: document.querySelector("#price"),
		rightArrow: document.querySelector(".attraction__element__rightArrow"),
		leftArrow: document.querySelector(".attraction__element__leftArrow"),
	},

	showError(message) {
		const main = this.elements.main;
		while (main.firstChild) {
				main.removeChild(main.firstChild);
		}
		const err_element = document.createElement("div");
		err_element.classList.add("err__element");
		err_element.textContent = `ERROR: ${message}`;
		main.appendChild(err_element);
	},

	renderAttractionInfo(data) {
		this.elements.spanName.textContent = data.name;
		this.elements.spanCategory.textContent = `${data.category} at ${data.mrt}`;
		this.elements.introduce.textContent = data.description;
		this.elements.address.textContent = data.address;
		this.elements.transportation.textContent = data.transport;
	},

	preloadImages(imageUrls, callback) {
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
	},

	createSlider(images, controller) {
		const slideDiv = document.createElement("div");
		slideDiv.classList.add("attraction__slide__container")
		this.preloadImages(images, () => {
			images.forEach((imgurl, index) => {
				
				const slide = document.createElement("img");
				slide.classList.add("attraction__element__slide");
				slide.src = imgurl;

				slideDiv.appendChild(slide);

				this.elements.spanImg.appendChild(slideDiv);

				const dots = document.createElement("span");
				dots.classList.add("attraction__element__dot");
				if (index === 0) {
						dots.classList.add("attraction__element__blackDot");
				}

				dots.addEventListener("click", function () {
						controller.currentSlide(index + 1);
				});

				this.elements.dot.appendChild(dots);
			});
			this.loader.completeLoadingBar();
			this.elements.spanImg.classList.remove("skeleton-card");
		});
		
	},

	updatePrice() {
		const radios = this.elements.radios;
		const priceSpan = this.elements.priceSpan;
		
		radios.forEach(radio => {
			radio.addEventListener("change", function () {
					priceSpan.textContent = this.value;
			});
		});
},

	setupArrowButtons(controller) {
		const rightArrow = this.elements.rightArrow;
		const leftArrow = this.elements.leftArrow;

		rightArrow.addEventListener("mousedown", () => {
			rightArrow.src = "/static/imgs/Hovered_right.png";
		});

		rightArrow.addEventListener("mouseup", () => {
			rightArrow.src = "/static/imgs/arrow right.png";
		});

		leftArrow.addEventListener("mousedown", () => {
			leftArrow.src = "/static/imgs/Hovered_left.png";
		});

		leftArrow.addEventListener("mouseup", () => {
			leftArrow.src = "/static/imgs/arrow left.png";
		});

		
		rightArrow.addEventListener("click", () => controller.plusDivs(1));
		leftArrow.addEventListener("click", () => controller.plusDivs(-1));
	},

	showDivs(n) {
		const slides = document.querySelectorAll(".attraction__element__slide");
		const dots = document.querySelectorAll(".attraction__element__dot");
		const container = document.querySelector(".attraction__slide__container");
	
		let slideIndex = n;
		if (slideIndex >= slides.length) slideIndex = 0;
		if (slideIndex < 0) slideIndex = slides.length - 1;
	
		const targetSlide = slides[slideIndex];
		container.scrollTo({
			left: targetSlide.offsetLeft,
			behavior: "smooth"
		});
	
		dots.forEach(dot => dot.classList.remove("attraction__element__blackDot"));
		dots[slideIndex].classList.add("attraction__element__blackDot");
	
		return slideIndex;
	},

	minTime(){
		const today = new Date().toISOString().split("T")[0];
		document.getElementById("date").setAttribute("min", today);
	}

};


const AttractionController = {
	model: AttractionModel,
	view: AttractionView,
	slideIndex: 0,
	attractionId: null,
	loader:null,

	init(loader) {
		this.loader = loader;
		const URL = window.location.pathname.split("/");
		this.attractionId = URL[URL.length - 1];
		this.view.updatePrice();
		this.view.setupArrowButtons(this);
		this.getAttraction(this.attractionId);
	},

	async getAttraction(id) {
		this.loader.showLoadingBar();
		this.loader.skeleton(1);
		const result = await this.model.getAttractionData(id);
		if (result.error) {
				this.view.showError(result.message);
				this.loader.completeLoadingBar();
		} else {
				this.view.renderAttractionInfo(result.data);
				this.view.createSlider(result.data.images, this);
		}
	},

	plusDivs(n) {
		this.slideIndex = this.view.showDivs(this.slideIndex + n);
	},

	currentSlide(n) {
		this.slideIndex = this.view.showDivs(n - 1);
	}
};


document.addEventListener("DOMContentLoaded",()=>{
	const loader = new  LoaderView()
	AttractionController.init(loader);
	AttractionView.init(loader);
})
