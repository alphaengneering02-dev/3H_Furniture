import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {

    const [searchParams] = useSearchParams();
    const [payStatus, setPayStatus] = useState("loading");
    const [failReason, setFailReason] = useState(""); // ✅ 실패 이유 state
    const navigate = useNavigate();

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    const orderData = JSON.parse(sessionStorage.getItem("pendingOrder"));

    

    useEffect(() => {
        let ignored = false;

        const confirmPayment = async () => {
            try {
                if (ignored) return;

                await axios.get(`/payment/toss/success`, {
                    params: { paymentKey, orderId, amount }
                });

                await axios.post(`/api/order`, orderData, { withCredentials: true });

                sessionStorage.removeItem("pendingOrder");
                setPayStatus("success");

            } catch (e) {
                if (ignored) return;

                const errorMsg = e.response?.data;

                const errorMessage = typeof errorMsg === 'object' 
                        ? errorMsg?.message 
                        : errorMsg;
                const status = e.response?.status;

                // ✅ 에러 종류별 메시지
                if (errorMessage === "재고가 부족합니다.") {
                    setFailReason("죄송합니다. 해당 상품의 재고가 부족합니다.");
                } else if (status === 401) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                } else if(status === 404) {
                    
                } else if (status === 500) {
                    setFailReason("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                } else if (errorMessage) {
                    setFailReason(errorMessage);
                } else {
                    setFailReason("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
                }

                setPayStatus("fail");
            }
        };

        confirmPayment();

        return () => { ignored = true; };
    }, []);

    if (payStatus === "loading") {
        return <div><p>결제 처리 중...</p></div>;
    }

    if (payStatus === "fail") {
        return (
            <div>
                <h2>결제 실패</h2>
                <p>{failReason}</p> {/* ✅ 실패 이유 표시 */}
                <button onClick={() => navigate(`/order/${orderData?.orderItems[0]?.itemId}`)}>다시 시도</button>
                <button onClick={() => navigate("/")}>홈으로</button>
            </div>
        );
    }

    return (
        <div>
            <div>✓</div>
            <h2>{orderData?.memberName}님 결제가 완료되었습니다</h2>
            <p>{orderData?.orderItems[0]?.itemName}</p>
            <p>주문번호: {orderId?.slice(0, 8).toUpperCase()}</p> {/* ✅ () 추가 */}
            <p>배송지: {orderData?.deliveryAddr}</p>
            <p>결제금액: {Number(amount).toLocaleString()}원</p>
            <button onClick={() => navigate("/")}>홈으로</button>
        </div>
    );
}

export default PaymentSuccess;