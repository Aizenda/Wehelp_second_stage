async function fetchMRT() {
	try {
		let response = await fetch("http://52.196.225.29:8000/api/mrts");
		let data = await response.json();

		let mrtTitleContainer = document.querySelector(".mrt__title");
		let leftArrow = document.querySelector(".arrow--left");
		let rightArrow = document.querySelector(".arrow--right");

		// 先清空 container，避免重複加載
		mrtTitleContainer.innerHTML = "";

		// 生成捷運站按鈕
		data["data"].forEach((station) => {
			let stationElement = document.createElement("button");
			stationElement.textContent = station;
			stationElement.classList.add("mrt__button");
			stationElement.type = "submit";
			mrtTitleContainer.appendChild(stationElement);
		});

		// 🔹 滑鼠拖曳功能
		let isDragging = false;
		let startX, scrollLeft;

		mrtTitleContainer.addEventListener("mousedown", (e) => {
			isDragging = true;
			mrtTitleContainer.classList.add("dragging"); 
			startX = e.pageX - mrtTitleContainer.offsetLeft;
			scrollLeft = mrtTitleContainer.scrollLeft;
		});

		mrtTitleContainer.addEventListener("mouseleave", () => {
			isDragging = false;
			mrtTitleContainer.classList.remove("dragging");
		});

		mrtTitleContainer.addEventListener("mouseup", () => {
			isDragging = false;
			mrtTitleContainer.classList.remove("dragging");
		});

		mrtTitleContainer.addEventListener("mousemove", (e) => {
			if (!isDragging) return;
			e.preventDefault();
			const x = e.pageX - mrtTitleContainer.offsetLeft;
			const walk = (x - startX) ; // 拖動速度，可調整
			mrtTitleContainer.scrollLeft = scrollLeft - walk;
		});

		// 🔹 左右按鈕滾動
		leftArrow.addEventListener("click", () => {
			mrtTitleContainer.scrollLeft -= 100;
		});

		leftArrow.addEventListener("mousedown", () => {
			leftArrow.src = "/static/imgs/Hovered_left.png";
		});

		leftArrow.addEventListener("mouseup", () => {
			leftArrow.src = "/static/imgs/arrow left.png";
		});

		rightArrow.addEventListener("click", () => {
			mrtTitleContainer.scrollLeft += 100;
		});

		rightArrow.addEventListener("mousedown", () => {
			rightArrow.src = "/static/imgs/Hovered_right.png";
		});

		rightArrow.addEventListener("mouseup", () => {
			rightArrow.src = "/static/imgs/arrow right.png";
		});
	} catch (error) {
		console.error("錯誤：", error);
	}
}

fetchMRT();

// 初始化變數
let page = 0;
let isLoading = false;
let hasMoreData = true;
let observer;

// DOM 元素選擇器
const grid = document.querySelector(".grid");
const inputKeyword = document.querySelector(".search__input");
const searchButton = document.querySelector(".search__button");

function homePage(className) {
			const button = document.querySelector(`.${className}`); 
			if (button) {
					button.addEventListener("click", () => {
							window.location.href = "/";
					});
			} else {
					console.error(`Element with class "${className}" not found.`);
			}
	}
	homePage("header__title");

async function fetchAttractions(keyword = "") {
		// 避免重複請求或已無資料可載入
		if (isLoading || !hasMoreData) return;
		
		isLoading = true;
		
		try {
			
				let response = await fetch(`http://52.196.225.29:8000/api/attractions?page=${page}&keyword=${keyword}`);
				const data = await response.json();
				let attractions = data["data"];

				if (page === 0) {
						grid.innerHTML = "";
				}
	
				renderAttractions(attractions);
				
				if (data["nextPage"] !== null) {
						page = data["nextPage"];
				} else {
						hasMoreData = false;
				}
				
				updateObserver(keyword);
		} catch (error) {
				console.error("載入錯誤:", error);
		} finally {
				isLoading = false;
		}
}

function renderAttractions(attractions) {
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

				const id  = attraction.id
				attractionsElement.href = `http://52.196.225.29:8000/attraction/${id}`

				// 組合元素
				bottomContainer.appendChild(leftText);
				bottomContainer.appendChild(rightText);
				
				attractionsElement.appendChild(imageContainer);
				attractionsElement.appendChild(nameElement);
				attractionsElement.appendChild(bottomContainer);
				
				
				grid.appendChild(attractionsElement);
		});
}


function updateObserver(keyword) {
		// 如果沒有更多資料則不設置觀察器
		if (!hasMoreData) return;
		
		// 如果已有觀察器則斷開連接
		if (observer) observer.disconnect();
		
		// 取得最後一個元素並觀察
		let lastItem = grid.lastElementChild;
		if (lastItem) {
				observer = new IntersectionObserver(entries => {
						if (entries[0].isIntersecting && !isLoading) {
								fetchAttractions(keyword);
						}
				}, { threshold: 1 });
				
				observer.observe(lastItem);
		}
}

// 事件監聽器設置
function setupEventListeners() {
		// MRT 按鈕點擊事件
		document.querySelector(".mrt__title").addEventListener("click", (event) => {
				if (event.target.classList.contains("mrt__button")) {
						let keyword = event.target.textContent.trim();
						resetSearch();
						fetchAttractions(keyword);
				}
		});
		
		// 搜尋按鈕點擊事件
		searchButton.addEventListener("click", () => {
				performSearch();
		});
		
		// 輸入框 Enter 鍵事件
		inputKeyword.addEventListener("keypress", (event) => {
				if (event.key === "Enter") {
						performSearch();
				}
		});
}

function performSearch() {
		let keyword = inputKeyword.value.trim();
		if (keyword) {
				resetSearch();
				fetchAttractions(keyword);
		}
}

function resetSearch() {
		page = 0;
		hasMoreData = true;
}

// 設置事件監聽器
setupEventListeners();

// 初次載入
fetchAttractions();