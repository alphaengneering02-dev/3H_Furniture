import React, { useEffect, useState } from 'react';


function OrderItemInfo( { orderData }) {

   const clientKey = "test_ck_4yKeq5bgrpKLdW2mBbdBVGX0lzW6"
   
       useEffect(() => {
           const tossPayemnts = window.TossPayments(clientKey)
       }, [])
       
   
       const hadlePayment = () => {
           const tossPayment = window.TossPayments(clientKey);
   
           tossPayment.requestPayment('CARD', {
               amount: 50000 ,//orderData?.price,
               orderId: 'bec1d544-2a34-4f44-ada0-c5213d8fd8dd',
               orderName: '상품결제', //orderData?.itemName,
               customerName : '첫번째', //orderData?.memberName,
               customerEmail: 'test@emial', //orderData?.email,
               successUrl: "http://localhost:8080/payment/toss/success",
               failUrl: 'http://localhost:8080/payment/toss/fail'
           });
       };

    return (
        <div>
            <div>

                <div>
                    <img src={orderData?.itemIamge} />
                    <p>{orderData?.itemIamge}</p>
                    <p>{orderData?.itemName}</p>
                    <p>{orderData?.price}</p>
                    <p>{orderData?.itemDetail}</p>
                </div>
            
                <div>
                    <button id='paymentButton' onClick={hadlePayment}>결제하기</button>
                </div>
            </div>
        </div>
    );
}

export default OrderItemInfo;