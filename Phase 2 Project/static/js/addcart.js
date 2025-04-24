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
  init(load) {

    this.addCartElement = { 
      bookingButton: document.querySelector('.header__button--book'), 
      caetBotton: document.querySelector('#cart'), 
      cart: document.querySelector('#cartForm'), 
      date: document.querySelector('#date'), 
			reqDiv: document.querySelector('.signin__element__request')
    };
    this.load = load;
  },
  
  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      return Date.now() >= exp * 1000;
    } catch (e) {
      console.error("無效的token格式", e);
      return true; 
    }
  },

  bindBookingButton() { 
    this.addCartElement.bookingButton.addEventListener('click', () => { 
      const signinButton = document.querySelector('#signinForm'); 
      const modalOverlay = document.querySelector('.modal__overlay'); 
      const token = localStorage.getItem('token'); 

      if (!token || this.isTokenExpired(token)) { 
        signinButton.classList.add('show');
        setTimeout(()=>{
          signinButton.classList.add('animate');
        },50)
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

      if (!token || this.isTokenExpired(token)) { 
        if (this.addCartElement.date) {
          this.addCartElement.date.removeAttribute('required'); 
        }
        signinButton.classList.add('show');
        setTimeout(()=>{
          signinButton.classList.add('animate');
        },50)
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
  init(load) {
    this.load = load;
    addCartView.addCartElement.cart.addEventListener('submit', (e) => { 
      this.load.showLoadingBar();
      e.preventDefault(); 
      const addCartElement = { 
        attractionId: window.location.pathname.split('/').pop(), 
        date: addCartView.addCartElement.date.value, 
        time: addCartView.getSelectedTime(), 
        price: addCartView.getPrice(), 
        token: localStorage.getItem("token") ? localStorage.getItem("token") : null 
      }; 
      
      this.gateData(addCartElement); 
      localStorage.setItem('attractionId',addCartElement.attractionId);
      this.load.completeLoadingBar();
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
				"Authorization": `Bearer ${token}`
			}
    });
    const DataResult = await DataResponse.json();
    return DataResult;
	},

  async deleteBooking(token) {
    try{
        const deleteData = await fetch('/api/booking', {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
       const deleteResult = await deleteData.json();
       if(deleteResult.ok){
        alert('刪除成功!');
        window.location.reload();
       }
      } catch (error) {
        console.error("Error during delete:", error);
      }
  },
};

let bookingView = {
  init(load){
    this.bookingElement.bookingTitle.textContent = `你好，${this.bookingElement.username}，待預定行程如下 :`;
    this.load = load;
   },
	bookingElement :{
    main : document.querySelector('#booking'),

    //預定區塊
		bookingTitle : document.querySelector('.booking__title'),
    username : localStorage.getItem('Name'),
    bookingContainer : document.querySelector('.booking__container'),
    bookingSeparator : document.querySelector('.booking__separator'),
    delete : document.querySelector('.booking__container__delete'),
    
    //聯絡區塊
    contactTitle : document.querySelector('.booking__contact-title'),
    bookingContactSeparator : document.querySelector('.booking__contact-separator'),
    bookingContactForm : document.querySelector('.booking__contact-form'),
    

    //信用卡
    bookingPaymentTitle : document.querySelector('.booking__payment-title'),
    bookingPaymentForm : document.querySelector('.booking__payment-form'),

    //按鈕 
    bookingPay : document.querySelector('.booking__pay'),
    bookingPaymentSeparator : document.querySelector('.booking__payment-separator'),
    bookingPayContainer : document.querySelector('#booking_pay-container'),
    payTitle : document.querySelector('.booking__pay__title'),

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
    deleteBooking.classList.add('booking__container__delete');

    deleteBooking.addEventListener('click', () => {
      bookingController.deleteData(localStorage.getItem('token'));
    });
    
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
    bookingTimeElenent.textContent = time;
    bookingPriceElenent.textContent = `新台幣 ${price}`;
    bookingaddElenent.textContent = attraction.address;

    attractionNameElenent.id = 'attractionName';
    bookingDateElenent.id = 'date';
    bookingTimeElenent.id = 'time';
    bookingPriceElenent.id = 'price';
    bookingaddElenent.id = 'attractionAddress';

    bookingDateElenent.classList.add('booking__container__element');
    bookingTimeElenent.classList.add('booking__container__element');
    bookingPriceElenent.classList.add('booking__container__element');
    bookingaddElenent.classList.add('booking__container__element')
    
    this.bookingElement.bookingContainer.appendChild(containerImg);
    this.bookingElement.bookingContainer.appendChild(container);
    this.bookingElement.bookingSeparator.style.display = 'block';
    this.bookingElement.footer.style.height = '100px';

    //聯絡區塊
    let contactName = document.createElement('div');
    let contactEmail = document.createElement('div');
    let contactPhone = document.createElement('div');
    let contactText = document.createElement('div');
  
    bookingView.bookingElement.bookingContactForm.appendChild(contactName);
    bookingView.bookingElement.bookingContactForm.appendChild(contactEmail);
    bookingView.bookingElement.bookingContactForm.appendChild(contactPhone);
    bookingView.bookingElement.bookingContactForm.appendChild(contactText);

    contactName.classList.add('booking__contact__element');
    contactEmail.classList.add('booking__contact__element');
    contactPhone.classList.add('booking__contact__element');
    contactText.classList.add('booking__contact__element');

    contactName.textContent = '聯絡姓名 : ';
    contactEmail.textContent = '聯絡信箱 :';
    contactPhone.textContent = '手機號碼 :';
    contactText.textContent = '請保持手機暢通，準時到達，導覽人員將用手機與您聯繫，務必留下正確的聯絡方式。';

    let nameInput = document.createElement('input');
    let emailInput = document.createElement('input');
    let phoneInput = document.createElement('input');
    
    nameInput.type = 'text';
    emailInput.type = 'email';
    phoneInput.type = 'tel';
    phoneInput.pattern='[0-9]{3}[0-9]{3}[0-9]{4}';
    phoneInput.required=true;
    contactName.appendChild(nameInput);
    contactEmail.appendChild(emailInput);
    contactPhone.appendChild(phoneInput);

    nameInput.value = localStorage.getItem('Name')
    emailInput.value = localStorage.getItem('email');

    this.bookingElement.contactTitle.textContent = '您的聯絡資訊';
    this.bookingElement.contactTitle.classList.add('booking__title');
    this.bookingElement.bookingContactSeparator.style.display = 'block';
    

    // 信用卡
    bookingView.bookingElement.payTitle.textContent = `總價 : 新台幣 ${price}`
  },

  dataNotExists(){
    this.bookingElement.bookingContainer.classList.add('booking__title');
    this.bookingElement.bookingContainer.textContent = '目前沒有任何待預訂的行程';
    this.bookingElement.footer.style.height = '80vh';
    this.bookingElement.main.style.height = 'auto';
    this.bookingElement.bookingPay.style.height = '0px';
    this.bookingElement.bookingPaymentForm.style.display = 'none';
    this.bookingElement.bookingPayContainer.style.display = 'none';
  },

};

let bookingController = {
	init(load) {
    this.load = load;
		const bookingElement = {
			token : localStorage.getItem('token')
		};
		if(!bookingElement.token){
      window.location.href = '/'
      return;
		}
    this.load.showLoadingBar();
    this.load.skeleton(1);
		this.getData(bookingElement.token); 
    
	},

	async getData(token) {
    const data = await bookingModel.getCartData(token);
    this.checkDataExists(data);
    
	},
  
  checkDataExists(data){
    if (!data.data){
      bookingView.dataNotExists();
      this.load.completeLoadingBar();
      return;
    }else{
      let attraction = data.data.attraction
      let date = data.data.date
      let price = data.data.price
      let time = data.data.time
      bookingView.dataExists(attraction, date, price, time);
      this.load.completeLoadingBar();
    };
  },

	deleteData(token) {
    bookingModel.deleteBooking(token);
  }

};

document.addEventListener('DOMContentLoaded', function() {
  const load = new LoaderView()
	addCartView.init(load);
	addCartView.bindBookingButton();

  const pathSegments = window.location.pathname.split('/');
  if (pathSegments[1] === 'attraction') {
    addCartView.bindCartButton();
  	addCartController.init(load);
  }else if (pathSegments[1] === 'booking'){
    bookingView.init(load);
		bookingController.init(load);
	}	
});