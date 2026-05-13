import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';



function OrderItemInfo( { orderData, orderType, zipCode, address, deliveryDate, detailedAddress }) {

   const clientKey = "test_ck_4yKeq5bgrpKLdW2mBbdBVGX0lzW6"
  
    const isLoadingRef = useRef(false);
    const navigate = useNavigate();
      
       
   
       const hadlePayment = async () => {
           

           if(isLoadingRef.current) return; 

           if(!orderType) {
                alert("배송 및 설치 방법을 선택하세요");
                return;
           }

           if(!address) {
                alert("주소를 입력해주세요");
                return;
           }

           if(!deliveryDate){
                alert("배송 희망 날짜를 선택해주세요");
                return;
           }

           isLoadingRef.current = true;

          const tossPayment = window.TossPayments(clientKey);

           try {
                const res = await axios.post('/payment/toss', {
                    amount: orderData?.price,
                    payType: "CARD",
                    orderName: orderData?.itemName,
                }, { withCredentials: true });

                const orderId = res.data.orderId;

                console.log("orderData 전체:", orderData);

                const user = JSON.parse(sessionStorage.getItem("user"));

                sessionStorage.setItem("pendingOrder", JSON.stringify({
                    memberId: user.memberId,
                    memberName: user.name,
                    orderItems: [{ 
                        itemId: orderData?.itemId, 
                        itemName: orderData?.itemName, 
                        count: 1
                    }],
                    deliveryAddr: address,
                    deliveryAddrDetail: detailedAddress,
                    zipCode: zipCode,
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
                const status = error.response?.status;

                if (status === 401) {
                    alert("로그인이 필요한 서비스입니다.");
                    navigate("/login"); // 로그인 페이지로
                } else if (status === 500) {
                    alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                } else {
                    alert("결제에 실패했습니다. 다시 시도해주세요.");
                }
            } finally {
                isLoadingRef.current = false;
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