import axios from 'axios';
import React, { useEffect, useState } from 'react';



function OrderItemInfo( { orderData, orderType }) {

   const clientKey = "test_ck_4yKeq5bgrpKLdW2mBbdBVGX0lzW6"
  

   
       useEffect(() => {
           const tossPayemnts = window.TossPayments(clientKey)
       }, [])
       
   
       const hadlePayment = async () => {
           const tossPayment = window.TossPayments(clientKey);

          

           try {
                const res = await axios.post('/payment/toss', {
                    amount: orderData?.price,
                    payType: "CARD",
                    orderName: orderData?.itemName,
                }, { withCredentials: true });

                const orderId = res.data.orderId;

                sessionStorage.setItem("pendingOrder", JSON.stringify({
                    memberId: orderData?.memberId,
                    orderItems: [{ itemId: orderData?.itemId, count: 1 }],
                    deliveryAddr: orderData?.defaultAddr,
                    deliveryAddrDetail: orderData?.defaultAddrDetail,
                    zipCode: orderData?.defaultZipCode,
                    orderType: orderType
                }));

                tossPayment.requestPayment('CARD', {
                    amount: orderData?.price,
                    orderId: orderId,
                    orderName: orderData?.itemName,
                    customerName: orderData?.memberName,
                    customerEmail: orderData?.email,
                    successUrl: "http://localhost:3000/payment/toss/success",
                    failUrl: 'http://localhost:3000/payment/toss/fail'
                });

            } catch (error) {
                if (error) {
                    alert("결제에 실패했습니다.")
                } else {
                    console.log(error);
                }
            }
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