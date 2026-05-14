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

    useEffect(() => {
        //세션스토리지에서 user라는 이름으로 저장된 정보를 가져옴
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            const userObj = JSON.parse(savedUser);
            setMember(userObj);

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

    //새 배송지 추가(Order 포스트)
    const addAddress = () => {

        const city = prompt("도시 (예: 서울시)");
        const street = prompt("도로명 주소 (예: 강남대로)");
        const zipcode = prompt("우편번호 (예: 12345)");
        const addrDetail = prompt("상세 주소 (예: 101동 101호)");

        if (!city || !street) return;

        const user = JSON.parse(sessionStorage.getItem('user'));
        const userId = user ? user.id : "user1"; //비로그인 테스트용

        const params = new URLSearchParams();

        params.append('userid', userId);
        params.append('city', city);
        params.append('street', street);
        params.append('zipcode', zipcode);
        params.append('addrDetail', addrDetail);

        params.append('addr', `${city} ${street}`);

        axios.post('http://localhost:8080/Member/address/add', params, { withCredentials: true })
            .then(() => {
                alert("배송지가 등록되었습니다. 주문 시 선택 가능합니다")
                window.location.reload();
            })
            .catch(err => alert("저장 실패"));
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

    //배송지 삭제
    const deleteAddress = (addressId) => {
        if (window.confirm("배송지를 삭제하시겠습니까?")) {
            axios.delete(`http://localhost:8080/address/delete/${addressId}`, { withCredentials: true })
                .then(() => {
                    setAddresses(addresses.filter(addr => addr.id !== addressId));
                })
                .catch(err => alert("삭제 실패"));
        }
    };

    //회원탈퇴
    const handleDelete = () => {
        if (window.confirm("정말로 탈퇴하시겠습니까?")) {
            axios.delete(`http://localhost:8080/member/delete/${member.id}`, { withCredentials: true })
                .then(() => {
                    alert("탈퇴 완료");
                    sessionStorage.removeItem('user');
                    navigate('/');
                });
        }
    };

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

                            {/*
                            <h3 className="into-section-title">최근 구매 내역</h3>
                            <div className="info-data-block">
                                {orders && orders.length > 0 ? (
                                    orders.map(order => (
                                        <div key={order.id} style={{borderBottom:'1px solid #eee', padding:'10px 0', display:'flex',justifyContent:'space-between'}}>
                                            <p><strong>주문번호:</strong>{order.id}</p>
                                            <p><strong>상품명:</strong>{order.productName || "주문 상품"}</p>
                                            <p>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ""}</p>
                                    </div>
                                    ))
                                ) : (
                                    <p>최근 구매 내역이 없습니다.</p>
                                
                                )}
                            </div>
                            */}

                            {/* 교환 및 반품 신청 섹션 */}
                            <h3 id="refund-section" className="info-section-title">구매내역 / 교환 및 반품 신청</h3>
                            <div className="info-data-block">
                                {orders && orders.length > 0 ? (
                                    orders.map(order => (
                                        <div key={order.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <p><strong>주문번호:</strong> {order.id}</p>
                                                <p><strong>상품명:</strong> {order.productName || "주문 상품"}</p>
                                                <p style={{ fontSize: '12px', color: '#888' }}>
                                                    주문일: {order.orderDate ? new Date(order.orderDate).toLocaleString() : "-"}
                                                </p>
                                            </div>
                                            <button
                                                className="mypage-action-btn"
                                                onClick={() => handleRefund(order.id)}
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
                    </main>
                </div>
            )}
        </div>
    );

};


export default Mypage;
