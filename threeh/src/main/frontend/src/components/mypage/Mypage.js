import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/myPageCss/myPage.Css';

const Mypage = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);

    const [myReviews, setMyReviews] = useState([]);
    const [editReviewId, setEditReviewId] = useState(null);
    const [editReviewScore, setEditReviewScore] = useState(5);
    const [editReviewText, setEditReviewText] = useState("");

    useEffect(() => {
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            const userObj = JSON.parse(savedUser);
            setMember(userObj);

            axios.get('http://localhost:8080/Member/mypage.do', { withCredentials: true })
                .then(res => {
                    setMember(res.data.member);
                    setAddresses(res.data.addressList || []);
                    
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

    const addAddress = () => {
        const city = prompt("도시 (예: 서울시)");
        const street = prompt("도로명 주소 (예: 강남대로)");
        const zipcode = prompt("우편번호 (예: 12345)");
        const addrDetail = prompt("상세 주소 (예: 101동 101호)");
        if (!city || !street) return;
        const newAddressObj = { id: Date.now(), addressName: "추가된 배송지", street: street, addrDetail: addrDetail };
        setAddresses(prevAddresses => [...prevAddresses, newAddressObj]);
        alert("배송지가 등록되었습니다!");
    };

    const handleSetDefault = (addressId) => {
        axios.post(`http://localhost:8080/address/default/${addressId}`, {}, { withCredentials: true })
            .then(() => { alert("기본 배송지가 변경되었습니다."); window.location.reload(); })
            .catch(err => alert("변경 실패"));
    };

    const deleteAddress = (addressId) => {
        if (window.confirm("배송지를 삭제하시겠습니까?")) {
            setAddresses(addresses.filter(addr => addr.id !== addressId));
        }
    };

    const handleDelete = () => {
        if (window.confirm("정말로 탈퇴하시겠습니까?")) {
            axios.post('http://localhost:8080/Member/delete', {}, { withCredentials: true })
                .then((res) => { alert("탈퇴가 완료되었습니다."); sessionStorage.removeItem('user'); navigate('/'); })
                .catch(err => { console.error("탈퇴 오류:", err); alert("탈퇴 실패: " + (err.response?.data || "서버 오류가 발생했습니다.")); });
        }
    };

    const getMyReviews = async() =>{
        try{
            const response = await axios.get("http://localhost:8080/api/reviews/my", { withCredentials:true });
            setMyReviews(response.data);
        }catch(error){ console.error("내 리뷰 조회 실패", error); }
    };

    const handleEditReviewStart = (review) => { setEditReviewId(review.reviewId); setEditReviewScore(review.reviewScore); setEditReviewText(review.reviewText); };
    
    const handleUpdateReview = async(reviewId) => {
        try{
            await axios.put(`http://localhost:8080/api/reviews/${reviewId}`, { reviewScore: editReviewScore, reviewText: editReviewText }, { withCredentials:true });
            alert("리뷰가 수정되었습니다."); setEditReviewId(null); getMyReviews();
        }catch(error){ alert("리뷰 수정 실패"); }
    };

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
                    <h2>로그인이 필요한 서비스입니다.</h2>
                </main>
            ) : (
                <div style={{ display: 'flex' }}>
                    <aside className="mypage-sidebar">
                        <button className="sidebar-btn" onClick={() => navigate('/mypage/schedule')}>추가될 기능</button>
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
                                                <p><strong>주문상태:</strong> {order.deliveryStatus}</p>
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
                                        <div key={addr.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                                            <p><strong>{addr.addressName || "배송지"}</strong>: {addr.street} {addr.addrDetail}</p>
                                            <button onClick={() => deleteAddress(addr.id)}>삭제</button>
                                        </div>
                                    ))
                                ) : (
                                    <p>등록된 추가 배송지가 없습니다.</p>
                                )}
                                <button className="mypage-action-btn" style={{ marginTop: '15px' }} onClick={addAddress}>+ 새 배송지 추가</button>
                            </div>
                            
                            <button className="mypage-action-btn" onClick={handleDelete} style={{ color: 'red', marginTop: '30px' }}>회원 탈퇴</button>
                        </div>

                        <div style={{marginTop:"40px"}}>
                            <h2>내가 작성한 리뷰</h2>
                            {myReviews.map((review)=>(
                                <div key={review.reviewId} style={{ borderBottom:"1px solid #ddd", padding: "15px 0" }}>
                                    <h3>{review.itemName}</h3>
                                    {editReviewId === review.reviewId ? (
                                        <div>
                                            <select value={editReviewScore} onChange={(e)=>setEditReviewScore(Number(e.target.value))}>
                                                {[5,4,3,2,1].map(s => <option key={s} value={s}>{s}점</option>)}
                                            </select>
                                            <textarea value={editReviewText} onChange={(e)=>setEditReviewText(e.target.value)} rows={4} maxLength={255} style={{width:"100%", marginTop:"10px",padding:"10px"}}/>
                                            <button type="button" onClick={()=>handleUpdateReview(review.reviewId)}>저장</button>
                                            <button type="button" onClick={()=>setEditReviewId(null)} style={{marginLeft:"10px"}}>취소</button>
                                        </div>
                                    ):(
                                        <div>
                                            <p style={{ color: "#f5a623" }}>{"★".repeat(Number(review.reviewScore))} {"☆".repeat(5-Number(review.reviewScore))}</p>
                                            <p>{review.reviewText}</p>
                                            <small>작성일: {review.createdAt ? String(review.createdAt).substring(0,10):""}</small>
                                            <div style={{marginTop:"10px"}}>
                                                <button type="button" onClick={()=>handleEditReviewStart(review)}>수정</button>
                                                <button type="button" onClick={()=>handleDeleteReview(review.reviewId)} style={{marginLeft:"10px"}}>삭제</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            )}
        </div>
    );
};

export default Mypage;