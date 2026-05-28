import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../css/myPageCss/memberAddressUpdate.css';
import { useToast } from '../../hook/useToast';
import Header from '../main/Header';
import Footer from "../main/Footer";
import { ToastContainer, toast } from "react-toastify";

const MemberAddressUpdate = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // URL 파라미터에서 어떤 id든 동적으로 수신
    const { success, error, warn, info } = useToast();

    // 조원의 변수명 양식인 fromData 스펙과 완벽하게 일치
    const [fromData, setFormData] = useState({
        id: id || '',
        name: '',
        phone: '',
        email: '',
        password1: '',
        password2: '',
        regNo: ''
    });

    // [최초 로드] 조원의 수정 폼 전용 GET API 호출하여 데이터 수신
    useEffect(() => {
        if (!id) {
            warn("잘못된 접근입니다");
            navigate('/mypage');
            return;
        }

        axios.get(`http://localhost:8080/api/member/update/${id}`, { withCredentials: true })
            .then(res => {
                if (res.data) {
                    setFormData({
                        id: res.data.id || id,
                        name: res.data.name || '',
                        phone: res.data.phone || '',
                        email: res.data.email || '',
                        password1: '',
                        password2: '',
                        regNo: res.data.regNo || ''
                    });
                }
            })
            .catch(err => {
                console.error("기존 회원정보 로드 실패:", err);
                warn("회원 정보를 불러오는 데 실패했습니다.");
            });
    }, [id, navigate]);

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // [DB 데이터 수정 송신] 조원의 @PutMapping 명세 완벽 대응
    const handleSubmit = (e) => {
        e.preventDefault();

        if (fromData.password1 !== fromData.password2) {
            return warn("비밀번호가 일치하지 않습니다.");
        }

        const signupUpdateForm = {
            id: fromData.id,
            name: fromData.name,
            phone: fromData.phone,
            email: fromData.email,
            password1: fromData.password1,
            password2: fromData.password2,
            regNo: fromData.regNo
        };

        axios.put(`http://localhost:8080/api/member/update/${id}`, signupUpdateForm, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })
        .then(res => {
            success("회원 정보 수정이 안전하게 완료되었습니다!");
            
            const currentUser = JSON.parse(sessionStorage.getItem('user')) || {};
            const updatedUser = {
                ...currentUser,
                name: fromData.name,
                phone: fromData.phone,
                email: fromData.email,
                regNo: fromData.regNo
            };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));

            navigate('/mypage');
        })
        .catch(err => {
            console.error("회원 수정 최종 에러 상세:", err.response);
            warn("정보 수정 처리 중 서버 오류가 발생했습니다.");
        });
    };

   return (
        // [시작] 최상위 그리드 레이아웃 엔진 래퍼
        <div className="mypage-grid-container">
            
            {/* ========================================================= */}
            {/* [통일 규격] 조원분의 실제 검색/GNB 기능이 담긴 글로벌 헤더      */}
            {/* ========================================================= */}
            <Header />

            {/* 토스트 알림 컴포넌트 안착 */}
            <ToastContainer
                position="top-center"
                autoClose={1800}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnHover
                theme="light"
            />

            {/* 🖥️ 정보수정 룸 단독형 명품 레이아웃 뷰포트 배치 */}
            <div className="update-form-viewport">
                <div className="update-form-card">
                    <h2>회원 정보 수정</h2>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="form-group-row">
                            <label style={{ display: 'block', marginBottom: '5px' }}><strong>아이디</strong></label>
                            <input type="text" name="id" value={fromData.id} disabled className="disabled-input" style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div className="form-group-row">
                            <label style={{ display: 'block', marginBottom: '5px' }}><strong>이름</strong></label>
                            <input type="text" name="name" value={fromData.name} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
                        </div>
                        <div className="form-group-row">
                            <label style={{ display: 'block', marginBottom: '5px' }}><strong>연락처</strong></label>
                            <input type="text" name="phone" value={fromData.phone} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
                        </div>
                        <div className="form-group-row">
                            <label style={{ display: 'block', marginBottom: '5px' }}><strong>이메일</strong></label>
                            <input type="email" name="email" value={fromData.email} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
                        </div>
                        <div className="form-group-row">
                            <label style={{ display: 'block', marginBottom: '5px' }}><strong>새 비밀번호</strong></label>
                            <input type="password" name="password1" value={fromData.password1} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
                        </div>
                        <div className="form-group-row">
                            <label style={{ display: 'block', marginBottom: '5px' }}><strong>비밀번호 확인</strong></label>
                            <input type="password" name="password2" value={fromData.password2} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
                        </div>
                        
                        {/* 최하단 액션 제어 트랙 버튼 그룹 */}
                        <div className="form-action-row" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" className="mypage-action-btn" style={{ flex: 1, padding: '10px', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>수정 완료</button>
                            <button type="button" className="btn-header-action" onClick={() => navigate('/mypage')} style={{ flex: 1, padding: '10px', cursor: 'pointer' }}>취소</button>
                        </div>
                    </form>
                </div> {/* [종료] update-form-card */}
            </div> {/* [종료] update-form-viewport */}

            {/* ========================================================= */}
            {/* 🤎 [통일 규격] 조원분의 실제 기능이 담긴 글로벌 푸터 컴포넌트   */}
            {/* ========================================================= */}
            <Footer />

        </div> // [종료] mypage-grid-container
    );
};

export default MemberAddressUpdate;