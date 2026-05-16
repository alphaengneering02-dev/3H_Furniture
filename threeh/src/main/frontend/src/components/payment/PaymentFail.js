import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function PaymentFail({failReason, finalOrderData} ) {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const errorCode = searchParams.get("code") || "UNKNOW_ERROR";
    const errorMessage = searchParams.get("message") || "결제 중 알 수 없는 오류가 발생했습니다.";

    return (
            <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>결제 실패</h2>
            
            
            <p style={{ color: "red", fontSize: "16px", fontWeight: "bold" }}>
                {failReason ? failReason : `${errorMessage} (${errorCode})`}
            </p> 

            <div style={{ marginTop: "20px" }}>
                <button 
                    onClick={() => navigate(`/item`)}
                    style={{ marginRight: "10px", padding: "8px 16px" }}
                >
                    다시 시도
                </button>
                <button 
                    onClick={() => navigate("/")}
                    style={{ padding: "8px 16px" }}
                >
                    홈으로
                </button>
            </div>
        </div>
    );
}

export default PaymentFail;