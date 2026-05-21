import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import '../../css/myPageCss/refund.css';

const RefundPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // 서버에서 주문 내역을 가져와 '취소된 내역'은 제외하고 필터링
        axios.get('http://localhost:8080/Member/mypage.do', { withCredentials: true })
            .then(res => {
                const allOrders = res.data.recentOrders || [];
                const activeOrders = allOrders.filter(order => order.orderState !== 'CANCEL');
                setOrders(activeOrders);
            })
            .catch(err => {
                console.error("데이터 로드 실패", err);
            });
    }, []);

    // [반품 로직] 유지
    const handleRefund = (orderId) => {
        if (window.confirm(`주문번호 ${orderId}번을 반품 하시겠습니까?`)) {
            const params = new URLSearchParams();
            params.append('orderId', orderId);
            axios.post('http://localhost:8080/Member/refund/process', params, { withCredentials: true })
                .then(res => {
                    alert(res.data);
                    setOrders(orders.filter(order => (order.orderId || order.id) !== orderId));
                })
                .catch(err => alert("처리 중 오류 발생"))
        }
    }

    return (
        <div className="refund-container">
            <h2 className="refund-title">교환 및 반품 신청</h2>
            <div className="refund-item-list">
                {orders.length > 0 ? orders.map((order) => (
                    <div key={order.orderId || order.id} className="refund-item-card">
                        <div className="refund-info-group">
                            <span className="refund-product-name"><strong>{order.itemName || order.productName}</strong></span>
                            <p className="refund-order-number">주문번호: {order.orderId || order.id}</p>
                        </div>
                        
                        <div className="refund-button-group">
                            {/* 교환 버튼: 상품 상세페이지로 이동 (itemId 활용) */}
                            <button 
                                className="refund-btn refund-btn-exchange"
                                onClick={() => navigate(`/item/detail/${order.itemId}`)} 
                            >
                                교환 신청
                            </button>
                            
                            {/* 반품 버튼: 기존 로직 유지 */}
                            <button 
                                className="refund-btn refund-btn-return"
                                onClick={() => handleRefund(order.orderId || order.id)} 
                            >
                                반품 접수
                            </button>
                        </div>
                    </div>
                )) : (
                    <p>신청 가능한 주문 내역이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default RefundPage;
