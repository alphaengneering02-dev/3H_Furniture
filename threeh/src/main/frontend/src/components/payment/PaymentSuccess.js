import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PaymentFail from './PaymentFail';
import { LinearProgress, Box, Typography, CircularProgress } from '@mui/material';
import '../../css/paymentCss/payment.css';
import { useToast } from '../../hook/useToast';

function PaymentSuccess() {

    const [searchParams] = useSearchParams();
    const [finalOrderData, setFinalOrderData] = useState(null);
    const [payStatus, setPayStatus] = useState("loading");
    const [failReason, setFailReason] = useState(""); 
    const navigate = useNavigate();

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    const user = JSON.parse(sessionStorage.getItem("user"));

    const { success, error, warn, info } = useToast(); 

    useEffect(() => {
        let ignored = false;

        const confirmPayment = async () => {

            const savedSuccessData = JSON.parse(sessionStorage.getItem("successOrderData"));

            if(savedSuccessData){
                if (!ignored) {
                setFinalOrderData(savedSuccessData);
                setPayStatus("success");
                }
                return;
            }

            const orderData = JSON.parse(sessionStorage.getItem("pendingOrder"));

            if(!user) {
                    info("로그인을 다시해주세요.");
                    navigate("/login");
            }
            

            console.log("세션스토리지 전체:", sessionStorage); // 세션에 뭐가 들어있는지 전체 출력
            console.log("파싱된 데이터:", orderData);

            if (!orderData) {
                console.error("주문 데이터가 없습니다!");
                navigate("/payment/fail");
                return ;
            }
            try {
                if (ignored) return;

                console.log(amount);
                
                await axios.get(`/api/payment/toss/success`, {
                    params: { paymentKey, orderId, amount }
                });

               

                await axios.post(`/api/order`, orderData, { withCredentials: true });

                if (!ignored) {
                
                    setFinalOrderData(orderData); 

                    sessionStorage.setItem("successOrderData", JSON.stringify(orderData));

                    sessionStorage.removeItem("pendingOrder");
                    setPayStatus("success");
                }

                
                //debugger;

            } catch (e) {
                if (ignored) return;

                const errorMsg = e.response?.data;

                const errorMessage = typeof errorMsg === 'object' 
                        ? errorMsg?.message 
                        : errorMsg;
                const status = e.response?.status;

                
                if (errorMessage === "재고가 부족합니다.") {
                    setFailReason("죄송합니다. 해당 상품의 재고가 부족합니다.");
                } else if (status === 401) {
                    setFailReason("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
                    return;
                } else if(status === 404) {
                    setFailReason("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
                } else if (status === 500) {
                    setFailReason("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                } else if (errorMessage) {
                    setFailReason(errorMessage);
                } 
                else {
                    setFailReason("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
                }

                setPayStatus("fail");
            }
        };

        confirmPayment();

        return () => { ignored = true; };
    }, []);

    if (payStatus === "loading") {
        return (
            <Box sx={{ width: '100%' }}>
                <Typography mb={1}>결제 처리 중...</Typography>
                <CircularProgress />
            </Box>
        );
    }

    if (payStatus === "fail") {
        return <PaymentFail failReason={failReason} finalOrderData={finalOrderData}/>;
    }

    return (
        <div className='payment-wrapper'>
            
            <div className='payment-checklogo'>✓</div>
            <h2 className='payment-headline'>{finalOrderData?.memberName}님 결제가 완료되었습니다</h2>
            <p className='payment-label'>상품명:{finalOrderData?.orderItems[0]?.itemName}
                {finalOrderData?.orderItems?.length > 1
                ? ` 외 ${finalOrderData.orderItems.length-1}개`
                : ""
            }
            </p>
            <p className='payment-label'>주문번호: {orderId?.slice(0, 8).toUpperCase()}</p>
            <p className='payment-label'>배송지: {finalOrderData?.deliveryAddr}</p>
            <p className='payment-label'>결제금액: {Number(amount).toLocaleString()}원</p>
            <button className='payment-btn' onClick={() => { 
                sessionStorage.removeItem("successOrderData");
                navigate("/")}}>홈으로</button>
        </div>
    );
}

export default PaymentSuccess;