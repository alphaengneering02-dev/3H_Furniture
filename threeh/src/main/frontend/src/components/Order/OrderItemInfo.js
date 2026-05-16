import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUrl } from '../../utils/BackendPath';



function OrderItemInfo( { orderData, orderType, zipCode, address, deliveryDate, detailedAddress, isCartOrder }) {

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

          // 1. 단건/ 장바구니 분기 계산
           const isActuallyCart = orderData?.items && orderData?.items.length > 0;

           console.log("넘어온 데이터", orderData)
           
           const calculatedAmount = isActuallyCart
                    ? orderData.items?.reduce((acc, item) => acc + (item.price * item.count), 0)
                    : (orderData?.price || 0);

           

           const calculatedOrderName = isActuallyCart
            ? (orderData.items.length > 1 
                ? `${orderData.items[0].itemName} 외 ${orderData.items.length - 1}건` 
                : orderData.items[0].itemName)
            : (orderData?.itemName || "상품 결제");

            console.log("=== 계산된 최종 금액 ===", calculatedAmount);
            console.log("=== 계산된 최종 주문명 ===", calculatedOrderName);

           isLoadingRef.current = true;

          const tossPayment = window.TossPayments(clientKey);

          const requestPayload = {
            amount: calculatedAmount,       // 이 값이 진짜 숫자로 잘 채워졌는지?
            payType: "CARD",                // 백엔드 DTO 필드명과 일치하는지?
            orderName: calculatedOrderName, // null이나 빈 문자열이 아닌지?
        };

          console.log("최종 페이로드 ====", requestPayload)

           try {
                const res = await axios.post('/api/payment/toss', {
                    amount: calculatedAmount,
                    payType: "CARD",
                    orderName: calculatedOrderName,
                }, { withCredentials: true });

                const orderId = res.data.orderId;

                console.log("orderData 전체:", orderData);

                const user = JSON.parse(sessionStorage.getItem("user"));
                
                if(!user){
                    navigate("/login");
                    return;
                }

                 const orderItems = isActuallyCart
                ? orderData.items.map(item => ({
                    itemId : item.itemId,
                    itemName : item.itemName,
                    count: item.count
                }))
                : [{
                    itemId : orderData?.itemId,
                    itemName : orderData?.itemName,
                    count : 1
                }]

                sessionStorage.setItem("pendingOrder", JSON.stringify({
                    memberId: user.memberId,
                    memberName: user.name,
                    orderItems:orderItems,
                    deliveryAddr: address,
                    deliveryAddrDetail: detailedAddress,
                    zipCode: zipCode,
                    orderType: orderType
                }));

                

                tossPayment.requestPayment('CARD', {
                    amount: calculatedAmount,
                    orderId: orderId,
                    orderName: calculatedOrderName,
                    customerName: orderData?.memberName,
                    customerEmail: orderData?.email,
                    successUrl: "http://localhost:3000/payment/toss/success",
                    failUrl: 'http://localhost:3000/payment/toss/fail'
                });

            } catch (error) {
                const status = error.response?.status;

                if (error.response && error.response.data) {

                    const errorMessage = typeof error.response.data === 'string' 
                    ? error.response.data 
                    : (error.response.data.message || error.response.data.error || "결제 요청 중 오류가 발생했습니다.");
                    alert(`결제 실패: ${errorMessage}`);
                    
                } else if (status === 400) {
                    alert("로그인이 필요한 서비스입니다.");
                    navigate("/login"); // 로그인 페이지로
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

                    {orderData?.items && orderData.items.length > 0 ? (
                    orderData.items.map((item, index) => (
                        <div key={item.itemId || index}>
                            <img src={getUrl(item.itemImage)} alt={item.itemName} style={{ width: '100px' }} /> 
                            <p>상품명: {item.itemName}</p>
                            <p>가격: {item.price}원 (수량: {item.count}개)</p>
                            <p>설명: {item.itemDetail}</p>
                        </div>
                    ))
                ) : orderData?.itemId ? (
                   
                    <div>
                     
                        <img src={getUrl(orderData?.itemImage)} alt={orderData.itemName} /> 
                        <p>상품명: {orderData.itemName}</p>
                        <p>가격: {orderData.price}원</p> 
                        <p>설명: {orderData.itemDetail}</p>
                    </div>
                ) : (
                    <p>주문할 상품 정보가 없습니다.</p>
                )}

                
                <div>
                    <h3>
                        총 주문 금액: {
                            orderData?.items && orderData.items.length > 0
                                ? orderData.items.reduce((acc, item) => acc + (item.price * item.count), 0).toLocaleString()
                                : (orderData?.price || 0).toLocaleString() 
                        }원
                    </h3>
                </div>
            
                <div>
                    <button id='paymentButton' onClick={hadlePayment}>결제하기</button>
                </div>
            </div>
        </div>
    );
}

export default OrderItemInfo;