import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 필요에 따라 CSS 경로 수정
import '../../css/myPageCss/refund.css';

const RefundPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    // ⚡ [탭 및 라디오 선택용 상태 변수 유지]
    const [activeTab, setActiveTab] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // [페이징 상태 변수]
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 활성화된 탭 메뉴에 따라 데이터를 스위칭해오는 함수
    const fetchTabData = (tabNumber) => {
        let apiUrl = 'http://localhost:8080/Member/order/available-refund';
        if (tabNumber === 2) apiUrl = 'http://localhost:8080/Member/order/cancel-status-list';
        if (tabNumber === 3) apiUrl = 'http://localhost:8080/Member/order/exchange-status-list';

        axios.get(apiUrl, { withCredentials: true })
            .then(res => {
                setOrders(res.data || []);
                setSelectedOrder(null); // 탭 전환 시 선택 초기화
                setCurrentPage(1);      // 페이징 리셋
            })
            .catch(err => {
                console.error("데이터 로드 실패", err);
                setOrders([]);
            });
    };

    useEffect(() => {
        fetchTabData(1);
    }, []);

    const handleTabClick = (tabNumber) => {
        setActiveTab(tabNumber);
        fetchTabData(tabNumber);
    };

    // [교환 접수 DB 연동 로직 추가] 반품 규격과 동일하게 URLSearchParams로 백엔드에 교환 상태 변경 요청
    const handleExchange = (orderId, itemId) => {
        if (window.confirm(`주문번호 ${orderId}번을 교환 신청 하시겠습니까?`)) {
            const params = new URLSearchParams();
            params.append('orderId', orderId);
            
            // 조원분의 컨트롤러 설계에 맞춰 '/Member/exchange/process' 또는 합의된 교환 처리 주소로 전송
            axios.post('http://localhost:8080/Member/exchange/process', params, { withCredentials: true })
                .then(res => {
                    alert(res.data); // "교환 접수가 완료되었습니다." 응답 출력
                    
                    // 성공 즉시 프론트 메모리 상에서 실시간 데이터 갱신 마감 (EXCHANGEorREFUND)
                    setOrders(prevOrders => 
                        prevOrders.map(order => {
                            const currentId = order.orderId || order.id;
                            return currentId === orderId ? { ...order, orderState: 'EXCHANGEorREFUND' } : order;
                        })
                    );
                    setSelectedOrder(null); // 라디오 선택 초기화
                    
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
                    
                    // 💡 [인호님 기존 방식]: 성공 즉시 프론트엔드 배열 상태에서 상태 변경 및 갱신 마감 (CANCEL)
                    setOrders(prevOrders => 
                        prevOrders.map(order => {
                            const currentId = order.orderId || order.id;
                            return currentId === orderId ? { ...order, orderState: 'CANCEL' } : order;
                        })
                    );
                    setSelectedOrder(null); // 라디오 선택 초기화
                })
                .catch(err => alert("처리 중 오류 발생"))
        }
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(orders.length / itemsPerPage);

    return (
        <div className="refund-container">
            {/* 상단 탭 내비게이션 바 */}
            <div className="refund-tabs-bar">
                <button className={`refund-tab-btn ${activeTab === 1 ? 'active' : ''}`} onClick={() => handleTabClick(1)}>취소/반품/교환신청</button>
                <button className={`refund-tab-btn ${activeTab === 2 ? 'active' : ''}`} onClick={() => handleTabClick(2)}>취소처리 현황</button>
                <button className={`refund-tab-btn ${activeTab === 3 ? 'active' : ''}`} onClick={() => handleTabClick(3)}>반품/교환처리 현황</button>
            </div>

            <h2 className="refund-title">
                {activeTab === 1 ? "교환 및 반품 신청" : activeTab === 2 ? "취소 처리 현황" : "반품/교환 처리 현황"}
            </h2>

            {/* 격자형 가로 테이블 헤더 */}
            <div className="refund-table-header">
                <div className="th-select">선택</div>
                <div className="th-order-id">주문번호</div>
                <div className="th-product-name">상품명</div>
                <div className="th-price">판매단가</div>
                <div className="th-count">수량</div>
                <div className="th-subtotal">소계금액</div>
                <div className="th-status">주문현황</div>
            </div>

            <div className="refund-item-list">
                {currentOrders.length > 0 ? currentOrders.map((order) => {
                    const orderIdStr = order.orderId || order.id;
                    const isProcessing = order.orderState === 'EXCHANGEorREFUND' || order.deliveryStatus === 'PICKUP';
                    const isChecked = selectedOrder && (selectedOrder.orderId || selectedOrder.id) === orderIdStr;
                    const itemSubtotal = Number(order.orderPrice || 0) * Number(order.count || 0);

                    return (
                        <div key={orderIdStr} className="refund-item-card">
                            <div className="td-select">
                                <input 
                                    type="radio" 
                                    name="refund-select-item"
                                    checked={!!isChecked}
                                    disabled={activeTab !== 1 || isProcessing || order.orderState === 'CANCEL'}
                                    onChange={() => setSelectedOrder(order)}
                                />
                            </div>

                            <div className="td-order-id">{orderIdStr}</div>

                            <div className="td-product-name">
                                <span className="refund-product-name"><strong>{order.itemName || order.productName}</strong></span>
                                {(order.orderState === 'EXCHANGEorREFUND' || order.deliveryStatus === 'PICKUP') && (
                                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#801a24', fontWeight: 'bold' }}>
                                        [현재 접수 완료되어 {order.deliveryStatus === 'PICKUP' ? '수거 중' : '검수 중'}입니다]
                                    </p>
                                )}
                            </div>

                            <div className="td-price">{Number(order.orderPrice || 0).toLocaleString()}원</div>
                            <div className="td-count">{order.count || 0}개</div>
                            <div className="td-subtotal">{itemSubtotal.toLocaleString()}원</div>
                            
                            <div className="td-status">
                                {order.orderState === 'CANCEL' ? "취소 완료" : isProcessing ? "접수 완료" : "신청 가능"}
                            </div>
                        </div>
                    );
                }) : (
                    <p>신청 가능한 주문 내역이 없습니다.</p>
                )}
            </div>

            {/* 페이징 바 */}
            {totalPages > 1 && (
                <div className="refund-pagination-bar">
                    <button className="page-arrow-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>&lt; 이전</button>
                    <div className="page-number-group">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                            <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`page-num-btn ${currentPage === pageNumber ? 'active' : ''}`}>{pageNumber}</button>
                        ))}
                    </div>
                    <button className="page-arrow-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>다음 &gt;</button>
                </div>
            )}

            {/* 공통 하단 제어 구역 (라디오 선택 데이터를 동적으로 매핑) */}
            {activeTab === 1 && (
                <div className="refund-action-submit-zone">
                    {/* 반품 버튼 */}
                    <button 
                        className="refund-btn refund-btn-return" 
                        onClick={() => handleRefund(selectedOrder?.orderId || selectedOrder?.id)}
                    >
                        구매 취소
                    </button>
                    {/* 교환 버튼 */}
                    <button 
                        className="refund-btn refund-btn-exchange" 
                        onClick={() => handleExchange(selectedOrder?.orderId || selectedOrder?.id, selectedOrder?.itemId)}
                    >
                        교환 신청
                    </button>
                </div>
            )}
        </div>
    );
};

export default RefundPage;
