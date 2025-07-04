
class AttractionModel {
	constructor() {
			this.attractions = [];
			this.page = 0;
			this.isLoading = false;
			this.hasMoreData = true;
			this.currentKeyword = "";
	}

	async fetchAttractions(keyword = "") {
			if (this.isLoading || !this.hasMoreData) return null;
			
			this.isLoading = true;
			this.currentKeyword = keyword;
			
			try {
					const response = await fetch(`/api/attractions?page=${this.page}&keyword=${keyword}`);
					const data = await response.json();
					
					if (data.nextPage !== null) {
							this.page = data.nextPage;
					} else {
							this.hasMoreData = false;
					}
					
					this.isLoading = false;
					return data.data;
			} catch (error) {
					console.error("載入錯誤:", error);
					this.isLoading = false;
					return null;
			}
	}
	
	resetSearch() {
			this.page = 0;
			this.hasMoreData = true;
	}
}

class MRTModel {
	constructor() {
			this.stations = [];
	}
	
	async fetchMRTStations() {
			try {
					const response = await fetch("/api/mrts");
					const data = await response.json();
					this.stations = data.data;
					return this.stations;
			} catch (error) {
					console.error("錯誤：", error);
					return [];
			}
	}
}

class AttractionView {
	constructor() {
			this.grid = document.querySelector(".grid");
			this.inputKeyword = document.querySelector(".search__input");
			this.searchButton = document.querySelector(".search__button");
			this.searchSection = document.querySelector(".search__section");
			this.mrtTitle = document.querySelector(".mrt__title");		
	}
	
	clearAttractions() {
			this.grid.innerHTML = "";
	}
	
	renderAttractions(attractions) {
			attractions.forEach(attraction => {
					let attractionsElement = document.createElement("a");
					attractionsElement.classList.add("attractions__element");
					
					let imageContainer = document.createElement("div");
					imageContainer.style.backgroundImage = `url(${attraction.images[0]})`;
					imageContainer.classList.add("attractions__element__image");
			
					let nameElement = document.createElement("div");
					nameElement.textContent = attraction.name;
					nameElement.classList.add("attractions__element__name");
					
					let bottomContainer = document.createElement("div");
					bottomContainer.classList.add("attractions__element__bottom");
					
					let leftText = document.createElement("div");
					leftText.textContent = attraction.mrt;
					leftText.classList.add("attractions__element__bottom__left");
					
					let rightText = document.createElement("div");
					rightText.textContent = attraction.category;
					rightText.classList.add("attractions__element__bottom__right");

					const id = attraction.id;
					attractionsElement.href = `/attraction/${id}`;

					// 組合元素
					bottomContainer.appendChild(leftText);
					bottomContainer.appendChild(rightText);
					
					attractionsElement.appendChild(imageContainer);
					attractionsElement.appendChild(nameElement);
					attractionsElement.appendChild(bottomContainer);
					
					this.grid.appendChild(attractionsElement);
			});
			
			return this.grid.lastElementChild;
	}
	
	getSearchKeyword() {
			return this.inputKeyword.value.trim();
	}
}

class MRTView {
	constructor() {
			this.mrtTitleContainer = document.querySelector(".mrt__title");
			this.leftArrow = document.querySelector(".arrow--left");
			this.rightArrow = document.querySelector(".arrow--right");
	}
	
	clearMRTStations() {
			this.mrtTitleContainer.innerHTML = "";
	}
	
	renderMRTStations(stations) {
			this.clearMRTStations();
			
			stations.forEach((station) => {
					let stationElement = document.createElement("button");
					stationElement.textContent = station;
					stationElement.classList.add("mrt__button");
					stationElement.type = "submit";
					this.mrtTitleContainer.appendChild(stationElement);
			});
	}
	
	setupMRTDragEvents() {
			let isDragging = false;
			let startX, scrollLeft;

			this.mrtTitleContainer.addEventListener("mousedown", (e) => {
					isDragging = true;
					this.mrtTitleContainer.classList.add("dragging"); 
					startX = e.pageX - this.mrtTitleContainer.offsetLeft;
					scrollLeft = this.mrtTitleContainer.scrollLeft;
			});

			this.mrtTitleContainer.addEventListener("mouseleave", () => {
					isDragging = false;
					this.mrtTitleContainer.classList.remove("dragging");
			});

			this.mrtTitleContainer.addEventListener("mouseup", () => {
					isDragging = false;
					this.mrtTitleContainer.classList.remove("dragging");
			});

			this.mrtTitleContainer.addEventListener("mousemove", (e) => {
					if (!isDragging) return;
					e.preventDefault();
					const x = e.pageX - this.mrtTitleContainer.offsetLeft;
					const walk = (x - startX); // 拖動速度，可調整
					this.mrtTitleContainer.scrollLeft = scrollLeft - walk;
			});
	}
	
	setupArrowButtons() {
			this.leftArrow.addEventListener("click", () => {
					this.mrtTitleContainer.scrollLeft -= 100;
			});

			this.leftArrow.addEventListener("mousedown", () => {
					this.leftArrow.src = "/static/imgs/Hovered_left.png";
			});

			this.leftArrow.addEventListener("mouseup", () => {
					this.leftArrow.src = "/static/imgs/arrow left.png";
			});

			this.rightArrow.addEventListener("click", () => {
					this.mrtTitleContainer.scrollLeft += 100;
			});

			this.rightArrow.addEventListener("mousedown", () => {
					this.rightArrow.src = "/static/imgs/Hovered_right.png";
			});

			this.rightArrow.addEventListener("mouseup", () => {
					this.rightArrow.src = "/static/imgs/arrow right.png";
			});
	}
}

class AttractionController {
	constructor(model, view, loaderView) {
		this.model = model;
		this.view = view;
		this.loaderView = loaderView; 
		this.observer = null;
		this.view.searchButton.addEventListener("click", () => this.performSearch());
		this.view.inputKeyword.addEventListener("keypress", (event) => {
				if (event.key === "Enter") {
						this.performSearch();
				}
		});

		this.loadAttractions();
	}
	
	async loadAttractions(keyword = "") {
		if (keyword !== this.model.currentKeyword) {
				this.model.resetSearch();
				this.view.clearAttractions();
		}

		const skeletons = this.loaderView.skeleton(8);
		this.loaderView.showLoadingBar();
		const attractions = await this.model.fetchAttractions(keyword);
		setTimeout(()=>{
			this.loaderView.completeLoadingBar();
		},50);
		
		skeletons.forEach(skeleton => skeleton.remove());

		if (attractions && attractions.length > 0) {
			const lastItem = this.view.renderAttractions(attractions);
			this.updateObserver(lastItem); 
		}
		
	}
	
	performSearch() {
		const keyword = this.view.getSearchKeyword();
		if (keyword) {
				this.loadAttractions(keyword);
		}
	}
	
	updateObserver(lastItem) {
		if (!this.model.hasMoreData) {
			if (this.observer) this.observer.disconnect();
			return;
		}
		
		if (this.observer) this.observer.disconnect();
		
		if (lastItem) {
				this.observer = new IntersectionObserver(entries => {
						if (entries[0].isIntersecting && !this.model.isLoading) {
								this.loadAttractions(this.model.currentKeyword);
						}
				}, { threshold: 1 });
				
				this.observer.observe(lastItem);
		}
	}
}

class MRTController {
	constructor(mrtModel, mrtView, attractionController, loaderView) {
			this.model = mrtModel;
			this.view = mrtView;
			this.attractionController = attractionController;
			this.loaderView = loaderView;
			
			this.init();
	}
	
	async init() {
			const stations = await this.model.fetchMRTStations();
			this.view.renderMRTStations(stations);
			this.view.setupMRTDragEvents();
			this.view.setupArrowButtons();
			
			this.view.mrtTitleContainer.addEventListener("click", (event) => {
					if (event.target.classList.contains("mrt__button")) {
							const keyword = event.target.textContent.trim();
							this.attractionController.model.resetSearch();
							this.attractionController.view.clearAttractions();
							this.attractionController.loadAttractions(keyword)
					}
			});
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const attractionModel = new AttractionModel();
	const mrtModel = new MRTModel();
	
	const attractionView = new AttractionView();
	const mrtView = new MRTView();
	const loaderView = new LoaderView();
	const attractionController = new AttractionController(attractionModel, attractionView,loaderView);
	const mrtController = new MRTController(mrtModel, mrtView, attractionController, loaderView);
});