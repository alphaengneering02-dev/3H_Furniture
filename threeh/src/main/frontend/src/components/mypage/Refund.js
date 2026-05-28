import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/myPageCss/refund.css';
import { useToast } from '../../hook/useToast';
import { ToastContainer, toast } from "react-toastify";
import Header from '../main/Header';
import Footer from "../main/Footer";



const RefundPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    const { success, error, warn, info } = useToast(); // 토스트 선언부 정상 복구

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
    
         // 🚀 [형님 뜻 반영]: Mypage.js의 검증된 원본 창구와 데이터 주입부를 100% 똑같이 이식 완료
    const fetchTabData = (tabNumber) => {
        // 💡 1번 탭이든 2번 탭이든, 상품명이 완벽하게 다 들어있는 마이페이지 검증 주소를 똑같이 찌릅니다.
        const apiUrl = 'http://localhost:8080/Member/mypage.do'; 

        axios.get(apiUrl, { withCredentials: true })
            .then(res => {
                // 💡 [핵심]: 마이페이지 메인에서 가구명과 가격을 완벽하게 띄우던 'recentOrders' 원본 배열을 가져옵니다.
                const allOrders = res.data.recentOrders || [];
                
                // 💡 마이페이지 메인과 똑같은 날것 그대로의 순수 데이터 상태로 보관함에 주입합니다!
                setOrders(allOrders); 
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

    // [반품 로직]: 최종 규칙에 맞춰 'REFUND' 상태값으로 변경 이행
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
                            return currentId === orderId ? { ...order, orderState: 'REFUND' } : order;
                        })
                    );
                    setSelectedOrder(null);
                })
                .catch(err => alert("처리 중 오류 발생"));
        }
    };

        // [주문 취소 로직]: 타입 불일치 버그를 해결하고 진짜 DB 값을 CANCEL로 바꾸는 정석 연동 코드
    const handleCancelOrder = (orderId, itemId) => {
        if (!orderId) {
            alert("목록에서 취소 처리할 주문 건의 라디오 단추를 선택해 주세요.");
            return;
        }
        if (window.confirm(`주문번호 ${orderId}번 주문을 취소하시겠습니까?`)) {
            
            // 🚨 [400 에러 격파 핵심]: 문자열로 꼬여있던 orderId를 순수 자바 Long 타입과 호환되도록 강제 숫자 변환
            const numericOrderId = Number(orderId);

            const params = new URLSearchParams();
            params.append('orderId', numericOrderId); // 🚀 숫자로 포장해서 던집니다.
            params.append('itemId', Number(itemId));

            axios.post('http://localhost:8080/Member/order/cancel', params, { 
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded' // 🚀 스프링 컨트롤러 RequestParam 표준 규격
                }
            })
            .then(res => {
                // 백엔드가 DB 수정을 완벽히 마감하고 성공 응답을 주면 알림창을 띄웁니다.
                alert(res.data || "주문이 정상적으로 취소되었습니다.");
                
                // 실제 DB가 무사히 바뀌었으므로 화면 리액트 상태값도 실시간 일치화
                setOrders(prevOrders => 
                    prevOrders.map(order => {
                        const currentId = Number(order.orderId || order.id); // 💡 비교 대상도 숫자로 통일
                        return currentId === numericOrderId ? { ...order, orderState: 'CANCEL' } : order;
                    })
                );
                setSelectedOrder(null);
            })
            .catch(err => {
                console.error("취소 에러 발생 로그:", err);
                alert("주문 취소 중 오류 발생: " + (err.response?.data || err.message));
            });
        }
    };



    // 마이페이지 공통 규격 로그아웃 핸들러
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
    
    // 💡 [통합 필터링 매커니즘]: READY, PURCHASED 상태 트래킹 연동 완료
    const filteredOrders = orders.filter(order => {
        if (activeTab === 1) {
            return order.orderState !== 'CANCEL' && order.orderState !== 'REFUND' && order.orderState !== 'EXCHANGEorREFUND';
        }
        return order.orderState === 'CANCEL' || order.orderState === 'REFUND' || order.orderState === 'EXCHANGEorREFUND' || order.orderState === 'PURCHASED' || order.orderState === 'READY';
    });

    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

        return (
            <div className="order-page-global-root">
            
            {/* 1. 상단 공용 헤더 영역 */}
            <div className='main-header'>
                <Header/>
            </div> {/* [종료] main-header */}
                
                <ToastContainer
                    position="top-center"
                    autoClose={1800}
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick
                    pauseOnHover
                    theme="light"
                />
                
                {/* <div>
                    {member ? (
                        <button className="btn-header-action" onClick={handleLogout} style={{ marginRight: '10px' }}>로그아웃</button>
                    ) : (
                        <button className="btn-header-action" onClick={() => navigate('/login')} style={{ marginRight: '10px' }}>로그인</button>
                    )}
                    <button className="btn-header-action" onClick={() => navigate('/')}>메인으로</button>
                </div> */}

            {!member ? (
                <main style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <h2>로그인이 필요한 서비스입니다.</h2>
                </main>
            ) : (
                <div style={{ display: 'flex' }}>
                    {/* 좌측 마이페이지 공통 대형 사이드바 메뉴 축 고정 */}
                    <aside className="mypage-sidebar">
                        <button className="sidebar-btn" onClick={() => navigate('/mypage/schedule')}>구매확정내역</button>
                        <button className="sidebar-btn" style={{ color: '#8C7A6B', fontWeight: 'bold' }} onClick={() => navigate('/cart/return')}>교환 및 반품</button>
                        <button className="sidebar-btn" onClick={() => navigate('/cart')}>장바구니 목록</button>
                    </aside>


                    {/* ========================================================= */}
                    {/* [2구역 전체 시작] 우측 메인 양식 및 격자 테이블 쇼룸         */}
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

                            {/* 격자형 가로 테이블 헤더 (th 선택자 refund- 결합) */}
                            <div className="refund-table-header">
                                <div className="refund-th-select">선택</div>
                                <div className="refund-th-order-id">주문번호</div>
                                <div className="refund-th-product-name">상품명</div>
                                <div className="refund-th-price">판매단가</div>
                                <div className="refund-th-count">수량</div>
                                <div className="refund-th-subtotal">소계금액</div>
                                <div className="refund-th-status">주문현황</div>
                            </div>

                            {/* ========================================================= */}
                            {/* 📋 가로 격자 테이블 바디 아이템 카드 리스트 구역               */}
                            {/* ========================================================= */}
                            <div className="refund-item-list">
                                {currentOrders && currentOrders.length > 0 ? (
                                    currentOrders.map((order, index) => {
                                        const orderIdStr = order.orderId || order.id;
                                        const isProcessing = order.orderState === 'EXCHANGEorREFUND' || order.orderState === 'REFUND' || order.deliveryStatus === 'PICKUP';
                                        const isChecked = selectedOrder && (selectedOrder.orderId || selectedOrder.id) === orderIdStr;

                                        // 🚀 [최종 해결 마감]: 형님이 보여주신 Mypage.js 구조와 100% 동일하게 1층 변수명 이름표로 direct 매핑 완수!
                                        const targetItemName = order.itemName || order.productName || "상품 정보 없음";
                                        const targetPrice = Number(order.orderPrice || order.itemPrice || order.price || 0);
                                        const targetCount = Number(order.count || 0);
                                        const itemSubtotal = targetPrice * targetCount;

                                        return (
                                            <div key={orderIdStr || index} className="refund-item-card">
                                                {/* 1. 라디오 버튼 선택 셀 */}
                                                <div className="refund-td-select">
                                                    <input 
                                                        type="radio" 
                                                        name="refund-select-item"
                                                        checked={!!isChecked}
                                                        /* 💡 배송 준비중(READY), 배송중/완료, 구매확정인 건은 단순 취소 실수를 방지하기 위해 자동 잠금 */
                                                        disabled={activeTab !== 1 || isProcessing || order.orderState === 'CANCEL' || order.orderState === 'READY' || order.orderState === 'PURCHASED' || order.deliveryStatus === 'SHIPPING' || order.deliveryStatus === 'COMPLETED'}
                                                        onChange={() => setSelectedOrder(order)}
                                                    />
                                                </div>

                                                {/* 2. 주문번호 셀 */}
                                                <div className="refund-td-order-id">{orderIdStr}</div>

                                                {/* 3. 상품명 셀 */}
                                                <div className="refund-td-product-name">
                                                    {/* ✨ [대대적 대성공]: 마이페이지와 조준선이 완벽히 일치하여 진짜 가구 상품명이 선명하게 대노출됩니다! */}
                                                    <span className="refund-product-name"><strong>{targetItemName}</strong></span>
                                                    {isProcessing && (
                                                        <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#801a24', fontWeight: 'bold' }}>
                                                            [현재 접수 완료되어 {order.orderState === 'REFUND' ? '반품 처리' : order.deliveryStatus === 'PICKUP' ? '수거 중' : '검수 중'}입니다]
                                                        </p>
                                                    )}
                                                </div>

                                                {/* 4. 판매단가 셀 */}
                                                <div className="refund-td-price">{targetPrice.toLocaleString()}원</div>
                                                
                                                {/* 5. 수량 셀 */}
                                                <div className="refund-td-count">{targetCount}개</div>
                                                
                                                {/* 6. 소계금액 셀 */}
                                                <div className="refund-td-subtotal">{itemSubtotal.toLocaleString()}원</div>
                                                
                                                {/* 7. 주문현황 및 시인성 배지 가이드 클러스터 */}
                                                <div className="refund-td-status" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                                    {order.orderState === 'CANCEL' ? (
                                                        <span style={{ color: '#a82525', fontWeight: 'bold' }}>주문취소완료</span>
                                                    ) : order.orderState === 'REFUND' ? (
                                                        <span style={{ color: '#555555', fontWeight: 'bold' }}>반품처리완료</span>
                                                    ) : isProcessing ? (
                                                        <span style={{ color: '#801a24' }}>교환 접수</span>
                                                    ) : order.orderState === 'PURCHASED' ? (
                                                        <div>
                                                            <span style={{ color: '#8C7A6B', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>✓ 구매확정</span>
                                                            <span style={{ display: 'inline-block', padding: '2px 6px', fontSize: '11px', backgroundColor: '#f1f3f4', color: '#5f6368', fontWeight: '700', borderRadius: '4px' }}>
                                                                취소/반품 불가
                                                            </span>
                                                        </div>
                                                    ) : order.orderState === 'READY' || order.deliveryStatus === 'SHIPPING' ? (
                                                        <div>
                                                            <span style={{ color: '#1a73e8', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>
                                                                {order.deliveryStatus === 'SHIPPING' ? "🚚 배송중" : "📦 준비중"}
                                                            </span>
                                                            <span style={{ display: 'inline-block', padding: '2px 6px', fontSize: '11px', backgroundColor: '#fce8e6', color: '#c5221f', fontWeight: '700', borderRadius: '4px' }}>
                                                                배송중 취소불가
                                                            </span>
                                                        </div>
                                                    ) : activeTab === 1 && order.deliveryStatus === 'WAITING' && order.orderState === 'ORDER' ? (
                                                        <div>
                                                            <span style={{ color: '#111111', display: 'block', marginBottom: '2px' }}>신청 가능</span>
                                                            <span style={{ display: 'inline-block', padding: '2px 6px', fontSize: '11px', backgroundColor: '#e6f4ea', color: '#137333', fontWeight: '700', borderRadius: '4px' }}>
                                                                배송전 취소가능
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span>신청 가능</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
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
                                        /* 🚨 [400 버그 해결 마침표]: 자바 백엔드가 간절히 원하던 itemId 파라미터를 콤마 뒤에 안전하게 수령하여 탑재 완료! */
                                        onClick={() => handleCancelOrder(selectedOrder?.orderId || selectedOrder?.id, selectedOrder?.itemId)}
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

            {/* 💡 [에러 완치 핵심] 아침 규격 공용 Footer를 삼항연산자 바깥, 최상위 루트 래퍼의 바로 안쪽 정위치에 안전 안착시킵니다. */}
            <div className="main-mypage-footer">
                <Footer/>
            </div> 

        </div> // 가장 최상단 루트인 <div className="order-page-global-root"> 를 정밀하게 밀봉 폐쇄하는 진짜 마지막 단 하나의 태그
    );
};

export default RefundPage;
