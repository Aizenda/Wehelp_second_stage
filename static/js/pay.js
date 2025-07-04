const paymentModel = {
    buildOrder(prime, formValues) {
      const { name, email, phone, attractionId, attractionName, attractionAddress, image, date, time, price, token } = formValues;
  
      return {
        prime,
        order: {
          price,
          trip: {
            attraction: {
              id: attractionId,
              name: attractionName,
              address: attractionAddress,
              image
            },
            date,
            time
          },
          contact: {
            name,
            email,
            phone
          },
          token
        }
      };
    }
};

const paymentView = {
    getFormValues() {
      return {
        name: localStorage.getItem('Name'),
        email: localStorage.getItem('email'),
        phone: document.querySelector('input[type=tel]').value,
        attractionId: localStorage.getItem('attractionId'),
        attractionName: document.querySelector('#attractionName').textContent,
        attractionAddress: document.querySelector('#attractionAddress').textContent,
        image: document.querySelector('.booking__container__img').src,
        date: document.querySelector('#date').textContent,
        time: document.querySelector('#time').textContent.includes('早上') ? '上半天' : '下半天',
        price: document.querySelector('#price').textContent.split('新台幣 ')[1],
        token: localStorage.getItem('token')
      };
    },
  
    showError(message) {
      alert(message);
    },
  
    showSuccess(number) {
      alert("付款成功！");
      window.location.href = `/thankyou?number=${number}`;
    },
  
    setSubmitButtonState(enabled) {
      const btn = document.querySelector('.booking__pay__button');
      if (enabled) {
        btn.removeAttribute('disabled');
      } else {
        btn.setAttribute('disabled', true);
      }
    }
};

const paymentController = {
    init() {
      this.setupTapPay();
      this.bindPayButton();
    },
  
    setupTapPay() {
      TPDirect.setupSDK(159839, 'app_cBIyrT0fUpz4KwEIOiKDOpiyOxYrXWPZTEDYTpWr7t7nE0NQtbVnTBQU7wVq', 'sandbox');
  
      TPDirect.card.setup({
        fields: {
          number: { element: '#card-number', placeholder: '**** **** **** ****' },
          expirationDate: { element: '#card-expiration-date', placeholder: 'MM / YY' },
          ccv: { element: '#card-ccv', placeholder: 'ccv' }
        },
        styles: {
          'input': {
              'color': 'orange'
          },
          'input.ccv': {
              'font-size': '16px'
          },
          ':focus': {
          },
          '.valid': {
              'color': 'green'
          },
          '.invalid': {
              'color': 'red'
    
          },
          '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
          }
        }
      });
  
      TPDirect.card.onUpdate((update) => {
        paymentView.setSubmitButtonState(update.canGetPrime);
    
        updateFieldIcon('card-number', update.status.number);
        updateFieldIcon('card-expiration-date', update.status.expiry);
        updateFieldIcon('card-ccv', update.status.ccv);

        
      });

      function updateFieldIcon(fieldId, status) {
        const icon = document.getElementById(`icon-${fieldId}`);

        if (status === 2) {
          icon.textContent = '❌';
          icon.style.color = 'red';
        } else if (status === 1) {
          icon.textContent = '⏳';
          icon.style.color = 'gray';
        } else if (status === 0) {
          icon.textContent = '✅';
          icon.style.color = 'green';
        }
      }
    },
    async bindPayButton() {
        const payButton = document.querySelector('.booking__pay__button');
        payButton.addEventListener('click', async (e) => {
          e.preventDefault();
      
          const form = document.querySelector('.booking__contact-form');
          if (!form.checkValidity()) {
            form.reportValidity();
            return;
          }
      
          const tappayStatus = TPDirect.card.getTappayFieldsStatus();
          if (!tappayStatus.canGetPrime) {
            paymentView.showError('信用卡資訊無效，請重新確認');
            return;
          }
      
          TPDirect.card.getPrime(async (result) => {
            if (result.status !== 0) {
              paymentView.showError('取得 Prime 失敗');
              return;
            }
      
            try {
              const formValues = paymentView.getFormValues();
              const payload = paymentModel.buildOrder(result.card.prime, formValues);
      
              const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
      
              const data = await res.json();
      
              if (res.status === 200) {
                let number = data.data.number;
                paymentView.showSuccess(number);
              } else if (res.status === 400) {
                paymentView.showError('付款失敗');
              } else {
                paymentView.showError('發生未知錯誤');
              }
            } catch (err) {
              console.error(err);
              paymentView.showError('連線錯誤，請稍後再試');
            }
          });
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    paymentController.init();
});