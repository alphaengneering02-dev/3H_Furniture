import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

function PaymentFail({failReason, finalOrderData} ) {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const errorCode = searchParams.get("code") || "UNKNOW_ERROR";
    const errorMessage = searchParams.get("message") || "결제 중 알 수 없는 오류가 발생했습니다.";

    if(!failReason) return "서버에 오류가 생겼습니다 다시 시도해주세요";

    return (
        <Box sx={{ padding: "20px", textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>결제 실패</Typography>
            <Typography color="error" sx={{ fontSize: "16px", fontWeight: "bold", my: 2 }}>
                결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </Typography>

            <Box sx={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: 2 }}>
                <Button variant="contained" onClick={() => navigate("/item")}>
                    다시 시도
                </Button>
                <Button variant="outlined" onClick={() => navigate("/")}>
                    홈으로
                </Button>
            </Box>
        </Box>
    );
}

export default PaymentFail;