import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/myPageCss/refund.css';

const RefundPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    // ⚡ 부조장님 피드백 반영: 2대 대형 탭 구조
    const [activeTab, setActiveTab] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // 📊 페이징 상태 변수
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 🔄 탭 메뉴에 따라 데이터를 스위칭해오는 함수
    const fetchTabData = (tabNumber) => {
        let apiUrl = 'http://localhost:8080/Member/order/available-refund'; 
        if (tabNumber === 2) {
            apiUrl = 'http://localhost:8080/Member/order/exchange-status-list'; 
        }

        axios.get(apiUrl, { withCredentials: true })
            .then(res => {
                setOrders(res.data || []);
                setSelectedOrder(null);
                setCurrentPage(1);
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

    // [교환 접수 DB 연동 로직]
    const handleExchange = (orderId, itemId) => {
        if (window.confirm(`주문번호 ${orderId}번을 교환 신청 하시겠습니까?`)) {
            const params = new URLSearchParams();
            params.append('orderId', orderId);
            
            axios.post('http://localhost:8080/Member/exchange/process', params, { withCredentials: true })
                .then(res => {
                    alert(res.data);
                    
                    setOrders(prevOrders => 
                        prevOrders.map(order => {
                            const currentId = order.orderId || order.id;
                            return currentId === orderId ? { ...order, orderState: 'EXCHANGEorREFUND' } : order;
                        })
                    );
                    setSelectedOrder(null);
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
        if (window.confirm(`주문번호 ${orderId}번을 반품 신청 하시겠습니까?`)) {
            const params = new URLSearchParams();
            params.append('orderId', orderId);
            axios.post('http://localhost:8080/Member/refund/process', params, { withCredentials: true })
                .then(res => {
                    alert(res.data);
                    
                    setOrders(prevOrders => 
                        prevOrders.map(order => {
                            const currentId = order.orderId || order.id;
                            return currentId === orderId ? { ...order, orderState: 'CANCEL' } : order;
                        })
                    );
                    setSelectedOrder(null);
                })
                .catch(err => alert("처리 중 오류 발생"))
        }
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // 💡 통합 필터링 매커니즘
    const filteredOrders = orders.filter(order => {
        if (activeTab === 1) return order.orderState !== 'CANCEL' && order.orderState !== 'EXCHANGEorREFUND';
        return order.orderState === 'CANCEL' || order.orderState === 'EXCHANGEorREFUND';
    });

    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    return (
        <div className="refund-container">
            {/* 📋 2대 대형 탭바 */}
            <div className="refund-tabs-bar">
                <button className={`refund-tab-btn ${activeTab === 1 ? 'active' : ''}`} onClick={() => handleTabClick(1)}>반품/교환 신청</button>
                <button className={`refund-tab-btn ${activeTab === 2 ? 'active' : ''}`} onClick={() => handleTabClick(2)}>반품/교환처리 현황</button>
            </div>

            <h2 className="refund-title">
                {activeTab === 1 ? "반품 및 교환 신청" : "반품/교환 처리 현황"}
            </h2>

            {/* 📊 격자형 가로 테이블 헤더 */}
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
                                {isProcessing && (
                                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#801a24', fontWeight: 'bold' }}>
                                        [현재 접수 완료되어 {order.deliveryStatus === 'PICKUP' ? '수거 중' : '검수 중'}입니다]
                                    </p>
                                )}
                            </div>

                            <div className="td-price">{Number(order.orderPrice || 0).toLocaleString()}원</div>
                            <div className="td-count">{order.count || 0}개</div>
                            <div className="td-subtotal">{itemSubtotal.toLocaleString()}원</div>
                            
                            {/* 💡 인호님 최종 스펙 반영: 반품접수완료 텍스트 가이드 출력 */}
                            <div className="td-status">
                                {order.orderState === 'CANCEL' ? "반품접수완료" : isProcessing ? "교환 접수" : "신청 가능"}
                            </div>
                        </div>
                    );
                }) : (
                    <p>신청 가능한 주문 내역이 없습니다.</p>
                )}
            </div>

            {/* 🔢 페이징 바 */}
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

            {/* 📋 하단 제어 구역 */}
            {activeTab === 1 && (
                <div className="refund-action-submit-zone">
                    <button 
                        className="refund-btn refund-btn-return" 
                        onClick={() => handleRefund(selectedOrder?.orderId || selectedOrder?.id)}
                    >
                        반품 신청
                    </button>
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
