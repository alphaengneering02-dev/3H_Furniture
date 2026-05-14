import React from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentFail(failReason, finalOrderData) {

    const navigate = useNavigate();

    return (
            <div>
                <h2>결제 실패</h2>
                <p>{failReason}</p> 
                <button onClick={() => navigate(`/order/${finalOrderData?.orderItems[0]?.itemId}`)}>다시 시도</button>
                <button onClick={() => navigate("/")}>홈으로</button>
            </div>
    );
}

export default PaymentFail;