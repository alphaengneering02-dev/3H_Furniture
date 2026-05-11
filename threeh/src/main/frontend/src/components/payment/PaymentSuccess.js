import React, { useEffect } from 'react';
import {useSearchParams} from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess(props) {

    const TossSuccessPage = () => {

        const [serachParams] = useSearchParams();

        const paymentKey = serachParams.get("paymentKey");
        const orderId = serachParams.get("orderId");
        const amount = serachParams.get("amount");


        useEffect(() => {
        const confirmPayment = async ()=>{


        //1토스 검증
            await axios.get(`/payment/toss/success`, {
                params: { paymentKey, orderId, amount }
            });

            const orderData = JSON.parse(sessionStorage.getItem("pendingOrder"));
            await axios.post(`/order`, orderData);

            sessionStorage.removeItem("pendingOrder");
            navigator("/order/complete");
        }

        confirmPayment();
        }, [])
    }
    

    


    return (
        <div>
            success Test
        </div>
    );
}

export default PaymentSuccess;