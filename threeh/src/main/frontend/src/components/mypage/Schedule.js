import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hook/useToast';
import { ToastContainer, toast } from "react-toastify";

const Schedule = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    const { success, error, warn, info } = useToast();

    // 반품 리펀드 페이지로 이동
    const moveToRefund = (orderId) => {
        navigate(`/refund?orderId=${orderId}`);
    };

    // 주문 목록 가져오기
    useEffect(() => {
        axios.get('http://localhost:8080/Member/order/list', { withCredentials: true })
            .then(res => setOrders(res.data))
            .catch(err => console.error("데이터 로드 실패:", err));
    }, []);

    // 구매 확정 API 호출
    const handleConfirm = (orderId) => {
        axios.post(`http://localhost:8080/purchase/confirm?orderId=${orderId}`, {}, { withCredentials: true })
            .then(() => {
                alert('구매가 확정되었습니다.');
                window.location.reload(); // 새로고침으로 상태 업데이트
            })
            .catch(err => alert('확정 실패: ' + err.message));
    };

    // 반품 신청 API 호출 (이 로직은 필요 없으면 지워도 됩니다)
    const handleRefund = (orderId) => {
        if (!window.confirm('정말 반품하시겠습니까?')) return;
        
        axios.post(`http://localhost:8080/refund/process?orderId=${orderId}`, {}, { withCredentials: true })
            .then(() => {
                alert('반품 처리가 완료되었습니다.');
                window.location.reload();
            })
            .catch(err => alert('반품 실패: ' + err.message));
    };

    return (
        <div className="schedule-container" style={{ padding: '20px' }}>
            <h2>구매 확정된 내역</h2>
            {orders
                // [조장님 지시] 확정된(PURCHASED) 주문만 필터링하여 보여줌
                .filter(order => order.orderState === 'PURCHASED')
                .map(order => (
                    <div key={order.orderId} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px' }}>
                        <p>주문번호: {order.orderId}</p>
                        <p>상태: <strong>{order.orderState}</strong></p>
                        <p style={{ color: 'green' }}>구매가 확정된 상품입니다.</p>
                    </div>
                ))
            }
        </div>
    );
};

export default Schedule;