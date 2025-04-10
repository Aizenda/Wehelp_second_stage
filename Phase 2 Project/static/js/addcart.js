let addCartModel = { 
  async createNewCart(attractionId, date, time, price, token) { 
    const instertResponse = await fetch('/api/booking', { 
      method: 'POST', 
      headers: { 
        "Content-Type": "application/json", 
      }, 
      body: JSON.stringify({ 
        attractionId: attractionId,
        date: date,
        time: time,
        price: price, 
        token: token 
      }) 
    }); 
    const instertResult = await instertResponse.json(); 
    if (instertResult.ok) { 
      window.location.href = "/booking"; 
    }else if(instertResult.error){
			alert('請先登入再進行後續操作，謝謝~')
			return;
		}
  }, 
};

let addCartView = { 
  init() {

    this.addCartElement = { 
      bookingButton: document.querySelector('.header__button--book'), 
      caetBotton: document.querySelector('#cart'), 
      cart: document.querySelector('#cartForm'), 
      date: document.querySelector('#date'), 
			reqDiv: document.querySelector('.signin__element__request')
    };
  },

  bindBookingButton() { 
    if (!this.addCartElement.bookingButton) return;
    this.addCartElement.bookingButton.addEventListener('click', () => { 
      const signinButton = document.querySelector('#signinForm'); 
      const modalOverlay = document.querySelector('.modal__overlay'); 
      const token = localStorage.getItem('token'); 

      if (!token) { 
        signinButton.classList.add('signin__content__show'); 
        modalOverlay.classList.add('modal__overlay__show'); 
				addCartView.addCartElement.reqDiv.classList.add('signin__element__request__show')
				alert('請先登入再進行後續操作，謝謝~')
        return; 
      } 
      window.location.href = "/booking"; 
    }); 
  }, 

  bindCartButton() { 
    if (!this.addCartElement.caetBotton) return;
    this.addCartElement.caetBotton.addEventListener('click', () => { 
      const signinButton = document.querySelector('#signinForm'); 
      const modalOverlay = document.querySelector('.modal__overlay'); 
      const token = localStorage.getItem('token'); 

      if (!token) { 
        if (this.addCartElement.date) {
          this.addCartElement.date.removeAttribute('required'); 
        }
        signinButton.classList.add('signin__content__show'); 
        modalOverlay.classList.add('modal__overlay__show'); 
				addCartView.addCartElement.reqDiv.classList.add('signin__element__request__show')
        return; 
      } 
    }); 
  }, 

  getSelectedTime() { 
    const times = document.querySelector("input[name='time']:checked")
    return times ? times.parentElement.textContent.trim() : null;
  }, 

  getPrice() { 
    const price = document.querySelector('#price') 
    return price ? price.textContent : null 
  } 
}

let addCartController = { 
  init() {
    
    addCartView.addCartElement.cart.addEventListener('submit', (e) => { 
      e.preventDefault(); 
      const addCartElement = { 
        attractionId: window.location.pathname.split('/').pop(), 
        date: addCartView.addCartElement.date.value, 
        time: addCartView.getSelectedTime(), 
        price: addCartView.getPrice(), 
        token: localStorage.getItem("token") ? localStorage.getItem("token") : null 
      }; 
      this.gateData(addCartElement); 
    }); 
  }, 

  gateData(addCartElement) { 
    addCartModel.createNewCart( 
      addCartElement.attractionId, 
      addCartElement.date, 
      addCartElement.time, 
      addCartElement.price, 
      addCartElement.token 
    ); 
  } 
};


//booking MVC
let bookingModel = {

	async getCartData(token){
		const DataResponse = await fetch('/api/booking' ,{
			method : "GET",
			headers : {
				"Content-Type": "application/json",
				"Authorization": `Bearer${token}`
			}
    });
    const DataResult = await DataResponse.json();
    return DataResult;
	},
};

let bookingView = {
  init(){
    this.bookingElement.bookingTitle.textContent = `你好，${this.bookingElement.username}，待預定行程如下 :`;
    this.bookingElement.contactTitle.textContent = '您的聯絡資訊';
   },
	bookingElement :{
    //預定區塊
		bookingTitle : document.querySelector('.booking__title'),
    username : localStorage.getItem('name'),
    bookingContainer : document.querySelector('.booking__container'),
    bookingSeparator : document.querySelector('.booking__separator'),
    
    //聯絡區塊
    contactTitle : document.querySelector('.booking__contact-title'),
    bookingContactSeparator : document.querySelector('.booking__contact-separator'),
    

    //信用卡
    bookingPaymentTitle : document.querySelector('.booking__payment-title'),

    footer : document.querySelector('.footer__container'),
	},
  dataExists(attraction, date, price, time){
    //預定區塊
    let containerImg = document.createElement('img');
    containerImg.src = attraction.image;
    containerImg.classList.add('booking__container__img');

    let container = document.createElement('div');
    let attractionName = document.createElement('div');
    let bookingDate = document.createElement('div');
    let bookingTime = document.createElement('div');
    let bookingPrice = document.createElement('div');
    let bookingadd = document.createElement('div');
    let deleteBooking = document.createElement('img');
    deleteBooking.src = '/static/imgs/f31984c7c73c46aaed1a7a1c9003277f.png'
    deleteBooking.classList.add('booking__container__delete')
    
    let attractionNameElenent = document.createElement('div');
    let bookingDateElenent = document.createElement('div');
    let bookingTimeElenent = document.createElement('div');
    let bookingPriceElenent = document.createElement('div');
    let bookingaddElenent = document.createElement('div');
    
  
    container.appendChild(attractionName);
    container.appendChild(bookingDate);
    container.appendChild(bookingTime);
    container.appendChild(bookingPrice);
    container.appendChild(bookingadd);
    container.appendChild(deleteBooking);
    
    attractionName.textContent = '台北一日遊 : ';
    bookingDate.textContent = '日期 : ';
    bookingTime.textContent ='時間 : ';
    bookingPrice.textContent = '費用 : ';
    bookingadd.textContent = '地點 : ';

    container.classList.add(`booking__container__grid`);
    attractionName.classList.add(`booking__container__attractionName`);
    bookingDate.classList.add('booking__container__other');
    bookingTime.classList.add('booking__container__other');
    bookingPrice.classList.add('booking__container__other');
    bookingadd.classList.add('booking__container__other');
    


    attractionName.appendChild(attractionNameElenent);
    bookingDate.appendChild(bookingDateElenent);
    bookingTime.appendChild(bookingTimeElenent);
    bookingPrice.appendChild(bookingPriceElenent);
    bookingadd.appendChild(bookingaddElenent);

    

    
    attractionNameElenent.textContent = attraction.name;
    bookingDateElenent.textContent =  date;
    bookingDateElenent.classList.add('booking__container__element');
    bookingTimeElenent.textContent = time;
    bookingTimeElenent.classList.add('booking__container__element');
    bookingPriceElenent.textContent = `新台幣 ${price}`;
    bookingPriceElenent.classList.add('booking__container__element');
    bookingaddElenent.textContent = attraction.address;
    bookingaddElenent.classList.add('booking__container__element')
    
    this.bookingElement.bookingContainer.appendChild(containerImg);
    this.bookingElement.bookingContainer.appendChild(container);
    this.bookingElement.bookingSeparator.style.display = 'block';
    this.bookingElement.footer.style.height = '100px';

    //聯絡區塊
    
    this.bookingElement.contactTitle.classList.add('booking__title');
    this.bookingElement.bookingContactSeparator.style.display = 'block';

    //信用卡


  },

  dataNotExists(){
    this.bookingElement.bookingContainer.textContent = '目前沒有任何待預訂的行程';
  },
 
};

let bookingController = {
	init() {
		const bookingElement = {
			token : localStorage.getItem('token')
		};
		if(!bookingElement.token){
			return;
		}
		this.getData(bookingElement.token);
	},

	async getData(token) {
    const data = await bookingModel.getCartData(token);
    this.checkDataExists(data);
	},
  
  checkDataExists(data){
    if (!data.data){
      bookingView.dataNotExists();
      return;
    }else{
      console.log(data)
      let attraction = data.data.attraction
      let date = data.data.date
      let price = data.data.price
      let time = data.data.time
      bookingView.dataExists(attraction, date, price, time);
    };
  },
	
};

document.addEventListener('DOMContentLoaded', function() {

	addCartView.init();
	addCartView.bindBookingButton();

  const pathSegments = window.location.pathname.split('/');
  if (pathSegments[1] === 'attraction') {
    addCartView.bindCartButton();
  	addCartController.init();
  }else if (pathSegments[1] === 'booking'){
		bookingController.init();
    bookingView.init();
	}	
});
