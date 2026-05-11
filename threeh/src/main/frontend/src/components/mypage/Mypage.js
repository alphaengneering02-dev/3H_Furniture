import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Mypage = () => {
    const navigate = useNavigate(); // navigete 오타 수정
    const [member, setMember] = useState(null);
    const [addresses, setAddresses] = useState([]);

    // 1. 초기 데이터 로드 (회원정보 + 주소목록)
    useEffect(() => {
        const memberId = "user1";

        // 회원 정보 불러오기
        axios.get(`http://localhost:8080/member/${memberId}`, { withCredentials: true })
            .then(res => setMember(res.data))
            .catch(err => {
                console.error("회원 로드 실패", err);
                // 테스트용 더미 데이터
                setMember({ id: "user1", name: "홍길동", phone: "010-1111-2222", address: "서울시 가입주소" });
            });

        // 주소 목록 불러오기
        axios.get(`http://localhost:8080/address/list/${memberId}`, { withCredentials: true })
            .then(res => setAddresses(res.data))
            .catch(err => console.error("주소 로드 실패", err));
    }, []);

    // 2. 기본 배송지 변경 로직
    const handleSetDefault = (addressId) => {
        axios.post(`http://localhost:8080/address/default/${addressId}`, {}, { withCredentials: true })
            .then(() => {
                alert("기본 배송지가 변경되었습니다.");
                setAddresses(addresses.map(addr =>
                    addr.id === addressId ? { ...addr, isDefault: 'Y' } : { ...addr, isDefault: 'N' }
                ));
            })
            .catch(err => alert("변경 실패"));
    };

    // 3. 배송지 삭제 로직
    const deleteAddress = (addressId) => {
        if (window.confirm("배송지를 삭제하시겠습니까?")) {
            axios.delete(`http://localhost:8080/address/delete/${addressId}`, { withCredentials: true })
                .then(() => {
                    setAddresses(addresses.filter(addr => addr.id !== addressId));
                })
                .catch(err => alert("삭제 실패"));
        }
    };

    // 4. 회원 탈퇴 로직
    const handleDelete = () => {
        if (window.confirm("정말로 탈퇴하시겠습니까? 모든 정보가 삭제됩니다.")) {
            axios.delete(`http://localhost:8080/member/delete/${member.id}`, { withCredentials: true })
                .then(() => {
                    alert("탈퇴 처리가 완료되었습니다.");
                    navigate('/');
                })
                .catch(err => alert("탈퇴 처리 중 오류가 발생했습니다."));
        }
    };

    // 로딩 처리
    if (!member) return <div className='mypage-grid-container'>로딩중...</div>;

    return (
        <div className="mypage-grid-container">
            {/* 상단 헤더 영역 */}
            <header className="mypage-header-box">
                <div className="mypage-logo-box" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>PROJECT CMYK</div>
                <div>
                    <button className="mypage-action-btn" style={{ marginRight: '10px' }}>로그아웃</button>
                    <button className="mypage-action-btn" onClick={() => navigate('/')}>메인으로</button>
                </div>
            </header>

            {/* 왼쪽 사이드바 영역 */}
            <aside className="mypage-sidebar">
                <button className="sidebar-btn" onClick={() => navigate('/schedule')}>배송/설치 시간 내역</button>
                <button className="sidebar-btn" onClick={() => navigate('/cart/return')}>교환 및 반품</button>
                <button className="sidebar-btn" onClick={() => navigate('/orders')}>구매내역</button>
                <button className="sidebar-btn" onClick={() => navigate('/cart')}>장바구니 목록</button>
            </aside>

            {/* 오른쪽 메인 콘텐츠 영역 */}
            <main className="mypage-main-content">
                {/* 프로필 박스 */}
                <div className="profile-icon-box">
                    <div className="profile-avatar-circle">
                        {member.name ? member.name[0] : ""}
                    </div>
                    <p style={{ margin: '10px' }}>프로필 아이콘</p>
                    <button className="mypage-action-btn" style={{ marginTop: '15px' }}
                        onClick={() => navigate(`/member/update/${member.id}`)}>
                        정보 수정
                    </button>
                </div>

                {/* 상세 정보 박스 */}
                <div className="info-content-box">
                    <h3 className="info-section-title">회원정보 / 주문 내역</h3>
                    <div className="info-data-block">
                        <p><strong>아이디:</strong> {member.id}</p>
                        <p><strong>연락처:</strong> {member.phone}</p>
                        <p><strong>가입 주소:</strong> {member.address}</p>
                    </div>

                    <h3 className="info-section-title">배송지 설정</h3>
                    <div className="info-data-block">
                        {addresses.length > 0 ? (
                            addresses.map(addr => (
                                <div key={addr.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: 0 }}><strong>{addr.addressName}</strong>: {addr.street} {addr.addrDetail}</p>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>수령인: {addr.receiverName} ({addr.receiverPhone})</p>
                                    </div>
                                    <div>
                                        {addr.isDefault === 'Y' ? (
                                            <span style={{ color: 'blue', fontWeight: 'bold', marginRight: '10px' }}>[기본]</span>
                                        ) : (
                                            <button className="mypage-action-btn" onClick={() => handleSetDefault(addr.id)} style={{ marginRight: '5px' }}>기본 설정</button>
                                        )}
                                        <button className="mypage-action-btn" onClick={() => deleteAddress(addr.id)} style={{ color: 'red' }}>삭제</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>등록된 추가 배송지가 없습니다.</p>
                        )}
                        <button className="mypage-action-btn" style={{ marginTop: '15px' }} onClick={() => alert("배송지 추가 팝업 기능을 구현하세요.")}>
                            + 새 배송지 추가
                        </button>
                    </div>

                    <button className="mypage-action-btn" onClick={handleDelete} style={{ color: 'red', marginTop: '30px', borderColor: 'red' }}>
                        회원 탈퇴
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Mypage;
