import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';




//초기 데이터 로드
const Mypage = () => {
    const navigete = useNavigate();
    const [member, setMember] = useState(null);

    useEffect(() => {

        const memberId = "user1";

        axios.get(`http://localhost:8080/member/${memberId}`,{withCredentials:true})
        .then(res => setMember(res.data))
        .catch(err => {
            console.error("데이터 로드 실패",err);
            setMember({
                id:"user1",
                name:"홍길동",
                email:"hong@test.com",
                phone:"000-1111-2222",
                address:"서울시 강남구 (가입주소)",
                defaultAddress:"경기도 수원시 (기본배송지)"
            });
        });
    },[]);

    //회원 탈퇴
    const handleDelete = () => {
        if(window.confirm("정말로 탈퇴하시겠습니까? 모든 정보가 삭제됩니다")) {
            axios.delete(`http://localhost:8080/member/delete/${member.id}`,{withCredentials:true})
            .then(() => {
                alert("탈퇴 처리가 완료되었습니다");
                navigete('/');
            })
            .catch(err => alert("탈퇴 처리 중 오류가 발생했습니다"));
        }
    };

    if (!member) return <div className='mypage-grid-container'>로딩중...</div>

    return (
        <div className="mypage-grid-container">
            {/* 로고 클릭시 메인페이지 복귀*/}
            <header className="mypage-header-box">
                <div className="mypage-logo-box">PROJECT CMYK</div>
                <button className="mypage-action-btn" onClick={() => navigete('/')}>메인으로</button>
            </header>

        <header className="mypage-header-box">
            <button className="mypage-action-btn">로그아웃</button>
        </header>

        {/* 왼쪽 사이드바 메뉴 버튼 */}
        <aside className="mypage-sidebar">
            {/* 배송 시작전만 날짜 변경 가능 */}
            <button className="sidebar-btn" onClick={() => navigete('/schedule')}>배송/설치 시간 내역</button>
            {/* 구매 후 3일 이내만 환불 가능 */}
            <button className="sidebar-btn" onClick={() => navigete('/cart/return')}>교환 및 반품</button>
            <button className="sidebar-btn" onClick={() => navigete('/orders')}>구매내역</button>
            <button className="sidebar-btn" onClick={() => navigete('/cart')}>장바구니 목록</button>
        </aside>

        <main className="mypage-main-content">
            {/* 프로필 아이콘 영역 */}
            <div className="profile-icon-box">
                <div className="profile-avatar-circle">
                    {member.name ? member.name[0] : ""}
                </div>
                <p style={{margin:'10px'}}>프로필 아이콘</p>
                <button className="mypage-action-btn" style={{marginTop:'15px'}}
                    onClick={() => navigete(`/member/update/${member.id}`)}>
                        정보 수정
                    </button>
             </div>

        <div className="info-content-box">
            <h3 className="info-section-title">회원정보 / 주문 내역</h3>
            <div className="info-data-block">
                <p><strong>아이디:</strong>{member.id}</p>
                <p><strong>연락처:</strong>{member.phone}</p>
                <p><strong>가입 주소:</strong>{member.address}</p>
            </div>
            
            <h3 className="info-section-title">배송지 설정</h3>
            <div className="info-data-block">
                <p>{member.defaultAddress ? member.defaultAddress : "등록된 기본 배송지가 업습니다"}</p>
            </div>

            <button className="mypage-action-btn" onClick={handleDelete} style={{color:'red',marginTop:'20px'}}>회원 탈퇴</button>
               </div> 
            </main>
        </div>
    );
};


export default Mypage;