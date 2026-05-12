import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {

    const [searchParams] = useSearchParams();
    const [payStatus, setPayStatus] = useState("loading");
    const navigate = useNavigate();

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    useEffect(() => {
        const confirmPayment = async () => {
            try {
                await axios.get(`/payment/toss/success`, {
                    params: { paymentKey, orderId, amount }
                });

                const orderData = JSON.parse(sessionStorage.getItem("pendingOrder"));
                console.log("orderData:", orderData);
                await axios.post(`/order`, orderData);

                sessionStorage.removeItem("pendingOrder");
                setPayStatus("success");

            } catch (e) {
                console.log(e);
                setPayStatus("fail");
            }
        };

        confirmPayment();
    }, []);

    if (payStatus === "loading") {
        return <div><p>결제 처리 중...</p></div>;
    }

    if (payStatus === "fail") {
        return (
            <div>
                <h2>결제 실패</h2>
                <button onClick={() => navigate("/")}>홈으로</button>
            </div>
        );
    }

    return (
        <div>
            <div>✓</div>
            <h2>결제가 완료되었습니다</h2>
            <p>주문번호: {orderId}</p>
            <p>결제금액: {Number(amount).toLocaleString()}원</p>
            <button onClick={() => navigate("/")}>홈으로</button>
        </div>
    );
}

export default PaymentSuccess;