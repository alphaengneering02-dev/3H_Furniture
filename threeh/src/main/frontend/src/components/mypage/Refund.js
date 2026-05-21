import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 필요에 따라 CSS 경로 수정
import '../../css/myPageCss/reFund.Css'; 

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
        <div className="refund-page-container" style={{ padding: '20px' }}>
            <h2 className="info-section-title">교환 및 반품 신청</h2>
            <div className="info-data-block" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                {orders.length > 0 ? orders.map((order) => (
                    <div key={order.orderId || order.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span><strong>{order.itemName || order.productName}</strong></span>
                            <p style={{ fontSize: '12px', color: '#666' }}>주문번호: {order.orderId || order.id}</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {/* 교환 버튼: 상품 상세페이지로 이동 (itemId 활용) */}
                            <button 
                                onClick={() => navigate(`/item/detail/${order.itemId}`)} 
                                style={{ backgroundColor: '#ff9800', color: '#fff', border: 'none', padding: '8px 15px', cursor: 'pointer' }}
                            >
                                교환 신청
                            </button>
                            
                            {/* 반품 버튼: 기존 로직 유지 */}
                            <button 
                                onClick={() => handleRefund(order.orderId || order.id)} 
                                style={{ backgroundColor: '#f44336', color: '#fff', border: 'none', padding: '8px 15px', cursor: 'pointer' }}
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