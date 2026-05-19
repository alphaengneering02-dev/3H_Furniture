import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Mypage = () => {
    //[페이지 이동 도구] useNavigate를 Navigate로 사용함
    const navigate = useNavigate();
    //[상태관리] 회원정보와 배송지목록 데이터 담기
    const [member, setMember] = useState(null);
    const [addresses, setAddresses] = useState([]);
    //주문 목록을 담을 상태 상자
    const [orders, setOrders] = useState([]);

    //추가_오현옥 리뷰 관리
    const[myReviews, setMyReviews] = useState([]);
    const[editReviewId, setEditReviewId] = useState(null);
    const[editReviewScore,setEditReviewScore] = useState(5);
    const[editReviewText, setEditReviewText] = useState("");

    useEffect(() => {
        //세션스토리지에서 user라는 이름으로 저장된 정보를 가져옴
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            const userObj = JSON.parse(savedUser);
            setMember(userObj);
            getMyReviews(); //추가 오현옥_리뷰관리

            //서버에서 최신 정보(회원+주소목록) 가져와서 동기화
            axios.get('http://localhost:8080/Member/mypage.do', { withCredentials: true })
                .then(res => {
                    setMember(res.data.member);
                    setAddresses(res.data.addressList || []);
                    setOrders(res.data.recentOrders || []);

                    sessionStorage.setItem('user', JSON.stringify(res.data.member));
                })
                .catch(err => {
                    console.error("최신 데이터 로드 실패", err);
                    if (err.response && err.response.status === 401) {
                        sessionStorage.removeItem('user');
                        setMember(null);
                    }
                })

        } else {
            //정보가 없으면 비로그인 상태로 설정
            setMember(null);
        }
    }, []);

    //[추가] 교환 및 반품
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

    //[로그아웃 기능] 세션을 삭제하고 메인 페이지로 보냄
    const handleLogout = () => {
        if (window.confirm("로그아웃 하시겠습니까?")) {
            //조장님 가이드에 따라 user 세션에서 비움
            sessionStorage.removeItem('user');
            setMember(null);
            alert("로그아웃 되었습니다");
            navigate('/');
        }
    }

    /**
     * [조장님 참고용 - 새 배송지 추가 로직]
     * 사용자가 입력한 주소 데이터를 리액트 상단 State인 'addresses' 배열에 실시간으로 누적(Push)합니다.
     * 새로고침 없이 화면에 즉시 반영되며, 오더(주문서) 파트 개발 시 이 addresses 상태 배열을 
     * 그대로 참조하거나 넘겨받아서 주문서 선택창(라디오 버튼/드롭다운 등)에 바인딩하시면 됩니다.
     */
    const addAddress = () => {
        const city = prompt("도시 (예: 서울시)");
        const street = prompt("도로명 주소 (예: 강남대로)");
        const zipcode = prompt("우편번호 (예: 12345)");
        const addrDetail = prompt("상세 주소 (예: 101동 101호)");

        // 필수 항목 유효성 체크
        if (!city || !street) return;

        // 마이페이지 프론트단 UI 동기화를 위한 주소 객체 생성
        const newAddressObj = {
            id: Date.now(), // 삭제 처리 및 가상 DOM Key를 위한 고유 타임스탬프 ID
            addressName: "추가된 배송지",
            street: street,
            addrDetail: addrDetail
        };

        // 중요: 기존 주소 리스트 뒤에 신규 주소 객체를 불변성을 유지하며 병합 (여러 개 누적 가능)
        setAddresses(prevAddresses => [...prevAddresses, newAddressObj]);
        alert("배송지가 등록되었습니다!");
    };

    //배송지 수정
    const handleSetDefault = (addressId) => {
        axios.post(`http://localhost:8080/address/default/${addressId}`, {}, { withCredentials: true })
            .then(() => {
                alert("기본 배송지가 변경되었습니다.");
                window.location.reload();
            })
            .catch(err => alert("변경 실패"));
    };

    /**
     * [조장님 참고용 - 배송지 삭제 로직]
     * 화면상에 실시간 추가된 주소들을 addresses State 내에서 id 필터링을 통해 
     * 클라이언트단에서 즉시 컴포넌트 갱신(삭제) 처리합니다.
     */
    const deleteAddress = (addressId) => {
        if (window.confirm("배송지를 삭제하시겠습니까?")) {
            setAddresses(addresses.filter(addr => addr.id !== addressId));
        }
    };

    /**
     * [조장님 참고용 - 회원탈퇴 로직]
     * 팀 백엔드 대문자 공통 URL 규칙(/Member)에 맞춰 매핑 주소를 수정해 두었습니다.
     * 탈퇴 성공 시 브라우저 세션 클리어 후 메인 화면으로 리다이렉트됩니다.
     */
    const handleDelete = () => {
        if (window.confirm("정말로 탈퇴하시겠습니까?")) {
            // 💡 서버의 MemberAddressController 경로(/Member/delete)에 맞게 호출
            axios.post('http://localhost:8080/Member/delete', {}, { withCredentials: true })
                .then((res) => {
                    alert("탈퇴가 완료되었습니다.");
                    sessionStorage.removeItem('user');
                    navigate('/');
                })
                .catch(err => {
                    console.error("탈퇴 오류:", err);
                    alert("탈퇴 실패: " + (err.response?.data || "서버 오류가 발생했습니다."));
                });
        }
    };

    //코드 추가_오현옥(리뷰 목록 조회 함수)==========================
    const getMyReviews = async() =>{
        try{
            const response = await axios.get(
                "http://localhost:8080/api/reviews/my",
                {
                    withCredentials:true,
                }
            );

            console.log("내 리류 목록:" , response.data);
            setMyReviews(response.data);
        }catch(error){
            console.error("내 리뷰 조회 실패", error);

            if(error.response?.status === 401){
                alert("로그인이 필요합니다.");
                navigate("/login");
                return;
            }
        }
    };

    //리뷰 수정 함수_오현옥
    const handleEditReviewStart = (review) =>{
        setEditReviewId(review.reviewId);
        setEditReviewScore(review.reviewScore);
        setEditReviewText(review.reviewText);
    };
    
    //리뷰 수정 저장 함수_오현옥
    const handleUpdateReview =async(reviewId) =>{
        if(!editReviewScore || editReviewScore <1 || editReviewScore>5){
            alert("별점은 1점 이상 5점 이하로 선택해주세요.");
            return;
        }
        if(!editReviewText.trim()){
            alert("리뷰 내용을 입력해주세요.");
            return;
        }
        if(editReviewText.length>255){
            alert("리뷰 내용은 255자를 초과할 수 없습니다.");
            return;
        }
        try{
            await axios.put(
                `http://localhost:8080/api/reviews/${reviewId}`,
                {
                    reviewScore: editReviewScore,
                    reviewText: editReviewText,
                },
                {
                    withCredentials:true,
                }
            );

            alert("리뷰가 수정되었습니다.");
            setEditReviewId(null);
            setEditReviewScore(5);
            setEditReviewText("");

            getMyReviews();
        }catch(error){
            console.error("리뷰 수정 실패",error);

            if(error.response){
                alert(error.response.data);
                return;
            }
            alert("리뷰 수정 실패");
        }
    };

    //리뷰 삭제 함수 _ 오현옥
    const handleDeleteReview = async(reviewId)=>{
        const confirmDelete = window.confirm("리뷰를 삭제하시겠습니까?");
        
        if(!confirmDelete){
            return;
        }

        try{
            await axios.delete(
                `http://localhost:8080/api/reivews/${reviewId}`,
                {
                    withCredentials:true,
                }
            );

            alert("리뷰가 삭제되었습니다.");
            getMyReviews();
        }catch(error){
            console.error("리뷰 삭제 실패",error);

            if(error.response){
                alert(error.response.data);
                return;
            }

            alert("리뷰 삭제 실패");
        }
    }



    return (
        <div className="mypage-grid-container">
            {/* 상단 헤더 */}
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
                // 비로그인 상태
                <main style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <h2>로그인이 필요한 서비스입니다.</h2>
                    <p>마이페이지를 이용하시려면 로그인을 해주세요.</p>
                    <button
                        className="mypage-action-btn"
                        onClick={() => navigate('/login')}
                        style={{ padding: '10px 30px', marginTop: '20px', backgroundColor: '#333', color: '#fff' }}
                    >
                        로그인하러 가기
                    </button>
                </main>
            ) : (
                // 로그인 상태
                <div style={{ display: 'flex' }}>
                    <aside className="mypage-sidebar">
                        <button className="sidebar-btn" onClick={() => navigate('/schedule')}>배송/설치 시간 내역</button>
                        <button className="sidebar-btn" onClick={() => navigate('/cart/return')}>구매내역 / 교환 및 반품</button>
                        <button className="sidebar-btn" onClick={() => navigate('/cart')}>장바구니 목록</button>
                    </aside>

                    <main className="mypage-main-content" style={{ flex: 1, padding: '20px' }}>
                        <div className="profile-icon-box">
                            <div className="profile-avatar-circle">
                                {member.name ? member.name : "U"}
                            </div>
                            <p style={{ margin: '10px' }}><strong>{member?.name}</strong>님 환영합니다</p>
                            <button className="mypage-action-btn" onClick={() => navigate(`/member/update/${member.id}`)}>정보 수정</button>
                        </div>

                        {/* 회원정보 */}
                        <div className="info-content-box">
                            <h3 className="info-section-title">회원정보</h3>
                            <div className="info-data-block">
                                <p><strong>아이디:</strong> {member.id}</p>
                                <p><strong>연락처:</strong> {member.phone}</p>
                                <p><strong>이메일:</strong> {member.email || "-"}</p>
                            </div>

                            {/* 교환 및 반품 신청 섹션 - 조장님 백엔드 변수 규칙 반영 및 토스 자동화 */}
                            <h3 id="refund-section" className="info-section-title">구매내역 / 교환 및 반품 신청</h3>
                            <div className="info-data-block">
                                {orders && orders.length > 0 ? (
                                    orders.map((order, index) => (
                                        <div key={order.orderId || order.id || index} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                {/* order.orderId와 order.itemName으로 조장님 변수 전면 교체 */}
                                                <p><strong>주문번호:</strong> {order.orderId || order.id || "번호 확인중"}</p>
                                                <p><strong>상품명:</strong> {order.itemName || order.productName || "주문 상품"}</p>
                                                <p style={{ fontSize: '12px', color: '#888' }}>
                                                    주문일: {order.orderDate ? new Date(order.orderDate).toLocaleString() : "-"}
                                                </p>
                                            </div>
                                            <button
                                                className="mypage-action-btn"
                                                /* 클릭 시 취소로직이 대기 중인 인호님의 반품 페이지(/cart/return)로 데이터를 패킹해서 들고 이동시킵니다. */
                                                onClick={() => navigate('/cart/return', { 
                                                    state: { 
                                                        orderItems: [{
                                                            orderId: order.orderId || order.id,
                                                            itemName: order.itemName || order.productName,
                                                            price: order.price,
                                                            count: order.count || 1,
                                                            itemImage: order.itemImage
                                                        }] 
                                                    } 
                                                })}
                                                style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '8px 15px', cursor: 'pointer' }}
                                            >
                                                반품신청
                                            </button>
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
                                <button className="mypage-action-btn" style={{ marginTop: '15px' }} onClick={addAddress}>
                                    + 새 배송지 추가
                                </button>
                            </div>
                            {member && (
                                <button className="mypage-action-btn" onClick={handleDelete} style={{ color: 'red', marginTop: '30px' }}>
                                    회원 탈퇴
                                </button>
                            )}
                        </div>

                        {/* 리뷰영역_오현옥 */}
                        <div style={{marginTop:"40px"}}>
                            <h2>내가 작성한 리뷰</h2>
                            
                            {myReviews.length === 0?(
                                <p>작성한 리뷰가 없습니다.</p>
                            ):(
                                myReviews.map((review)=>(
                                    <div key={review.reviewId}
                                    style={{
                                        borderBottom:"1px solid #ddd",
                                        padding: "15px 0",
                                    }}>

                                    <h3>{review.itemName}</h3>
                                    {editReviewId === review.reviewId ? (
                                        <div>
                                            <select value={editReviewScore} onChange={(e)=>
                                                setEditReviewScore(Number(e.target.value))}>
                                                        <option value={5}>★★★★★ 5점</option>
                                                        <option value={4}>★★★★☆ 4점</option>
                                                        <option value={3}>★★★☆☆ 3점</option>
                                                        <option value={2}>★★☆☆☆ 2점</option>
                                                        <option value={1}>★☆☆☆☆ 1점</option>
                                            </select>
                                            <textarea value={editReviewText}
                                            onChange={(e)=>setEditReviewText(e.target.value)} rows={4}
                                            maxLength={255} style={{width:"100%", marginTop:"10px",padding:"10px"}}/>
                                        
                                        <p>{editReviewText.length}/255</p>

                                            <button type="button" onClick={()=>handleUpdateReview(review.reviewId)}>
                                                    저장
                                            </button>

                                            <button type="button" onClick={()=>setEditReviewId(null)} style={{marginLeft:"10px"}}>
                                                    취소
                                            </button>
                                        </div>
                                    ):(
                                        <div>
                                            <p style={{ color: "#f5a623", fontSize: "20px" }}>
                                                {"★".repeat(review.reviewScore)}
                                                {"☆".repeat(5 - review.reviewScore)}
                                            </p>

                                            <p>{review.reviewText}</p>
                                            <small>
                                                작성일:{""}
                                                {review.createdAt ? String(review.createdAt).substring(0,10):""}
                                            </small>
                                            <div style={{marginTop:"10px"}}>
                                                <button type="button" onClick={()=>handleEditReviewStart(review)}>
                                                    수정
                                                </button>
                                                
                                                <button type="button" onClick={()=>handleDeleteReview(review.reviewId)} style={{marginLeft:"10px"}}>
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                ))
                            )}


                        </div>
                    </main>
                </div>
            )}
        </div>
    );
};

export default Mypage;