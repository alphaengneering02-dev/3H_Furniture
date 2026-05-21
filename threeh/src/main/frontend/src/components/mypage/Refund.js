import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 필요에 따라 CSS 경로 수정
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

    // ⚡ [교환 접수 DB 연동 로직 추가] 반품 규격과 동일하게 URLSearchParams로 백엔드에 교환 상태 변경 요청
    const handleExchange = (orderId, itemId) => {
        if (window.confirm(`주문번호 ${orderId}번을 교환 신청 하시겠습니까?`)) {
            const params = new URLSearchParams();
            params.append('orderId', orderId);
            
            // 조원분의 컨트롤러 설계에 맞춰 '/Member/exchange/process' 또는 합의된 교환 처리 주소로 전송
            axios.post('http://localhost:8080/Member/exchange/process', params, { withCredentials: true })
                .then(res => {
                    alert(res.data); // "교환 접수가 완료되었습니다." 응답 출력
                    
                    // DB 연동이 성공하면 화면의 해당 상품 카드를 즉시 접수 완료(처리중) UI로 갱신하기 위해 상태값 리프레시
                    setOrders(prevOrders => 
                        prevOrders.map(order => 
                            (order.orderId === orderId || order.id === orderId)
                                ? { ...order, orderState: 'EXCHANGEorREFUND' }
                                : order
                        )
                    );
                    
                    // 기존 기획대로 사용자가 옵션을 새로 선택할 수 있게 상품 상세페이지로 최종 강제 이동
                    navigate(`/item/detail/${itemId}`);
                })
                .catch(err => {
                    console.error("교환 신청 오류:", err);
                    alert("처리 중 오류 발생");
                });
        }
    }

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
                            
                            {/* 이미 접수된 주문의 경우 현재 배송 상태를 한글로 가이드해주는 서브 텍스트 라벨 */}
                            {(order.orderState === 'EXCHANGEorREFUND' || order.deliveryStatus === 'PICKUP') && (
                                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#801a24', fontWeight: 'bold' }}>
                                    [현재 접수 완료되어 {order.deliveryStatus === 'PICKUP' ? '수거 중' : '검수 중'}입니다]
                                </p>
                            )}
                        </div>
                        
                        <div className="refund-button-group">
                            {/* 이미 교환/반품 처리 중인 상품은 중복 접수가 불가능하도록 처리 */}
                            {order.orderState === 'EXCHANGEorREFUND' || order.deliveryStatus === 'PICKUP' ? (
                                <button 
                                    className="refund-btn"
                                    disabled
                                    style={{ backgroundColor: '#eeeeee', color: '#999999', border: '1px solid #ddd', width: '100%', cursor: 'default' }}
                                >
                                    접수 완료 (처리중)
                                </button>
                            ) : (
                                <>
                                    {/* 교환 버튼: 이제 클릭 시 handleExchange 함수를 타고 백엔드 DB 연동 후 상세페이지로 이동합니다 */}
                                    <button 
                                        className="refund-btn refund-btn-exchange"
                                        onClick={() => handleExchange(order.orderId || order.id, order.itemId)} 
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
                                </>
                            )}
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
