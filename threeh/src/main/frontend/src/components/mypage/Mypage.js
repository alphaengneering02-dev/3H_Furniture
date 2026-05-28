import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
/* ⚡ DaumPostCode 라이브러리 임포트 유지 */
import DaumPostCode from 'react-daum-postcode';
/* 💡 폴더명(mypageCss)과 파일명(myPage.css) 대소문자 규격 오차 없이 싱크 적용 */
import '../../css/myPageCss/myPage.css';
import { useToast } from '../../hook/useToast';
import { ToastContainer, toast } from "react-toastify";
import Header from '../main/Header';
import Footer from "../main/Footer";


const Mypage = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isAllOrdersOpen, setIsAllOrdersOpen] = useState(false); // 구매내역 전체보기 토글

    const { success, error, warn, info } = useToast();

    
    //북마크 추가_오현옥
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [bookmarkedItems, setBookmarkedItems] = useState([]);

    //리뷰 추가_오현옥
    const [myReviews, setMyReviews] = useState([]);
    const [editReviewId, setEditReviewId] = useState(null);
    const [editReviewScore, setEditReviewScore] = useState(5);
    const [editReviewText, setEditReviewText] = useState("");

    /* 다음 우편번호 레이어 창 제어 토글 변수 */
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    // [배송지 보완 상태 변수]: 사용자가 입력창에 적을 상세주소 임시 보관함
    const [tempDetail, setTempDetail] = useState("");

    /* [슬라이더 전용 핵심 상태] 현재 어떤 카드 인덱스 위치를 바라보고 있는지 카운팅 */
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    
    const [isLoading, setIsLoading] = useState(true);



    const getMyReviews = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/reviews/my", { withCredentials: true });
            setMyReviews(response.data);
        } catch (error) { console.error("내 리뷰 조회 실패", error); }
    };

    //오현옥 북마크
    const getMyBookmarkedItems = async (memberData) => {

        const targetMember = memberData || member;

        if (!targetMember || !targetMember.memberId) {
            error("회원 정보를 찾을 수 없습니다.");
            return;
        }
        try {
            const bookmarkResponse = await axios.get(
                `http://localhost:8080/api/bookmarks/member/${targetMember.memberId}`,
                { withCredentials: true }
            );

            console.log("북마크 데이터", bookmarkResponse);
            const bookmarks = bookmarkResponse.data || [];
            if (bookmarks.length === 0) {
                setBookmarkedItems([]);
                setShowBookmarks(true);
                return;
            }
            const itemResponse = await Promise.all(
                bookmarks.map((bookmark) =>
                    axios.get(`http://localhost:8080/api/item/${bookmark.itemId}`, { withCredentials: true })
                )
            );
            const items = itemResponse.map((response) => response.data);
            setBookmarkedItems(items);
            setShowBookmarks(true);
        } catch (error) {
            console.error("북마크 상품 목록 조회 실패", error);
            if (error.response) {
                console.log("북마크 조회 상태코드:", error.response.status);
                console.log("북마크 조회 응답:", error.response.data);
            }
            error("북마크 목록을 불러오지 못했습니다.");
        }
    };

    useEffect(() => {
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            const userObj = JSON.parse(savedUser);
            setMember(userObj);

            axios.get('http://localhost:8080/Member/mypage.do', { withCredentials: true })
                .then(res => {
                    setMember(res.data.member);
                    console.log(res.data);

                    // [회원 전용 보관고 연동] 이 브라우저에 이 회원 이름으로 저장된 주소록이 있는지 확인
                    const storageKey = `addresses_${res.data.member.id}`;
                    const localAddresses = localStorage.getItem(storageKey);

                    if (localAddresses) {
                        setAddresses(JSON.parse(localAddresses));
                    } else {
                        setAddresses(res.data.addressList || []);
                    }

                    const allOrders = res.data.recentOrders || [];
                    const activeOrders = allOrders.filter(order => order.orderState !== 'CANCEL');
                    setOrders(activeOrders);

                    const mergedUser = { ...userObj, ...res.data.member };
                    sessionStorage.setItem('user', JSON.stringify(mergedUser));

                    getMyReviews();
                    getMyBookmarkedItems(res.data.member);
                })
                .catch(err => {
                    console.error("최신 데이터 로드 실패", err);
                    if (err.response && err.response.status === 401) {
                        sessionStorage.removeItem('user');
                        setMember(null);
                    }
                })
                .finally(() => {
                    setIsLoading(false); 
                });
        } else {
            setMember(null);
            setIsLoading(false);
        }
    }, []);

    
    console.log(member);
    if(isLoading) return <div>로딩중....</div>;

    
    //구매확정 버튼-->리뷰 쓰기로 넘어감.
    const handleConfirmPurchase = async (orderId) => {
        if (!window.confirm("구매를 확정하시겠습니까?")) return;
        try {
            const params = new URLSearchParams();
            params.append('orderId', orderId);
            const response = await axios.post("http://localhost:8080/Member/purchase/confirm", params, { withCredentials: true });
            success(response.data || "구매가 확정되었습니다.");
            setOrders((prevOrders) => prevOrders.map((order) => (order.orderId || order.id) === orderId ? { ...order, orderState: "PURCHASED" } : order));
        } catch (err) {
            console.error("구매 확정 오류:", err);
            if (err.response) { error(err.response.data); return; }
            error("구매 확정 처리 중 오류가 발생했습니다.");
        }
    };


    // // 주문 취소
    // const handleCancelOrder = (orderId) => {
    //     if (!window.confirm(`주문번호 ${orderId}번 주문을 취소하시겠습니까?`)) {
    //         return;
    //     }

    //     const params = new URLSearchParams();
    //     params.append('orderId', orderId);

    //     // 백엔드의 구매취소 API 엔드포인트 호출
    //     axios.post('http://localhost:8080/Member/order/cancel', params, { withCredentials: true })
    //         .then(res => {
    //             alert(res.data || "주문이 정상적으로 취소되었습니다.");
                
    //             // 상태값만 'CANCEL'로 변경하면 뱃지와 카드가 알아서 실시간으로 지워짐
    //             setOrders(prevOrders => 
    //                 prevOrders.map(order => 
    //                     order.orderId === orderId ? { ...order, orderState: 'CANCEL' } : order
    //                 )
    //             );
    //         })
    //         .catch(err => {
    //             alert(err.response?.data || "주문 취소 중 오류가 발생했습니다.");
    //         });
    // };


    const handleRefund = (orderId, itemId) => {
        if(window.confirm(`주문번호 ${orderId}번을 교환 하시겠습니까?\n재고가 복구되고 주문이 삭제됩니다.`)) {
            const params = new URLSearchParams();
            params.append('orderId',orderId);

            axios.post('http://localhost:8080/Member/refund/process',params, {withCredentials:true})
                .then(res => {
                    success(res.data);

                    setOrders(prevOrders => prevOrders.filter(order => order.orderId !== orderId));

                    if(itemId) {
                        navigate(`/item/${itemId}`);
                    }
                })
                .catch(err => {
                    error(err.response?.data || "처리 중 오류 발생");
                })
        }
    }

    const handleLogout = () => {
        if (window.confirm("로그아웃 하시겠습니까?")) {
            sessionStorage.removeItem('user');
            setMember(null);
            info("로그아웃 되었습니다");
            navigate('/');
        }
    }

    /* [새 배송지 기능 연동] 버튼 누르면 카카오 우편번호창 열리게 처리 */
    const addAddress = () => {
        setIsPostcodeOpen(!isPostcodeOpen);
    };

    /* [카카오 주소 수령 콜백 보정] 고른 주소를 상세주소 입력창으로 전송하도록 가교 역할 매핑 */
    const handleAddressComplete = (data) => {
        if (!member) return;

        // [보완 완료]: 기존에 중복 추가되는 현상을 막고 최신 검색 주소 하나만 딱 임시 노출시킵니다.
        const filtered = addresses.filter(addr => addr.addressName !== "방금 검색한 주소");

        const newAddressObj = {
            id: Date.now(),
            addressName: "방금 검색한 주소",
            zonecode: data.zonecode, // 우편번호 필드 매핑
            address: data.address,   // 도로명주소 필드 매핑
            detail: ""
        };

        setAddresses([...filtered, newAddressObj]);
        setIsPostcodeOpen(false); // 주소 고르면 우편번호 창은 자동으로 닫아줍니다.
    };

    // [인호님 파트 신규 매감 기능]: 임시 주소에 상세주소를 결합하여 주소록 보관함에 최종 등록하는 함수
    const handleSaveNewAddress = (targetId) => {
        if (!tempDetail.trim()) {
            info("상세 주소를 입력해 주세요.");
            return;
        }

        const updatedAddresses = addresses.map(addr => {
            if (addr.id === targetId) {
                return {
                    ...addr,
                    addressName: "추가된 배송지",
                    detail: tempDetail
                };
            }
            return addr;
        });

        localStorage.setItem(`addresses_${member.id}`, JSON.stringify(updatedAddresses));
        setAddresses(updatedAddresses);
        setTempDetail(""); // 입력 폼 초기화
        info("새 배송지가 주소록에 추가되었습니다.");
    };

    /* [회원 전용 상태 스위칭] 서버에 보내지 않고 화면상에서 즉시 배지를 변경한 후 보관함 갱신 */
    const handleSetDefault = (addressId) => {
        if (!member) return;
        const updatedAddresses = addresses.map(addr => {
            if (addr.id === addressId) {
                return { ...addr, addressName: "기본 배송지" };
            } else {
                // 기존 기본 배송지는 추가된 배송지로 스위칭
                return { ...addr, addressName: addr.addressName === "기본 배송지" ? "추가된 배송지" : addr.addressName };
            }
        });
        localStorage.setItem(`addresses_${member.id}`, JSON.stringify(updatedAddresses));
        setAddresses(updatedAddresses);
        success("기본 배송지가 변경되었습니다.");
    };

    /* [회원 전용 삭제 연동] 보관함에서 삭제 처리 기능 연동 */
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
                .then((res) => { success("탈퇴가 완료되었습니다."); sessionStorage.removeItem('user'); navigate('/'); })
                .catch(err => { console.error("탈퇴 오류:", err); error("탈퇴 실패: " + (err.response?.data || "서버 오류가 발생했습니다.")); });
        }
    };

    /* =========================================================================
     * [오현옥 개발파트] 리뷰 관리 시스템 핵심 비즈니스 로직 연동 핸들러 정의 구역
     * ========================================================================= */

    


    const findMyReviewByItemId = (itemId) => {
        if (!itemId) { return null; }
        return myReviews.find((review) => Number(review.itemId) === Number(itemId));
    };

    const hasWrittenReview = (itemId) => {
        return !!findMyReviewByItemId(itemId);
    }

    const handleEditReviewStart = (review) => {
        setEditReviewId(review.reviewId);
        setEditReviewScore(review.reviewScore);
        setEditReviewText(review.reviewText);
    };

    const handleUpdateReview = async (reviewId) => {
        try {
            await axios.put(`http://localhost:8080/api/reviews/${reviewId}`, { reviewScore: editReviewScore, reviewText: editReviewText }, { withCredentials: true });
            success("리뷰가 수정되었습니다."); setEditReviewId(null); getMyReviews();
        } catch (error) { error("리뷰 수정 실패"); }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`, { withCredentials: true });
            success("리뷰가 삭제되었습니다."); getMyReviews();
        } catch (error) { error("리뷰 삭제 실패"); }
    }

    /* [슬라이더 핸들러] 왼쪽 화살표 클릭 제어 */
    const handlePrevSlide = () => {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
    };

    /* [슬라이더 핸들러] 오른쪽 화살표 클릭 제어 */
    const handleNextSlide = () => {
        const maxIndex = Math.max(orders.length - 4, 0);
        setCurrentSlideIndex((prev) => Math.min(prev + 1, maxIndex));
    };

    return (
    <div className="mypage-grid-container">
        {/* ========================================================= */}
        {/* 🤎 [통일 규격] 조원분의 실제 검색/GNB 기능이 담긴 글로벌 헤더      */}
        {/* ========================================================= */}
        {/* ⚡ [세션 완치]: 조원분 헤더와 인호님의 동적 세션 회원 감지 시스템을 유기적으로 결합 완료 */}
        <Header />

    <ToastContainer
      position="top-center"
      autoClose={1800}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      pauseOnHover
      theme="light"
    />

        {/* ⚡ 기존 헤더에 들어있던 member 로그인 상태 검증 로직을 본문 입구로 완벽 복구 */}
        {!member ? (
             <main style={{ textAlign: 'center', padding: '100px 20px' }}>
        /        <h2>로그인이 필요한 service입니다.</h2>
             </main>
         ) : ( 
             <div style={{ display: 'flex', marginTop: '20px' }}> 
                {/* 📌 좌측 사이드바 메뉴 */}
                 <aside className="mypage-sidebar">
                   <button className="sidebar-btn" onClick={() => navigate('/mypage/schedule')}>구매확정내역</button>
                    <button className="sidebar-btn" onClick={() => navigate('/cart/return')}>교환 및 반품</button>
                    <button className="sidebar-btn" onClick={() => navigate('/cart')}>장바구니 목록</button>
                    <div className="sidebar-furniture-banner" onClick={() => navigate('/Item')} style={{ cursor: 'pointer' }} title="전체 가구 컬렉션 보러가기" />
                </aside>

                {/* 📄 우측 메인 콘텐츠 피드 구역 */}
                <main className="mypage-main-content" style={{ flex: 1, padding: '20px' }}>
                    
                    {/* 북마크 리스트를 게시판 형태로 보여주기..오현옥 */}
                    {showBookmarks && (
                        <div className="mypage-info-content-box" style={{ marginTop: "20px" }}>
                            <h3 className="mypage-info-section-title">내 북마크 상품</h3>
                            <div className="mypage-info-data-block">
                                {bookmarkedItems.length === 0 ? (
                                    <p>북마크한 상품이 없습니다.</p>
                                ) : (
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
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
                                                            <img src={`http://localhost:8080${item.itemImgUrl}`} alt={item.itemName} style={{ width: "60px", height: "60px", objectFit: "cover" }} />
                                                        ) : (<span>이미지 없음</span>)}
                                                    </td>
                                                    <td>
                                                        <strong>{item.itemName}</strong>
                                                        <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "12px" }}>{item.itemCategory || "-"}</p>
                                                    </td>
                                                    <td>{Number(item.itemFinalPrice || item.itemPrice || 0).toLocaleString()}원</td>
                                                    <td>{item.itemSellStatus === "SELL" ? <span>판매중</span> : <span>{item.itemSellStatus || "판매불가"}</span>}</td>
                                                    <td>
                                                        <button type="button" onClick={() => navigate(`/item/${item.itemId}`)}>상품 보기</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}



                        <div className="mypage-info-content-box">
                            <h3 className="mypage-info-section-title">회원정보</h3>
                            <div className="mypage-info-data-block">
                                <p><strong>아이디:</strong> {member.id}</p>
                                <p><strong>연락처:</strong> {member.phone}</p>
                                <p><strong>이메일:</strong> {member.email || "-"}</p>
                                <button onClick={() => navigate(`/member/update/${member.id}`)}>정보수정</button>
                            </div>

                            <h3 id="refund-section" className="mypage-info-section-title">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    구매내역
                                    <span className="mypage-order-count-badge">
                                        총 {orders ? orders.filter(order => order.orderState !== 'CANCEL' && order.orderState !== 'EXCHANGEorREFUND').length : 0}건</span>
                                </div>
                                <button type="button" className="mypage-action-btn" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setIsAllOrdersOpen(!isAllOrdersOpen)}>
                                    {isAllOrdersOpen ? "접기 ▲" : "전체보기 ▼"}
                                </button>
                            </h3>


                            {/* [가로형 슬라이더 프레임 대치 구역] */}
                            <div className="mypage-order-slider-wrapper">
                                <button className="mypage-slider-arrow-btn prev" onClick={handlePrevSlide} disabled={currentSlideIndex === 0}>&lt;</button>
                                <div className="mypage-order-slider-container">

                                    {/* 👇 딱 이 1줄(트랙 선언부)만 조건부 연산자로 스위칭 완료되었습니다! */}
                                    <div
                                        className={`mypage-order-slider-track ${isAllOrdersOpen ? 'grid-view' : ''}`}
                                        style={isAllOrdersOpen ? { transform: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', width: '100%' } : { transform: `translateX(calc(-${currentSlideIndex * 25}% - ${currentSlideIndex * 4}px))` }}
                                    >

                                        {orders && orders.length > 0 ? (
                                            orders
                                            .filter(order => order.orderState !== 'CANCEL' && order.orderState !== 'EXCHANGEorREFUND' )
                                            .map((order, index) => (
                                                /* 낱개의 독립된 예쁜 정사각형 카드 인덱싱 */
                                                <div key={order.orderId || order.id || index} className="mypage-order-square-card">
                                                    <div>
                                                        <p style={{ fontSize: '11px', color: '#8C7A6B', margin: '0 0 6px 0' }}>NO. {order.orderId || order.id}</p>
                                                        <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0' }}>{order.itemName || order.productName}</p>

                                                        {/* [주문상태 이늄 컬러 완전 싱크 마감] */}
                                                        <p style={{
                                                            fontSize: '12px', margin: '0 0 2px 0', fontWeight: '700',
                                                            color: order.orderState === 'ORDER' ? '#5e4431' :
                                                                order.orderState === 'READY' ? '#c45a00' :
                                                                    order.orderState === 'PURCHASED' ? '#0a5c36' :
                                                                        order.orderState === 'CANCEL' ? '#a82525' :
                                                                            order.orderState === 'EXCHANGEorREFUND' ? '#323e4f' : '#111111'
                                                        }}>
                                                            <strong>상태:</strong> {order.orderState}
                                                        </p>


                                                        {/* [배송상태 이늄 컬러 완전 싱크 마감] */}
                                                        <p style={{
                                                            fontSize: '12px', margin: '0 0 2px 0', fontWeight: '700',
                                                            color: order.deliveryStatus === 'WAITING' ? '#801a24' :
                                                                order.deliveryStatus === 'SHIPPING' ? '#c45a00' :
                                                                    order.deliveryStatus === 'COMPLETED' ? '#0b3161' :
                                                                        (order.deliveryStatus === 'PICKUP' || order.deliveryStatus === 'REJECTED') ? '#a63d2d' : '#111111'
                                                        }}>
                                                            <strong>배송:</strong> {order.deliveryStatus}
                                                        </p>
                                                    </div>

                                                    <div style={{ marginTop: '10px' }}>
                                                        {order.orderState === 'PURCHASED' ? (
                                                            hasWrittenReview(order.itemId) ? (
                                                                <span>리뷰 작성 완료</span>
                                                            ) : (
                                                                <button type="button" className="mypage-action-btn" onClick={() => navigate(`/item/${order.itemId}`)} disabled={!order.itemId}>리뷰쓰기</button>
                                                            )
                                                        ) : order.orderState === "READY" && order.deliveryStatus === "COMPLETED" ? (
                                                            <button type="button" className="mypage-action-btn" onClick={() => handleConfirmPurchase(order.orderId || order.id)}>구매확정</button>
                                                        ) : (
                                                            <span style={{ color: "#64748b", fontSize: "11px", display: "block", textAlign: "center" }}>배송완료 후 확정 가능</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="mypage-order-square-card" style={{ width: '100%', aspectRatio: 'auto', justifyContent: 'center', alignItems: 'center' }}>
                                                <p style={{ color: '#8c7a6b', margin: 0 }}>최근 주문 내역이 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button className="mypage-slider-arrow-btn next" onClick={handleNextSlide} disabled={currentSlideIndex >= Math.max(orders.length - 4, 0)}>&gt;</button>
                            </div>

                            {/* 오리지널 100% 완벽 복구된 배송지 설정 구역 (원본 필드명 및 동적 주소 보관함 마감) */}
                            <div className="mypage-address-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
                                <h3 className="mypage-info-section-title" style={{ margin: 0, border: 'none' }}>배송지 설정</h3>
                                <button className="mypage-action-btn" onClick={addAddress}>{isPostcodeOpen ? "주소창 닫기" : "+ 새 배송지 검색"}</button>
                            </div>

                            {isPostcodeOpen && (
                                <div className="mypage-postcode-layer-wrapper" style={{ border: '1px solid #111111', margin: '15px 0' }}>
                                    <DaumPostCode onComplete={handleAddressComplete} />
                                </div>
                            )}

                            <div className="mypage-info-data-block" style={{ marginTop: '15px' }}>
                                {addresses.length > 0 ? (
                                    addresses.map(addr => (
                                        addr.addressName === "방금 검색한 주소" ? (
                                            /* [핵심 보완 구역]: 카카오 주소를 고르고 나면 상세주소를 적을 수 있는 전용 폼 인터페이스 동적 활성화 */
                                            <div key={addr.id} style={{ padding: '15px', background: '#fcfbfa', border: '1px solid #dfd1c0', margin: '10px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#111' }}><strong>선택된 주소:</strong> [{addr.zonecode}] {addr.address}</p>
                                                <input
                                                    type="text"
                                                    placeholder="상세 주소를 입력하세요 (예: 101동 202호)"
                                                    value={tempDetail}
                                                    onChange={(e) => setTempDetail(e.target.value)}
                                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', fontSize: '13px' }}
                                                />
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    <button type="button" className="mypage-action-btn" onClick={() => handleSaveNewAddress(addr.id)}>배송지 추가 완료</button>
                                                    <button type="button" className="mypage-action-btn" onClick={() => deleteAddress(addr.id)}>취소</button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* 일반 배송지 내역 리스트 출력부 */
                                            <div key={addr.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ margin: 0 }}>
                                                        <strong>{addr.addressName || "배송지"}</strong>
                                                        {addr.addressName === "기본 배송지" && " (기본)"}
                                                    </p>
                                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#555' }}>
                                                        [{addr.zonecode}] {addr.address} {addr.detail || "상세주소 없음"}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    {addr.addressName !== "기본 배송지" && (
                                                        <button type="button" className="mypage-action-btn" onClick={() => handleSetDefault(addr.id)}>기본지로 설정</button>
                                                    )}
                                                    <button type="button" className="mypage-action-btn" style={{ borderColor: '#a63d2d', color: '#a63d2d' }} onClick={() => deleteAddress(addr.id)}>삭제</button>
                                                </div>
                                            </div>
                                        )
                                    ))
                                ) : (
                                    <p style={{ color: '#8c7a6b', margin: 0 }}>등록된 배송지가 없습니다.</p>
                                )}
                            </div>

                            {/* 오리지널 100% 완벽 복구된 나의 리뷰 관리 구역 (인호님 원본 필드명 복구) */}
                            <h3 id="my-review-section" className="mypage-info-section-title">나의 리뷰 관리</h3>
                            <div className="mypage-info-data-block">
                                {myReviews && myReviews.length > 0 ? (
                                    myReviews.map((review) => (
                                        <div key={review.reviewId} style={{ borderBottom: '1px solid #eee', padding: '15px 0', width: '100%' }}>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{review.itemName || "상품명 없음"}</h4>
                                            <p style={{ margin: '0 0 8px 0', color: '#ffb300' }}>
                                                {"★".repeat(Number(review.reviewScore || 0))}
                                                {"☆".repeat(5 - Number(review.reviewScore || 0))}
                                                {" "}({review.reviewScore}점)
                                            </p>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>{review.reviewText || "작성된 리뷰 내용이 없습니다."}</p>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#999' }}>작성일: {review.createdAt ? String(review.createdAt).substring(0, 10) : "-"}</p>

                                            {editReviewId === review.reviewId ? (
                                                <div style={{ marginTop: '15px', padding: '15px', background: '#f9f9f9', border: '1px solid #ddd' }}>
                                                    <select value={editReviewScore} onChange={(e) => setEditReviewScore(Number(e.target.value))} style={{ padding: '5px', marginBottom: '10px', display: 'block' }}>
                                                        <option value={5}>⭐⭐⭐⭐⭐ (5점)</option>
                                                        <option value={4}>⭐⭐⭐⭐ (4점)</option>
                                                        <option value={3}>⭐⭐⭐ (3점)</option>
                                                        <option value={2}>⭐⭐ (2점)</option>
                                                        <option value={1}>⭐ (1점)</option>
                                                    </select>
                                                    <textarea value={editReviewText} onChange={(e) => setEditReviewText(e.target.value)} maxLength={255} style={{ width: '100%', height: '80px', padding: '8px', boxSizing: 'border-box', marginBottom: '10px' }} />
                                                    <div>
                                                        <button className="mypage-action-btn" style={{ marginRight: '5px' }} onClick={() => handleUpdateReview(review.reviewId)}>수정완료</button>
                                                        <button className="mypage-action-btn" onClick={() => setEditReviewId(null)}>취소</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", gap: "8px", width: "100%", justifyContent: "flex-end", alignItems: "center", marginTop: "15px", boxSizing: "border-box" }} className="mypage-review-btn-row">
                                                    <button className="mypage-action-btn" onClick={() => handleEditReviewStart(review)}>수정하기</button>
                                                    <button className="mypage-action-btn" onClick={() => handleDeleteReview(review.reviewId)} style={{ color: "red" }}>삭제</button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#8c7a6b', margin: 0 }}>작성한 리뷰가 존재하지 않습니다.</p>
                                )}
                            </div>

                            {/* 탈퇴 기능 최하단 배치 */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '60px' }}>
                                <span onClick={handleDelete} style={{ fontSize: '17px', color: '#ff4d4f', cursor: 'pointer', textDecoration: 'underline' }}>회원 탈퇴하기</span>
                            </div>
                        </div>
                    </main>
                </div>
            )}

            {/* ========================================================= */}
            {/* [푸터 시작] 하단 기업 정보 및 미니멀 카피라이트 마크업          */}
            {/* ========================================================= */}
            <footer className="mypage-footer">
                <div className="mypage-footer-content">
                    <p className="mypage-footer-logo">PROJECT CMYK</p>
                    <p className="mypage-footer-info">주식회사 씨엠와이케이 | 공동 프로젝트 팀 | 경기도 수원시 팔달구</p>
                    <p className="mypage-footer-copy">© 2026 PROJECT CMYK. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};


export default Mypage;
