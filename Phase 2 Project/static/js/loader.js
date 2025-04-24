class LoaderView  {
	constructor(){
		this.loadingBar = document.getElementById("loading-bar");
		this.grid = document.querySelector(".grid");
		this.sliderImage = document.querySelector(".attraction__element__image")
		this.bookingImg = document.querySelector(".booking__container")
	}

	showLoadingBar() {
		this.loadingBar.style.width = "0%";
		this.loadingBar.style.opacity = "1";
		setTimeout(() => {
			this.loadingBar.style.width = "80%";
		}, 50);
	}
	
	completeLoadingBar() {
		this.loadingBar.style.width = "100%";
		setTimeout(() => {
			this.loadingBar.style.opacity = "0";
			this.loadingBar.style.width = "0%";
		}, 500);
	}

	skeleton(num){
		const skeletonCount = num; 
		const skeletons = [];
		let pageName = window.location.href.split("/");
		if(pageName.pop() === ""){
			for (let i = 0; i < skeletonCount; i++) {
				const skeletonCard = document.createElement("div");
				skeletonCard.classList.add("attractions__element", "skeleton-card");
				this.grid.appendChild(skeletonCard);
				skeletons.push(skeletonCard);
			}
			return skeletons;
		}else if(pageName[3] === "attraction"){
			for (let i = 0; i < skeletonCount; i++) {
				this.sliderImage.classList.add("skeleton-card");
			}
		}
			
	}	
}
