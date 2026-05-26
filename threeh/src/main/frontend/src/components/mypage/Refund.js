import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/myPageCss/refund.css';
import { useToast } from '../../hook/useToast'; // ⭕ 인호님 커스텀 토스트 훅 유실 없이 복구 완료

const RefundPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    const { success, error, warn, info } = useToast(); // ⭕ 토스트 선언부 정상 복구

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

    // 🚀 [반품 로직 수정]: CANCEL이 아닌 최종 규칙에 맞춰 'REFUND' 상태값으로 변경 이행
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
                            // 💡 반품 시 CANCEL이 아닌 'REFUND' 상태로 세팅합니다.
                            return currentId === orderId ? { ...order, orderState: 'REFUND' } : order;
                        })
                    );
                    setSelectedOrder(null);
                })
                .catch(err => alert("처리 중 오류 발생"));
        }
    };

    // 🚀 [주문 취소 로직 탑재 완료]: 배송 전 단순 취소는 명확하게 'CANCEL' 상태값으로 변경 이행
    const handleCancelOrder = (orderId) => {
        if (!orderId) {
            alert("목록에서 취소 처리할 주문 건의 라디오 단추를 선택해 주세요.");
            return;
        }
        if (window.confirm(`주문번호 ${orderId}번 주문을 취소하시겠습니까?`)) {
            const params = new URLSearchParams();
            params.append('orderId', orderId);

            axios.post('http://localhost:8080/Member/order/cancel', params, { withCredentials: true })
                .then(res => {
                    alert(res.data || "주문이 정상적으로 취소되었습니다.");
                    
                    setOrders(prevOrders => 
                        prevOrders.map(order => {
                            const currentId = order.orderId || order.id;
                            // 💡 단순 주문 취소는 정확하게 'CANCEL' 상태로 변경합니다.
                            return currentId === orderId ? { ...order, orderState: 'CANCEL' } : order;
                        })
                    );
                    setSelectedOrder(null);
                })
                .catch(err => alert("주문 취소 중 오류 발생: " + (err.response?.data || err.message)));
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
    
    // 💡 통합 필터링 고도화 (새로 도입된 REFUND 조건까지 완벽 조율하여 탭 싱크 일치)
    const filteredOrders = orders.filter(order => {
        if (activeTab === 1) {
            return order.orderState !== 'CANCEL' && order.orderState !== 'REFUND' && order.orderState !== 'EXCHANGEorREFUND';
        }
        return order.orderState === 'CANCEL' || order.orderState === 'REFUND' || order.orderState === 'EXCHANGEorREFUND';
    });

    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);


        return (
        <div className="mypage-grid-container">
            {/* ========================================================= */}
            {/* [1구역 시작] 마이페이지 공통 헤더 바 (로고 THREE H 세팅)      */}
            {/* ========================================================= */}
            <header className="mypage-header-box" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ccc' }}>
                <div className="mypage-logo-box" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: 'bold' }}>THREE H</div>
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
                    <h2>로그인이 필요한 서비스입니다.</h2>
                </main>
            ) : (
                <div style={{ display: 'flex' }}>
                    {/* 📌 좌측 마이페이지 공통 대형 사이드바 메뉴 축 고정 */}
                    <aside className="mypage-sidebar">
                        <button className="sidebar-btn" onClick={() => navigate('/mypage')}>추가될기능/구매확정내역</button>
                        <button className="sidebar-btn" style={{ color: '#8C7A6B', fontWeight: 'bold' }} onClick={() => navigate('/cart/return')}>교환 및 반품</button>
                        <button className="sidebar-btn" onClick={() => navigate('/cart')}>장바구니 목록</button>
                    </aside>


                                        {/* ========================================================= */}
                    {/* [2구역 시작] 우측 메인 양식 및 격자 테이블 쇼룸          */}
                    {/* ========================================================= */}
                    <main className="mypage-main-content" style={{ flex: 1, padding: '20px' }}>
                        
                        {/* 프로필 요약 퀵 컴포넌트 존 */}
                        <div className="mypage-profile-icon-box">
                            <div className="mypage-profile-avatar-circle">{member.name ? member.name +"님" : "U"}</div>
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

                            {/* 💡 [정밀 정렬 보완]: 테이블 헤더 th 선택자 앞단에 refund- 규격 자동 체이닝 결합 */}
                            <div className="refund-table-header">
                                <div className="refund-th-select">선택</div>
                                <div className="refund-th-order-id">주문번호</div>
                                <div className="refund-th-product-name">상품명</div>
                                <div className="refund-th-price">판매단가</div>
                                <div className="refund-th-count">수량</div>
                                <div className="refund-th-subtotal">소계금액</div>
                                <div className="refund-th-status">주문현황</div>
                            </div>

                            <div className="refund-item-list">
                                {currentOrders.length > 0 ? currentOrders.map((order) => {
                                    const orderIdStr = order.orderId || order.id;
                                    const isProcessing = order.orderState === 'EXCHANGEorREFUND' || order.orderState === 'REFUND' || order.deliveryStatus === 'PICKUP';
                                    const isChecked = selectedOrder && (selectedOrder.orderId || selectedOrder.id) === orderIdStr;
                                    const itemSubtotal = Number(order.orderPrice || order.itemPrice || 0) * Number(order.count || 0);

                                    return (
                                        <div key={orderIdStr} className="refund-item-card">
                                            {/* 💡 [정밀 정렬 보완]: 테이블 바디 td 선택자 앞단에 refund- 규격 자동 체이닝 결합 */}
                                            <div className="refund-td-select">
                                                <input 
                                                    type="radio" 
                                                    name="refund-select-item"
                                                    checked={!!isChecked}
                                                    disabled={activeTab !== 1 || isProcessing || order.orderState === 'CANCEL'}
                                                    onChange={() => setSelectedOrder(order)}
                                                />
                                            </div>

                                            <div className="refund-td-order-id">{orderIdStr}</div>

                                            <div className="refund-td-product-name">
                                                <span className="refund-product-name"><strong>{order.itemName || order.productName}</strong></span>
                                                {isProcessing && (
                                                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#801a24', fontWeight: 'bold' }}>
                                                        [현재 접수 완료되어 {order.orderState === 'REFUND' ? '반품 처리' : order.deliveryStatus === 'PICKUP' ? '수거 중' : '검수 중'}입니다]
                                                    </p>
                                                )}
                                            </div>

                                            <div className="refund-td-price">{Number(order.orderPrice || order.itemPrice || 0).toLocaleString()}원</div>
                                            <div className="refund-td-count">{order.count || 0}개</div>
                                            <div className="refund-td-subtotal">{itemSubtotal.toLocaleString()}원</div>
                                            
                                            <div className="refund-td-status">
                                                {order.orderState === 'CANCEL' ? "주문취소완료" : order.orderState === 'REFUND' ? "반품처리완료" : isProcessing ? "교환 접수" : "신청 가능"}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p>신청 가능한 주문 내역이 없습니다.</p>
                                )}
                            </div>


                                                        {/* ========================================================= */}
                            {/* [3구역 시작] 하단 페이징 바 및 원스톱 버튼 제어 Zone         */}
                            {/* ========================================================= */}
                            {totalPages > 1 && (
                                <div className="refund-pagination-bar">
                                    <button className="refund-page-arrow-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>&lt; 이전</button>
                                    <div className="refund-page-number-group">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                            <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`refund-page-num-btn ${currentPage === pageNumber ? 'active' : ''}`}>{pageNumber}</button>
                                        ))}
                                    </div>
                                    <button className="refund-page-arrow-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>다음 &gt;</button>
                                </div>
                            )}

                            {/* 최하단 제출 버튼 존: 주문취소 단추를 좌측에 균등 배치하고 비활성화 잠금 완료 */}
                            {activeTab === 1 && (
                                <div className="refund-action-submit-zone">
                                    <button 
                                        type="button" 
                                        className="refund-btn"
                                        style={{ 
                                            borderColor: (!selectedOrder || selectedOrder.deliveryStatus !== 'WAITING' || selectedOrder.orderState !== 'ORDER') ? '#ccc' : '#a82525', 
                                            color: (!selectedOrder || selectedOrder.deliveryStatus !== 'WAITING' || selectedOrder.orderState !== 'ORDER') ? '#999' : '#a82525',
                                            cursor: (!selectedOrder || selectedOrder.deliveryStatus !== 'WAITING' || selectedOrder.orderState !== 'ORDER') ? 'not-allowed' : 'pointer'
                                        }}
                                        onClick={() => handleCancelOrder(selectedOrder?.orderId || selectedOrder?.id)}
                                        disabled={!selectedOrder || selectedOrder.deliveryStatus !== 'WAITING' || selectedOrder.orderState !== 'ORDER'}
                                    >
                                        주문취소 (배송전)
                                    </button>
                                    <button 
                                        type="button"
                                        className="refund-btn refund-btn-exchange" 
                                        onClick={() => handleExchange(selectedOrder?.orderId || selectedOrder?.id, selectedOrder?.itemId)}
                                    >
                                        교환 신청
                                    </button>
                                    <button 
                                        type="button"
                                        className="refund-btn refund-btn-return" 
                                        onClick={() => handleRefund(selectedOrder?.orderId || selectedOrder?.id)}
                                    >
                                        반품 신청
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            )}

            {/* ========================================================= */}
            {/* [푸터 시작] THREE H 브랜드 공통 하단 푸터 영역 마감               */}
            {/* ========================================================= */}
            <footer className="mypage-footer">
                <div className="footer-content">
                    <p className="footer-logo">THREE H</p>
                    <p className="footer-info">주식회사 쓰리 에이치 | 공동 프로젝트 팀 | 경기도 수원시 팔달구</p>
                    <p className="footer-copy">© 2026 THREE H. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default RefundPage;
