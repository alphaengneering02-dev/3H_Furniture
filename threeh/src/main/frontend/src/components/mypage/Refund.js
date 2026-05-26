import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/myPageCss/refund.css';

const RefundPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    // 부조장님 피드백 반영: 2대 대형 탭 구조
    const [activeTab, setActiveTab] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // 페이징 상태 변수
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 마이페이지와 로그인 연동 상태를 동일하게 맞추기 위한 회원 보관함
    const [member, setMember] = useState(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // 탭 메뉴에 따라 데이터를 스위칭해오는 함수
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
        if (!orderId) {
            alert("목록에서 교환 처리할 주문 건의 라디오 단추를 선택해 주세요.");
            return;
        }
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
                    navigate(`/item/${itemId}`);
                })
                .catch(err => {
                    console.error("교환 신청 오류:", err);
                    alert("처리 중 오류 발생");
                });
        }
    };

    // [반품 로직] 유지
    const handleRefund = (orderId) => {
        if (!orderId) {
            alert("목록에서 반품 처리할 주문 건의 라디오 단추를 선택해 주세요.");
            return;
        }
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
                .catch(err => alert("처리 중 오류 발생"));
        }
    };

    // 마이페이지 공통 규격 로그아웃 연동 핸들러
    const handleLogout = () => {
        if (window.confirm("로그아웃 하시겠습니까?")) {
            sessionStorage.removeItem('user');
            setMember(null);
            alert("로그아웃 되었습니다");
            navigate('/');
        }
    };

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
        <div className="mypage-grid-container">
            {/* ========================================================= */}
            {/* [헤더 시작] 까사미아 스타일 상단 브랜드 바 레이아웃               */}
            {/* ========================================================= */}
            <header className="mypage-header-box" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ccc' }}>
                <div className="mypage-logo-box" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: 'bold' }}>PROJECT CMYK</div>
                <div>
                    {member ? (
                        <button className="btn-header-action" onClick={handleLogout} style={{ marginRight: '10px' }}>로그아웃</button>
                    ) : (
                        <button className="btn-header-action" onClick={() => navigate('/login')} style={{ marginRight: '10px' }}>로그인</button>
                    )}
                    <button className="btn-header-action" onClick={() => navigate('/')}>메인으로</button>
                </div>
            </header>

            {!member ? (
                <main style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <h2>로그인이 필요한 service입니다.</h2>
                </main>
            ) : (
                <div style={{ display: 'flex' }}>
                    {/* 📌 좌측 마이페이지 고정 내비게이션 채널 연동 축 */}
                    <aside className="mypage-sidebar">
                        <button className="sidebar-btn" onClick={() => navigate('/mypage')}>추가될기능/구매확정내역</button>
                        <button className="sidebar-btn" style={{ color: '#8C7A6B', fontWeight: 'bold' }} onClick={() => navigate('/cart/return')}>교환 및 반품</button>
                        <button className="sidebar-btn" onClick={() => navigate('/cart')}>장바구니 목록</button>
                    </aside>

                    {/* 우측 메인 양식 디스플레이 제어 보드 */}
                    <main className="mypage-main-content" style={{ flex: 1, padding: '20px' }}>
                        
                        {/* 프로필 요약 퀵 컴포넌트 존 */}
                        <div className="profile-icon-box">
                            <div className="profile-avatar-circle">{member.name ? member.name +"님" : "U"}</div>
                            <button className="mypage-action-btn" onClick={() => navigate('/mypage')}>마이페이지</button>
                        </div>

                        <div className="refund-container" style={{ width: '100%', maxWidth: '100%', padding: '0', margin: '0', border: 'none', boxShadow: 'none', background: 'transparent' }}>
                            {/* 2대 대형 탭바 */}
                            <div className="refund-tabs-bar">
                                <button className={`refund-tab-btn ${activeTab === 1 ? 'active' : ''}`} onClick={() => handleTabClick(1)}>반품/교환 신청</button>
                                <button className={`refund-tab-btn ${activeTab === 2 ? 'active' : ''}`} onClick={() => handleTabClick(2)}>반품/교환처리 현황</button>
                            </div>

                            <h2 className="refund-title">
                                {activeTab === 1 ? "반품 및 교환 신청" : "반품/교환 처리 현황"}
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
                                    const itemSubtotal = Number(order.orderPrice || order.itemPrice || 0) * Number(order.count || 0);

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

                                            <div className="td-price">{Number(order.orderPrice || order.itemPrice || 0).toLocaleString()}원</div>
                                            <div className="td-count">{order.count || 0}개</div>
                                            <div className="td-subtotal">{itemSubtotal.toLocaleString()}원</div>
                                            
                                            {/* 인호님 최종 스펙 반영: 반품접수완료 텍스트 가이드 출력 */}
                                            <div className="td-status">
                                                {order.orderState === 'CANCEL' ? "반품접수완료" : isProcessing ? "교환 접수" : "신청 가능"}
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

                            {/* 하단 제어 구역 */}
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
                    </main>
                </div>
            )}

            {/* ========================================================= */}
            {/* [푸터 시작] 하단 기업 정보 및 미니멀 카피라이트 마크업          */}
            {/* ========================================================= */}
            <footer className="mypage-footer">
                <div className="footer-content">
                    <p className="footer-logo">PROJECT CMYK</p>
                    <p className="footer-info">주식회사 씨엠와이케이 | 공동 프로젝트 팀 | 경기도 수원시 팔달구</p>
                    <p className="footer-copy">© 2026 PROJECT CMYK. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};


export default RefundPage;
