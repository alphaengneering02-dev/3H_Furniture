import React, { useEffect, useState } from 'react';


function OrderItemInfo( { orderData }) {

   const clientKey = "test_ck_4yKeq5bgrpKLdW2mBbdBVGX0lzW6"
   
       useEffect(() => {
           const tossPayemnts = window.TossPayments(clientKey)
       }, [])
       
   
       const hadlePayment = () => {
           const tossPayment = window.TossPayments(clientKey);

           sessionStorage.setItem("pendingOrder", JSON.stringify({
                
                memberId: orderData?.memberId,
                orderItems: [{ itemId: orderData?.itemId, count: 1}],
                deliveryAddr: orderData?.deliveryAddr,
                deliveryAddrDeatil : orderData?.defaultAddr,
                zipcode: orderData?.defaultZipCode,
                orderType: "ONLINE"

           }));
   
           tossPayment.requestPayment('CARD', {
               amount: orderData?.price,
               orderId: 'bec1d544-2a34-4f44-ada0-c5213d8fd8dd',
               orderName: orderData?.itemName,
               customerName : orderData?.memberName,
               customerEmail: orderData?.email,
               successUrl: "http://localhost:3000/payment/toss/success",
               failUrl: 'http://localhost:3000/payment/toss/fail'
           });
       };

    return (
        <div>
            <div>

                <div>
                    <img src={orderData?.itemIamge} />
                    
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