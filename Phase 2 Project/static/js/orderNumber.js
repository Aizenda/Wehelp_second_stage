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
        orderNummber:document.querySelector('.thank__element-orderNummber'),
    },
    showOrderNumber(orderNumber){
        this.element.orderNummber.textContent = orderNumber;
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
        let orderNumber = data.data.data.number;
        orderNumberview.showOrderNumber(orderNumber);

    }
}
orderNumberController.init()