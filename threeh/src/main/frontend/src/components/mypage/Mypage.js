import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
/* ⚡ DaumPostCode 라이브러리 임포트 유지 */
import DaumPostCode from 'react-daum-postcode';
/* 💡 폴더명(mypageCss)과 파일명(myPage.css) 대소문자 규격 오차 없이 싱크 적용 */
import '../../css/myPageCss/myPage.css';

const Mypage = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);

    //북마크 추가_오현옥
    const[showBookmarks, setShowBookmarks] = useState(false);
    const[bookmarkedItems, setBookmarkedItems] = useState([]);

    //리뷰 추가_오현옥
    const [myReviews, setMyReviews] = useState([]);
    const [editReviewId, setEditReviewId] = useState(null);
    const [editReviewScore, setEditReviewScore] = useState(5);
    const [editReviewText, setEditReviewText] = useState("");

    /* ⚡ 카카오 우편번호 레이어 창 제어 토글 변수 */
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    /* ⚡ [슬라이더 전용 핵심 상태] 현재 어떤 카드 인덱스 위치를 바라보고 있는지 카운팅 */
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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

                    // ⚡ [세션 유실 방지 핵심 해결책]
                    // 기존 로그인 세션 데이터(userObj)를 파괴하지 않고, 마이페이지에서 새로 받아온 데이터(res.data.member)만 겹쳐서 저장합니다.
                    // 이렇게 하면 메인페이지 장바구니 제어에 필요한 기존 인증 정보(role, provider 등)가 지워지지 않고 완벽하게 보존됩니다.
                    const mergedUser = { ...userObj, ...res.data.member };
                    sessionStorage.setItem('user', JSON.stringify(mergedUser));
                    
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

    const getMyBookmarkedItems = async()=>{

        if(!member || !member.memberId){
            alert("회원 정보를 찾을 수 없습니다.");
            return;
        }

        try{
            const bookmarkResponse = await axios.get(
                `http://localhost:8080/api/bookmarks/member/${member.memberId}`,
                {
                    withCredentials: true,
                }
            );

            const bookmarks = bookmarkResponse.data || [];

            if(bookmarks.length === 0){
                setBookmarkedItems([]);
                setShowBookmarks(true);
                return;
            }

            const itemResponse = await Promise.all(
                bookmarks.map((bookmark)=>
                axios.get(`http://localhost:8080/api/item/${bookmark.itemId}`,{
                    withCredentials: true,
                })
            )
         );
         
         const items = itemResponse.map((response)=>response.data);

         setBookmarkedItems(items);
         setShowBookmarks(true);
        }catch(error){
            console.error("북마크 상품 목록 조회 실패", error);

            if(error.response){
                console.log("북마크 조회 상태코드:", error.response.status);
                console.log("북마크 조회 응답:",error.response.data);
            }
            
            alert("북마크 목록을 불러오지 못했습니다.");
        }
    };

//구매확정 버튼-->리뷰 쓰기로 넘어감.
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
     * [오현옥] 1. 리뷰 작성 여부 확인 함수 추가
     */

    const findMyReviewByItemId = (itemId)=>{
        if(!itemId){
            return null;
        }
        return myReviews.find(
            (review) => Number(review.itemId)===Number(itemId)
        );
    };

    const hasWrittenReview = (itemId) => {
        return !!findMyReviewByItemId(itemId);
    }

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

    /* ⚡ [슬라이더 핸들러] 왼쪽 화살표 클릭 제어 */
    const handlePrevSlide = () => {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
    };

    /* ⚡ [슬라이더 핸들러] 오른쪽 화살표 클릭 제어 */
    const handleNextSlide = () => {
        const maxIndex = Math.max(orders.length - 4, 0);
        setCurrentSlideIndex((prev) => Math.min(prev + 1, maxIndex));
    };

        return (
        <div className="mypage-grid-container">
            {/* ========================================================= */}
            {/* ⚡ [헤더 시작] 까사미아 스타일 상단 브랜드 바 레이아웃               */}
            {/* ========================================================= */}
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
                <main style={{ textAlgin: 'center', padding: '100px 20px' }}>
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
                            {/* 프로필 옆 북마크 버튼 추가_버튼 누르면 열리고 다시 누르면 닫힘. */}
                            <button className="mypage-action-btn" style={{marginRight: '5px'}}
                                onClick={()=>{
                                    if(showBookmarks){
                                        setShowBookmarks(false);
                                    }else{
                                        getMyBookmarkedItems();
                                    }
                                }}>북마크</button>
                            <button className="mypage-action-btn" onClick={() => navigate(`/member/update/${member.id}`)}>정보 수정</button>
                        </div>
                                {/* 북마크 리스트를 게시판 형태로 보여주기..오현옥 */}
                                {showBookmarks && (
                                <div className="info-content-box" style={{ marginTop: "20px" }}>
                                    <h3 className="info-section-title">내 북마크 상품</h3>

                                    <div className="info-data-block">
                                    {bookmarkedItems.length === 0 ? (
                                        <p>북마크한 상품이 없습니다.</p>
                                    ) : (
                                        <table
                                        style={{
                                            width: "100%",
                                            borderCollapse: "collapse",
                                            fontSize: "14px",
                                        }}
                                        >
                                        <thead>
                                            <tr>
                                            <th>번호</th>
                                            <th>이미지</th>
                                            <th>상품명</th>
                                            <th>가격</th>
                                            <th>판매상태</th>
                                            <th>관리</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {bookmarkedItems.map((item, index) => (
                                            <tr key={item.itemId}>
                                                <td>{index + 1}</td>

                                                <td>
                                                {item.itemImgUrl ? (
                                                    <img
                                                    src={`http://localhost:8080${item.itemImgUrl}`}
                                                    alt={item.itemName}
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        objectFit: "cover",
                                                    }}
                                                    />
                                                ) : (
                                                    <span>이미지 없음</span>
                                                )}
                                                </td>

                                                <td>
                                                <strong>{item.itemName}</strong>
                                                <p>{item.itemCategory || "-"}</p>
                                                </td>

                                                <td>
                                                {Number(
                                                    item.itemFinalPrice || item.itemPrice || 0
                                                ).toLocaleString()}
                                                원
                                                </td>

                                                <td>
                                                {item.itemSellStatus === "SELL" ? (
                                                    <span>판매중</span>
                                                ) : (
                                                    <span>{item.itemSellStatus || "판매불가"}</span>
                                                )}
                                                </td>

                                                <td>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/item/${item.itemId}`)}
                                                >
                                                    상품 보기
                                                </button>
                                                </td>
                                            </tr>
                                            ))}
                                        </tbody>
                                        </table>
                                    )}
                                    </div>
                                </div>
                                )}

                        <div className="info-content-box">
                            <h3 className="info-section-title">회원정보</h3>
                            <div className="info-data-block">
                                <p><strong>아이디:</strong> {member.id}</p>
                                <p><strong>연락처:</strong> {member.phone}</p>
                                <p><strong>이메일:</strong> {member.email || "-"}</p>
                            </div>

                            <h3 id="refund-section" className="info-section-title">구매내역</h3>
                            
                            {/* ⚡ [가로형 슬라이더 프레임 대치 구역] */}
                            <div className="order-slider-wrapper">
                                <button 
                                    className="slider-arrow-btn prev" 
                                    onClick={handlePrevSlide}
                                    disabled={currentSlideIndex === 0}
                                >
                                    &lt;
                                </button>

                                <div className="order-slider-container">
                                    <div 
                                        className="order-slider-track" 
                                        style={{ transform: `translateX(calc(-${currentSlideIndex * 25}% - ${currentSlideIndex * 4}px))` }}
                                    >
                                        {orders && orders.length > 0 ? (
                                            orders.map((order, index) => (
                                                /* 낱개의 독립된 예쁜 정사각형 카드 인덱싱 */
                                                <div key={order.orderId || order.id || index} className="order-square-card">
                                                    <div>
                                                        <p style={{ fontSize: '11px', color: '#8C7A6B', margin: '0 0 6px 0' }}>NO. {order.orderId || order.id}</p>
                                                        <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0' }}>{order.itemName || order.productName}</p>
                                                        
                                                        {/* 🎨 ⚡ [주문상태 이늄 컬러 완전 싱크 마감] */}
                                                        <p 
                                                            style={{ 
                                                                fontSize: '12px', 
                                                                margin: '0 0 2px 0',
                                                                fontWeight: '700',
                                                                color: order.orderState === 'ORDER' ? '#5e4431' : 
                                                                       order.orderState === 'READY' ? '#c45a00' : 
                                                                       order.orderState === 'PURCHASED' ? '#0a5c36' : 
                                                                       order.orderState === 'CANCEL' ? '#a82525' : 
                                                                       order.orderState === 'EXCHANGEorREFUND' ? '#323e4f' : '#111111' 
                                                            }}
                                                        >
                                                            <strong>상태:</strong> {order.orderState}
                                                        </p>
                                                        
                                                        {/* 🎨 ⚡ [배송상태 이늄 컬러 완전 싱크 마감] */}
                                                        <p 
                                                            style={{ 
                                                                fontSize: '12px', 
                                                                margin: '0 0 2px 0',
                                                                fontWeight: '700',
                                                                color: order.deliveryStatus === 'WAITING' ? '#801a24' : 
                                                                       order.deliveryStatus === 'SHIPPING' ? '#c45a00' : 
                                                                       order.deliveryStatus === 'COMPLETED' ? '#0b3161' : 
                                                                       (order.deliveryStatus === 'PICKUP' || order.deliveryStatus === 'REJECTED') ? '#a63d2d' : '#111111'
                                                            }}
                                                        >
                                                            <strong>배송:</strong> {order.deliveryStatus}
                                                        </p>
                                                    </div>
                                                    
                                                    <div style={{ marginTop: '10px' }}>
                                                        {order.orderState === 'PURCHASED' ? (
                                                            hasWrittenReview(order.itemId) ? (
                                                            <span>
                                                                리뷰 작성 완료
                                                            </span>
                                                            ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/item/${order.itemId}`)}
                                                                disabled={!order.itemId}
                                                            >
                                                                리뷰쓰기
                                                            </button>
                                                            )
                                                        ) : order.orderState === "READY" && order.deliveryStatus === "COMPLETED" ? (
                                                            <button
                                                            type="button"
                                                            onClick={() => handleConfirmPurchase(order.orderId || order.id)}
                                                            >
                                                            구매확정
                                                            </button>
                                                        ) : (
                                                            <span
                                                            style={{
                                                                color: "#64748b",
                                                                fontSize: "11px",
                                                                display: "block",
                                                                textAlign: "center",
                                                            }}
                                                            >
                                                            배송완료 후 확정 가능
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="order-square-card" style={{ width: '100%', aspectRatio: 'auto', justifyContent: 'center', alignItems: 'center' }}>
                                                <p style={{ color: '#8c7a6b', margin: 0 }}>최근 주문 내역이 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    className="slider-arrow-btn next"
                                    onClick={handleNextSlide}
                                    disabled={currentSlideIndex >= Math.max(orders.length - 4, 0)}
                                >
                                    &gt;
                                </button>
                            </div>

                            {/* ⚡ 오리지널 100% 완벽 복구된 배송지 설정 구역 */}
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
                                                        {addr.addressName === "기본 배송지" && " (기본)"}
                                                    </p>
                                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#555' }}>
                                                        [{addr.zonecode}] {addr.address} {addr.detail}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    ))
                                ) : (
                                    <p style={{ color: '#8c7a6b', margin: 0 }}>등록된 배송지가 없습니다.</p>
                                )}
                            </div>

                            {/* ⚡ 오리지널 100% 완벽 복구된 나의 리뷰 관리 구역 .... ai가 필드명을 다..바꿔놨어요..*/}
                           <h3 id="my-review-section" className="info-section-title">나의 리뷰 관리</h3>
                                <div className="info-data-block">
                                {myReviews && myReviews.length > 0 ? (
                                    myReviews.map((review) => (
                                    <div
                                        key={review.reviewId}
                                        style={{
                                        borderBottom: '1px solid #eee',
                                        padding: '15px 0',
                                        width: '100%',
                                        }}
                                    >
                                        <h4 style={{ margin: '0 0 5px 0' }}>
                                        {review.itemName || "상품명 없음"}
                                        </h4>

                                        <p style={{ margin: '0 0 8px 0', color: '#ffb300' }}>
                                        {"★".repeat(Number(review.reviewScore || 0))}
                                        {"☆".repeat(5 - Number(review.reviewScore || 0))}
                                        {" "}
                                        ({review.reviewScore}점)
                                        </p>

                                        <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
                                        {review.reviewText || "작성된 리뷰 내용이 없습니다."}
                                        </p>

                                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#999' }}>
                                        작성일:{" "}
                                        {review.createdAt ? String(review.createdAt).substring(0, 10) : "-"}
                                        </p>

                                        {editReviewId === review.reviewId ? (
                                        <div
                                            style={{
                                            marginTop: '15px',
                                            padding: '15px',
                                            background: '#f9f9f9',
                                            border: '1px solid #ddd',
                                            }}
                                        >
                                            <select
                                            value={editReviewScore}
                                            onChange={(e) => setEditReviewScore(Number(e.target.value))}
                                            style={{
                                                padding: '5px',
                                                marginBottom: '10px',
                                                display: 'block',
                                            }}
                                            >
                                            <option value={5}>⭐⭐⭐⭐⭐ (5점)</option>
                                            <option value={4}>⭐⭐⭐⭐ (4점)</option>
                                            <option value={3}>⭐⭐⭐ (3점)</option>
                                            <option value={2}>⭐⭐ (2점)</option>
                                            <option value={1}>⭐ (1점)</option>
                                            </select>

                                            <textarea
                                            value={editReviewText}
                                            onChange={(e) => setEditReviewText(e.target.value)}
                                            maxLength={255}
                                            style={{
                                                width: '100%',
                                                height: '80px',
                                                padding: '8px',
                                                boxSizing: 'border-box',
                                                marginBottom: '10px',
                                            }}
                                            />

                                            <div>
                                            <button
                                                className="mypage-action-btn"
                                                style={{ marginRight: '5px' }}
                                                onClick={() => handleUpdateReview(review.reviewId)}
                                            >
                                                수정완료
                                            </button>

                                            <button
                                                className="mypage-action-btn"
                                                onClick={() => setEditReviewId(null)}
                                            >
                                                취소
                                            </button>
                                            </div>
                                        </div>
                                        ) : (
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                            className="mypage-action-btn"
                                            onClick={() => handleEditReviewStart(review)}
                                            >
                                            수정하기
                                            </button>

                                            <button
                                            className="mypage-action-btn"
                                            onClick={() => handleDeleteReview(review.reviewId)}
                                            style={{ color: "red" }}
                                            >
                                            삭제
                                            </button>
                                        </div>
                                        )}
                                    </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#8c7a6b', margin: 0 }}>
                                    작성한 리뷰가 존재하지 않습니다.
                                    </p>
                                )}
                                </div>
                        </div>
                    </main>
                </div>
            )}

            {/* ========================================================= */}
            {/* ⚡ [푸터 시작] 하단 기업 정보 및 미니멀 카피라이트 마크업          */}
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


export default Mypage;
