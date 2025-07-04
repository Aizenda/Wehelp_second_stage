const orderNumberModel = {
    async getOrdrNumder(number){
        let res = await fetch(`/api/order/${number}`,{
            method:"GET",
            headers:{
                'Content-Type': 'application/json'
            }
        });
        return await res.json();
    }
}

const orderNumberview = {
    element :{
        attractionImg:document.querySelector('.arraction__img'),
        attractionName:document.querySelector('.attraction__name'),
        paymentNumber:document.querySelector('.payment__number'),
        attractionPrice:document.querySelector('.attraction__price'),
        paymenStatus:document.querySelector('.attraction__status')
    },
    showOrderNumber(data){
        console.log(data.data.data)
        this.element.attractionImg.src = data.data.data.trip.attraction.image.match(/https?:\/\/[^\s"]+/)[0];
        this.element.attractionName.textContent = data.data.data.trip.attraction.name;
        this.element.paymentNumber.textContent = data.data.data.number;
        this.element.attractionPrice.textContent = data.data.data.price;
        this.element.paymenStatus.textContent = data.data.data.status === 0 ? "付款成功" : "付款失敗"; 
    }
    

}   

const orderNumberController = {
    init(){
        const params = new URLSearchParams(window.location.search);
        const number = params.get("number");
        this.getToken();
        this.getData(number);
    },
    getToken(){

        if(!localStorage.getItem('token')){
            location.href = '/';
            return;
        };
    },
    async getData(number) {
        const data = await orderNumberModel.getOrdrNumder(number); 
        orderNumberview.showOrderNumber(data);

    }
}
orderNumberController.init()