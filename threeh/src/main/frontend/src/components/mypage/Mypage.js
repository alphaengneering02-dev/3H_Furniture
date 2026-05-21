import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
/* ⚡ DaumPostCode 라이브러리 임포트 유지 */
import DaumPostCode from 'react-daum-postcode';
import '../../css/mypagecss/mypage.css';

const Mypage = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);

    const [myReviews, setMyReviews] = useState([]);
    const [editReviewId, setEditReviewId] = useState(null);
    const [editReviewScore, setEditReviewScore] = useState(5);
    const [editReviewText, setEditReviewText] = useState("");

    /* ⚡ 카카오 우편번호 레이어 창 제어 토글 변수 */
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    useEffect(() => {
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            const userObj = JSON.parse(savedUser);
            setMember(userObj);

            axios.get('http://localhost:8080/Member/mypage.do', { withCredentials: true })
                .then(res => {
                    setMember(res.data.member);
                    
                    // ⚡ [회원 전용 보관고 연동] 이 브라우저에 이 회원 이름으로 저장된 주소록이 있는지 확인
                    const storageKey = `addresses_${res.data.member.id}`;
                    const localAddresses = localStorage.getItem(storageKey);
                    
                    if (localAddresses) {
                        // 저장된 주소가 있다면 그걸 불러와서 화면에 세팅
                        setAddresses(JSON.parse(localAddresses));
                    } else {
                        // 없다면 조장님 백엔드에서 준 기본 주소록을 세팅
                        setAddresses(res.data.addressList || []);
                    }
                    
                    const allOrders = res.data.recentOrders || [];
                    const activeOrders = allOrders.filter(order => order.orderState !== 'CANCEL');
                    setOrders(activeOrders);

                    sessionStorage.setItem('user', JSON.stringify(res.data.member));
                    getMyReviews();
                })
                .catch(err => {
                    console.error("최신 데이터 로드 실패", err);
                    if (err.response && err.response.status === 401) {
                        sessionStorage.removeItem('user');
                        setMember(null);
                    }
                })
        } else {
            setMember(null);
        }
    }, []);

    const handleConfirmPurchase = async (orderId) => {
        if (!window.confirm("구매를 확정하시겠습니까?")) return;
        try {
            const params = new URLSearchParams();
            params.append('orderId', orderId);
            const response = await axios.post("http://localhost:8080/Member/purchase/confirm", params, { withCredentials: true });
            alert(response.data || "구매가 확정되었습니다.");
            setOrders((prevOrders) => prevOrders.map((order) => (order.orderId || order.id) === orderId ? { ...order, orderState: "PURCHASED" } : order));
        } catch (err) {
            console.error("구매 확정 오류:", err);
            if(err.response) { alert(err.response.data); return; }
            alert("구매 확정 처리 중 오류가 발생했습니다.");
        }
    };

    const handleRefund = (orderId) => {
        if (window.confirm(`주문번호 ${orderId}번을 교환/반품 하시겠습니까?'\n재고가 복구되고 주문이 삭제됩니다.`)) {
            const params = new URLSearchParams();
            params.append('orderId', orderId);
            axios.post('http://localhost:8080/Member/refund/process', params, { withCredentials: true })
                .then(res => {
                    alert(res.data);
                    setOrders(orders.filter(order => order.id !== orderId));
                })
                .catch(err => alert("처리 중 오류 발생"))
        }
    }
    

    const handleLogout = () => {
        if (window.confirm("로그아웃 하시겠습니까?")) {
            sessionStorage.removeItem('user');
            setMember(null);
            alert("로그아웃 되었습니다");
            navigate('/');
        }
    }

    /* ⚡ [새 배송지 기능 연동] 버튼 누르면 카카오 우편번호창 열리게 처리 */
    const addAddress = () => {
        setIsPostcodeOpen(!isPostcodeOpen);
    };

    /* ⚡ [카카오 주소 수령 콜백 보정] 고른 주소를 상세주소 입력창으로 전송하도록 가교 역할 매핑 */
    const handleAddressComplete = (data) => {
        if (!member) return;

        // 상세주소를 적기 전까지 "방금 검색한 주소"라는 임시 상태 플래그로 목록에 띄워둡니다.
        const newAddressObj = { 
            id: Date.now(), 
            addressName: "방금 검색한 주소", 
            street: data.address, 
            addrDetail: "" 
        };
        
        // 화면 리스트에만 슬쩍 먼저 얹어줍니다.
        setAddresses(prevAddresses => [...prevAddresses, newAddressObj]);
    };

    /* ⚡ [회원 전용 상태 스위칭] 서버에 보내지 않고 화면상에서 즉시 배지를 변경한 후 보관함 갱신 */
    const handleSetDefault = (addressId) => {
        if (!member) return;

        const updatedAddresses = addresses.map(addr => {
            if (addr.id === addressId) {
                // 선택한 새 주소는 조장님 렌더링 조건인 "기본 배송지"로 마킹
                return { ...addr, addressName: "기본 배송지" };
            } else {
                // 기존 기본배송지 및 다른 주소들은 일반 배송지 상태로 초기화
                return { ...addr, addressName: "추가된 배송지" };
            }
        });

        // 💡 바뀐 기본배송지 정보를 브라우저 금고에 그대로 업데이트
        localStorage.setItem(`addresses_${member.id}`, JSON.stringify(updatedAddresses));
        
        setAddresses(updatedAddresses);
        alert("기본 배송지가 변경되었습니다.");
    };

    /* ⚡ [회원 전용 삭제 연동] 보관함에서 삭제 처리 기능 연동 */
    const deleteAddress = (addressId) => {
        if (window.confirm("배송지를 삭제하시겠습니까?")) {
            if (!member) return;
            const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
            
            localStorage.setItem(`addresses_${member.id}`, JSON.stringify(updatedAddresses));
            setAddresses(updatedAddresses);
        }
    };

    const handleDelete = () => {
        if (window.confirm("정말로 탈퇴하시겠습니까?")) {
            axios.post('http://localhost:8080/Member/delete', {}, { withCredentials: true })
                .then((res) => { alert("탈퇴가 완료되었습니다."); sessionStorage.removeItem('user'); navigate('/'); })
                .catch(err => { console.error("탈퇴 오류:", err); alert("탈퇴 실패: " + (err.response?.data || "서버 오류가 발생했습니다.")); });
        }
    };

    /* =========================================================================
     * 📝 [오현옥 개발파트] 리뷰 관리 시스템 핵심 비즈니스 로직 연동 핸들러 정의 구역
     * ========================================================================= */

    /**
     * [오현옥] 1. 내 리뷰 목록 조회 기능
     * - 현재 로그인한 세션 회원이 과거에 작성했던 전체 리뷰 내역을 스프링 서버로부터 비동기 방식으로 fetch합니다.
     * - 성공 시 리액트 상태 변수인 `myReviews` 배열에 통째로 적재하여 화면 하단에 바인딩합니다.
     */
    const getMyReviews = async() =>{
        try{
            const response = await axios.get("http://localhost:8080/api/reviews/my", { withCredentials:true });
            setMyReviews(response.data);
        }catch(error){ console.error("내 리뷰 조회 실패", error); }
    };

    /**
     * [오현옥] 2. 리뷰 수정 모드 진입 전환 핸들러
     * - 유저가 특정 리뷰 열에서 [수정] 단추를 클릭하면 호출되는 제어 흐름입니다.
     * - 기존에 작성되어 있던 별점(`reviewScore`)과 본문 텍스트(`reviewText`) 데이터를 가산 상태 훅에 세팅하여 입력창에 자동 매핑합니다.
     */
    const handleEditReviewStart = (review) => { setEditReviewId(review.reviewId); setEditReviewScore(review.reviewScore); setEditReviewText(review.reviewText); };
    
    /**
     * [오현옥] 3. 수정 완료 처리 및 백엔드 반영 기능 (PUT API)
     * - 유저가 수정한 새로운 별점 스코어와 텍스트 문자열을 RESTful API 규격에 맞춰 서버에 갱신 처리 요청을 전송합니다.
     * - 완료 시 수정 폼 인터페이스 레이어를 비활성화(`null`)하고 `getMyReviews`를 리로드하여 실시간 무전환 동기화를 처리합니다.
     */
    const handleUpdateReview = async(reviewId) => {
        try{
            await axios.put(`http://localhost:8080/api/reviews/${reviewId}`, { reviewScore: editReviewScore, reviewText: editReviewText }, { withCredentials:true });
            alert("리뷰가 수정되었습니다."); setEditReviewId(null); getMyReviews();
        }catch(error){ alert("리뷰 수정 실패"); }
    };

    /**
     * [오현옥] 4. 리뷰 완전 삭제 기능 (DELETE API)
     * - 유저의 삭제 의사를 더블 체킹하는 윈도우 컨펌(`confirm`) 창을 트리거합니다.
     * - 승인 시 백엔드 데이터베이스의 해당 리뷰 고유 시퀀스 번호(`reviewId`) 레코드를 지우고 목록을 실시간 새로고침합니다.
     */
    const handleDeleteReview = async(reviewId) => {
        if(!window.confirm("리뷰를 삭제하시겠습니까?")) return;
        try{
            await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`, { withCredentials:true });
            alert("리뷰가 삭제되었습니다."); getMyReviews();
        }catch(error){ alert("리뷰 삭제 실패"); }
    }

    return (
        <div className="mypage-grid-container">
            <header className="mypage-header-box" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ccc' }}>
                <div className="mypage-logo-box" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: 'bold' }}>PROJECT CMYK</div>
                <div>
                    {member ? (
                        <button className="mypage-action-btn" onClick={handleLogout} style={{ marginRight: '10px' }}>로그아웃</button>
                    ) : (
                        <button className="mypage-action-btn" onClick={() => navigate('/login')} style={{ marginRight: '10px' }}>로그인</button>
                    )}
                    <button className="mypage-action-btn" onClick={() => navigate('/')}>메인으로</button>
                </div>
            </header>

            {!member ? (
                <main style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <h2>로그인이 필요한 service입니다.</h2>
                </main>
            ) : (
                <div style={{ display: 'flex' }}>
                    <aside className="mypage-sidebar">
                        <button className="sidebar-btn" onClick={() => navigate('/mypage/schedule')}>추가될기능/구매확정내역</button>
                        <button className="sidebar-btn" onClick={() => navigate('/cart/return')}>교환 및 반품</button>
                        <button className="sidebar-btn" onClick={() => navigate('/cart')}>장바구니 목록</button>
                    </aside>

                    <main className="mypage-main-content" style={{ flex: 1, padding: '20px' }}>
                        <div className="profile-icon-box">
                            <div className="profile-avatar-circle">{member.name ? member.name +"님" : "U"}</div>
                            {/* <p style={{ margin: '10px' }}><strong>{member?.name}</strong>님 환영합니다</p> */}
                            {/* 프로필 옆 북마크 버튼 추가 */}
                            <button className="mypage-action-btn" style={{marginRight: '5px'}}>북마크</button>
                            <button className="mypage-action-btn" onClick={() => navigate(`/member/update/${member.id}`)}>정보 수정</button>
                        </div>

                        <div className="info-content-box">
                            <h3 className="info-section-title">회원정보</h3>
                            <div className="info-data-block">
                                <p><strong>아이디:</strong> {member.id}</p>
                                <p><strong>연락처:</strong> {member.phone}</p>
                                <p><strong>이메일:</strong> {member.email || "-"}</p>
                            </div>

                            <h3 id="refund-section" className="info-section-title">구매내역</h3>
                            <div className="info-data-block">
                                {orders && orders.length > 0 ? (
                                    orders.map((order, index) => (
                                        <div key={order.orderId || order.id || index} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <p><strong>주문번호:</strong> {order.orderId || order.id || "번호 확인중"}</p>
                                                <p><strong>상품명:</strong> {order.itemName || order.productName || "주문 상품"}</p>
                                                {/* 주문 상태 추가 */}
                                                <p><strong>주문상태:</strong> {order.orderState}</p>
                                                <p><strong>배송상태:</strong> {order.deliveryStatus}</p>
                                                <p style={{ fontSize: '12px', color: '#888' }}>
                                                    주문일: {order.orderDate ? new Date(order.orderDate).toLocaleString() : "-"}
                                                </p>
                                            </div>
                                            
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                {order.orderState === 'PURCHASED' ? (
                                                    <button onClick={()=>navigate(`/item/${order.itemId}`)}
                                                    disabled={!order.itemId}
                                                    style={{
                                                        backgroundColor:"#2196F3",
                                                        color:"#fff",
                                                        border:"none",
                                                        padding:"8px 15px",
                                                        cursor:order.itemId ? "pointer":"not-allowed",
                                                    }}
                                                    >
                                                        리뷰쓰기
                                                    </button>
                                                ): order.orderState === "READY" && order.deliveryStatus ==="COMPLETED"?(
                                                    <button onClick={()=>handleConfirmPurchase(order.orderId||order.id)}
                                                    style={{backgroundColor:"#4CAF50",
                                                        color:"#fff",
                                                        border:"none",
                                                        padding:"8px 15px",
                                                        cursor:"pointer",
                                                    }}>
                                                        구매확정
                                                    </button>
                                                ):(
                                                    <span style={{color:"#888",fontSize:"13px", alignSelf: 'center'}}>
                                                        배송완료 후 구매확정 가능
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>최근 주문 내역이 없습니다.</p>
                                )}
                            </div>

                            <h3 className="info-section-title">배송지 설정</h3>
                            <div className="info-data-block">
                                {addresses.length > 0 ? (
                                    addresses.map(addr => (
                                        /* 만약 사용자가 주소를 검색하는 도중이라면 목록 출력을 임시 우회합니다 */
                                        addr.addressName === "방금 검색한 주소" ? null : (
                                            <div key={addr.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ margin: 0 }}>
                                                        <strong>{addr.addressName || "배송지"}</strong>
                                                        {addr.addressName === "기본 배송지" && (
                                                            <span className="default-address-badge" style={{ backgroundColor: '#2B2D2F', color: '#fff', fontSize: '11px', padding: '3px 8px', marginLeft: '8px', fontWeight: '600' }}>기본</span>
                                                        )}
                                                    </p>
                                                    <p style={{ margin: '4px 0 0 0', fontSize: '13.5px' }}>{addr.street} {addr.addrDetail}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {addr.addressName !== "기본 배송지" && (
                                                        <button className="btn-set-default" onClick={() => handleSetDefault(addr.id)}>기본배송지 설정</button>
                                                    )}
                                                    <button onClick={() => deleteAddress(addr.id)}>삭제</button>
                                                </div>
                                            </div>
                                        )
                                    ))
                                ) : (
                                    <p>등록된 추가 배송지가 없습니다.</p>
                                )}
                                <button className="mypage-action-btn" style={{ marginTop: '15px' }} onClick={addAddress}>+ 새 배송지 추가</button>
                                
                                {/* ⚡ [카카오 우편번호 및 상세주소 입력 레이어 통합 영역] */}
                                {isPostcodeOpen && (
                                    <div style={{ border: '1px solid #ccc', marginTop: '15px', padding: '15px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600' }}>새 배송지 검색</span>
                                            <button type="button" onClick={() => setIsPostcodeOpen(false)} style={{ cursor: 'pointer', padding: '2px 8px' }}>닫기</button>
                                        </div>
                                        
                                        {/* 1단계: 임시 주소가 생성되었을 때만 상세주소를 타이핑하는 인풋창을 노출시킵니다. */}
                                        {addresses.some(a => a.addressName === "방금 검색한 주소") ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                                                    <strong>선택된 주소:</strong> {addresses.find(a => a.addressName === "방금 검색한 주소")?.street}
                                                </p>
                                                <input 
                                                    type="text" 
                                                    id="detailAddressInput"
                                                    placeholder="상세주소를 입력해 주세요 (예: 101동 202호)" 
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const btn = document.getElementById('saveDetailBtn');
                                                            if (btn) btn.click();
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    type="button"
                                                    id="saveDetailBtn"
                                                    style={{ padding: '8px', backgroundColor: '#000', color: '#fff', cursor: 'pointer', border: 'none', fontWeight: '600' }}
                                                    onClick={() => {
                                                        const inputVal = document.getElementById('detailAddressInput').value;
                                                        setAddresses(prev => {
                                                            const next = prev.map(a => a.addressName === "방금 검색한 주소" ? { ...a, addressName: "추가된 배송지", addrDetail: inputVal } : a);
                                                            localStorage.setItem(`addresses_${member.id}`, JSON.stringify(next));
                                                            return next;
                                                        });
                                                        alert("상세주소 등록이 완료되었습니다!");
                                                        setIsPostcodeOpen(false);
                                                    }}
                                                >
                                                    주소 저장 완료
                                                </button>
                                            </div>
                                        ) : (
                                            /* 2단계: 아직 주소를 고르기 전에는 카카오 검색창을 띄워줍니다. */
                                            <DaumPostCode onComplete={handleAddressComplete} />
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <button className="mypage-action-btn" onClick={handleDelete} style={{ color: 'red', marginTop: '30px' }}>회원 탈퇴</button>
                        </div>

                        {/* =========================================================================
                         * 📝 [오현옥 렌더링 파트] 내가 작성한 리뷰 데이터 루프 바인딩 출력 구역
                         * ========================================================================= */}
                        <div style={{marginTop:"40px"}}>
                            <h2>내가 작성한 리뷰</h2>
                            {myReviews && myReviews.length > 0 ? (
                                myReviews.map((review) => (
                                    <div key={review.reviewId} style={{ borderBottom: "1px solid #eee", padding: '15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        
                                        {/* [오현옥] 현재 행이 일반 보기 모드인지, 혹은 유저가 [수정]을 눌러 진입한 에디팅 상태인지 분기 처리 */}
                                        {editReviewId === review.reviewId ? (
                                            /* 💡 1단계: [오현옥] 수정 모드 활성화 시 인풋창 인터페이스 노출 */
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, marginRight: '20px' }}>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>별점 수정:</span>
                                                    <select 
                                                        value={editReviewScore} 
                                                        onChange={(e) => setEditReviewScore(Number(e.target.value))}
                                                        style={{ padding: '4px 8px' }}
                                                    >
                                                        <option value={5}>⭐⭐⭐⭐⭐ (5점)</option>
                                                        <option value={4}>⭐⭐⭐⭐ (4점)</option>
                                                        <option value={3}>⭐⭐⭐ (3점)</option>
                                                        <option value={2}>⭐⭐ (2점)</option>
                                                        <option value={1}>⭐ (1점)</option>
                                                    </select>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={editReviewText} 
                                                    onChange={(e) => setEditReviewText(e.target.value)}
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
                                                />
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button onClick={() => handleUpdateReview(review.reviewId)} style={{ padding: '4px 12px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer' }}>저장</button>
                                                    <button onClick={() => setEditReviewId(null)} style={{ padding: '4px 12px', backgroundColor: '#bbb', color: '#fff', border: 'none', cursor: 'pointer' }}>취소</button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* 💡 2단계: [오현옥] 평소 화면에 뿌려지는 텍스트 본문 및 평점 레이아웃 */
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#ff9800', fontWeight: 'bold' }}>
                                                    {/* 점수 정수값을 기반으로 별 아이콘 개수를 출력하는 오현옥 로직 매핑 */}
                                                    {"⭐".repeat(review.reviewScore || 5)} ({review.reviewScore}점)
                                                </p>
                                                <p style={{ margin: 0, fontSize: '15px', color: '#333' }}>
                                                    {review.reviewText || "작성된 리뷰 내용이 없습니다."}
                                                </p>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>
                                                    리뷰 고유키: {review.reviewId}
                                                </p>
                                            </div>
                                        )}

                                        {/* [오현옥] 우측에 상시 대기하는 수정 / 삭제 제어 버튼 셋 레이어 */}
                                        <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                                            {editReviewId !== review.reviewId && (
                                                <button 
                                                    className="mypage-action-btn" 
                                                    onClick={() => handleEditReviewStart(review)}
                                                    style={{ padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}
                                                >
                                                    수정
                                                </button>
                                            )}
                                            <button 
                                                className="mypage-action-btn" 
                                                onClick={() => handleDeleteReview(review.reviewId)}
                                                style={{ padding: '4px 10px', fontSize: '12px', color: 'red', cursor: 'pointer' }}
                                            >
                                                삭제
                                            </button>
                                        </div>

                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#888', padding: '15px 0' }}>내가 작성한 리뷰 내역이 존재하지 않습니다.</p>
                            )}
                        </div>
                    </main>
                </div>
            )}
        </div>
    );
};

export default Mypage;
