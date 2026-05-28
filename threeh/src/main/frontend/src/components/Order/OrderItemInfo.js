import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUrl } from '../../utils/BackendPath';
import '../../css/orderPageCss/orderPage.css';
import { useToast } from '../../hook/useToast';



function OrderItemInfo( { orderData, orderType, zipCode, address, deliveryDate, detailedAddress, isCartOrder }) {

   const clientKey = "test_ck_4yKeq5bgrpKLdW2mBbdBVGX0lzW6"
  
    const isLoadingRef = useRef(false);
    const navigate = useNavigate();

    const { success, error, warn, info} = useToast();
      
       
   
       const hadlePayment = async () => {
           
        
           if(isLoadingRef.current) return; 

          

           if(!orderType) {
                warn("배송 및 설치 방법을 선택하세요");
                return;
           }

           if(!address) {
                warn("주소를 입력해주세요");
                return;
           }

           if(!deliveryDate){
                warn("배송 희망 날짜를 선택해주세요");
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
                    return null;
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

            } catch (err) {
                const status = err.response?.status;

                if (err.response && err.response.data) {

                    const errorMessage = typeof err.response.data === 'string' 
                    ? err.response.data 
                    : (err.response.data.message || err.response.data.error || "결제 요청 중 오류가 발생했습니다.");
                    error(`결제 실패: ${errorMessage}`);
                    
                } else if (status === 400) {
                    warn("로그인이 필요한 서비스입니다.");
                    navigate("/login"); // 로그인 페이지로
                } else {
                    error("결제에 실패했습니다. 다시 시도해주세요.");
                }
            } finally {
                isLoadingRef.current = false;
            }
       };

    return (
        <>
                {/* 1. 상품 정보 섹션 블록 */}
                <div className="order-section-block">
                    {/* 까사미아 스타일의 굵은 상단선 헤더 */}
                    <div className="order-section-header">
                    <h3 className="order-section-title">
                        상품 정보 ({orderData?.items && orderData.items.length > 0 ? `${orderData.items.length}건` : '1건'})
                    </h3>
                    <span className="order-delivery-notice-tag">배송일 지정 필수</span>
                    </div>

                    <div className="order-section-body">
                    {/* 수도권 외 외곽 지역 안내 문구 바 */}
                    <div className="order-alert-banner">
                        <i className="info-icon">i</i> 수도권 외 일부 지역은 지정 요일에만 배송되며, 선택하신 일자에 배송이 어려울 수 있습니다.
                    </div>

                    {/* 상품 리스트 렌더링 영역 */}
                    <div className="order-items-list">
                        {orderData?.items && orderData.items.length > 0 ? (
                        orderData.items.map((item, index) => (
                            <div className="order-item-card" key={item.itemId || index}>
                            <div className="order-item-thumb-box">
                                <img src={getUrl(item.itemImage)} alt={item.itemName} className="order-item-img"/>
                            </div>
                            <div className="order-item-info-box">
                                <div className="order-item-brand">3H 오리지널</div>
                                <h4 className="order-item-name">{item.itemName}</h4>
                                <p className="order-item-option">설명: {item.itemDetail}</p>
                                <div className="order-item-price-qty">
                                <span className="order-item-qty">수량 : {item.count}개</span>
                                <span className="order-item-price">{(item.price * item.count).toLocaleString()}원</span>
                                </div>
                            </div>
                            </div>
                        ))
                        ) : orderData?.itemId ? (
                        <div className="order-item-card">
                            <div className="order-item-thumb-box">
                            <img src={getUrl(orderData?.itemImage)} alt={orderData.itemName} className="order-item-img"/>
                            </div>
                            <div className="order-item-info-box">
                            <div className="order-item-brand">3H 오리지널</div>
                            <h4 className="order-item-name">{orderData.itemName}</h4>
                            <p className="order-item-option">설명: {orderData.itemDetail}</p>
                            <div className="order-item-price-qty">
                                <span className="order-item-qty">수량 : 1개</span>
                                <span className="order-item-price">{(orderData.price || 0).toLocaleString()}원</span>
                            </div>
                            </div>
                        </div>
                        ) : (
                        <div className="order-item-empty">
                            <p>주문할 상품 정보가 없습니다.</p>
                        </div>
                        )}
                    </div>
                    </div>
                </div> 

                {/* 2. 최종 결제 금액 및 결제 버튼 블록 (상품 블록 외부에 독립적으로 위치) */}
                <div className="order-summary-block">
                    <div className="order-summary-row">
                    <span className="order-summary-label">최종 결제금액</span>
                    <span className="order-summary-value-total">
                        {orderData?.items && orderData.items.length > 0
                        ? orderData.items.reduce((acc, item) => acc + (item.price * item.count), 0).toLocaleString()
                        : (orderData?.price || 0).toLocaleString()
                        }원
                    </span>
                    </div>
                    
                    <div className="order-submit-box">
                    <button className="order-payment-btn" id="paymentButton" onClick={hadlePayment}>
                        결제하기
                    </button>
                    </div>
                </div>
                </>
    );
}

export default OrderItemInfo;