import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Refund = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState([]); // 교환/반품 목록

    // 데이터 수신 로직
    useEffect(() => {
        if (location.state && location.state.orderItems) {
            setOrders(location.state.orderItems);
        } else {
            axios.get('http://localhost:8080/Member/order/list', { withCredentials: true })
                .then(res => setOrders(res.data || []))
                .catch(err => {
                    console.error("목록 로드 실패", err);
                    alert("주문 내역을 불러오는데 실패했습니다");
                });
        }
    }, [location.state]);

    // [반품 신청] 로직 
    const handleRefundProcess = (orderId) => {
        if (window.confirm(`주문번호 ${orderId}번을 정말 반품 하시겠습니까?\n이 작업은 되돌릴 수 없으며 재고가 복구됩니다.`)) {
            const params = new URLSearchParams();
            params.append('orderId', orderId);

            axios.post('http://localhost:8080/Member/refund/process', params, { withCredentials: true })
                .then(res => {
                    alert(res.data || "반품 신청이 완료되었습니다.");
                    setOrders(prevOrders => prevOrders.map(order => (order.orderId || order.id) === orderId
                    ? {...order, status:'CANCEL',orderState:'CANCEL'} //코드추가_오현옥
                    : order
                ));
                })
                .catch(err => alert("처리 중 오류가 발생했습니다"));
        }
    };

    // 안정성을 대폭 강화한 [교환 신청] 로직
    const handleExchangeProcess = (orderId) => {
        if (window.confirm(`해당 상품을 교환하시겠습니까?\n기존 주문은 취소 처리되며, 새 상품을 고르실 수 있는 페이지로 이동합니다.`)) {
            const params = new URLSearchParams();
            params.append('orderId', orderId);

            axios.post('http://localhost:8080/Member/refund/process', params, { withCredentials: true })
                .then(res => {
                    // 1. 조장님 DB 처리가 완료되었다는 메시지를 먼저 띄우고
                    alert("기존 주문 처리가 취소되었습니다. 교환하실 새 상품을 선택해 주세요!");
                    
                    // 2. 다른 페이지로 이동하기 때문에 굳이 스테이트를 먼저 지우며 락을 걸지 않고, 
                    // 즉시 확실하게 페이지 이동부터 시켜버립니다!
                    navigate('/item'); 
                })
                .catch(err => {
                    console.error("교환 처리 중 오류 발생:", err);
                    alert("교환 처리 중 오류가 발생했습니다.");
                });
        }
    };

    return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate('/mypage')} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}>
            ← 마이페이지로 돌아가기
        </button>

        <h1>교환 및 반품 신청</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
            * <strong>반품 신청</strong> 시 즉시 주문이 취소되며 해당 상품의 재고가 복구됩니다.<br />
            * <strong>교환 신청</strong> 시 기존 주문은 정리되며 새로운 상품을 선택하실 수 있도록 상품 목록 페이지로 이동합니다.
        </p>
        <hr />

        <div style={{ marginTop: '20px' }}>
            {orders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>교환 및 반품 가능한 주문 내역이 없습니다.</p>
            ) : (
                orders.map((order, index) => {
                    const currentOrderId = order.orderId || order.id;
                    const currentItemName = order.itemName || order.productName || "주문 상품";
                    //코드 추가_오현옥
                    const isCancelled = order.status === 'CANCEL'||order.orderState==='CANCEL'; // 취소 상태 확인

                    return (
                        <div key={currentOrderId || index} style={{
                            border: '1px solid #ddd',
                            padding: '20px',
                            marginBottom: '15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <div>
                                <p style={{ margin: '0 0 6px 0', color: '#555' }}><strong>주문번호:</strong> {currentOrderId}</p>
                                <p style={{ margin: '0', fontSize: '16px', color: '#111', fontWeight: 'bold' }}><strong>상품명:</strong> {currentItemName}</p>
                                {order.price && (
                                    <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#e91e63' }}>
                                        <strong>결제금액:</strong> {order.price.toLocaleString()}원 ({order.count || 1}개)
                                    </p>
                                )}
                                {/* 취소 상태 표시 */}
                                {isCancelled && (
                                    <p style={{ margin: '6px 0 0 0', color: '#e53935', fontWeight: 'bold' }}>[취소 완료된 주문입니다]</p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                {isCancelled ? (
                                    <span style={{ color: '#999', fontWeight: 'bold' }}>작업 불가</span>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleRefundProcess(currentOrderId)}
                                            style={{ backgroundColor: '#e53935', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            반품신청
                                        </button>
                                        <button 
                                            onClick={() => handleExchangeProcess(currentOrderId)}
                                            style={{ backgroundColor: '#2196F3', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            교환신청
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </div>
);
}

export default Refund;