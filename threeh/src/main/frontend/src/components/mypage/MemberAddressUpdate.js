import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../css/myPageCss/memberAddressUpdate.css';
import { useToast } from '../../hook/useToast';

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
            alert("잘못된 접근입니다");
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
                alert("회원 정보를 불러오는 데 실패했습니다.");
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
            return alert("비밀번호가 일치하지 않습니다.");
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
            alert("회원 정보 수정이 안전하게 완료되었습니다!");
            
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
            alert("정보 수정 처리 중 서버 오류가 발생했습니다.");
        });
    }; // 👈 꼬여있던 handleSubmit 마감 괄호를 정확한 위치로 복구 완료

    return (
        <div className="mypage-grid-container">
            {/* ========================================================= */}
            {/* [헤더 시작] 마이페이지와 동일한 상단 브랜드 바 레이아웃            */}
            {/* ========================================================= */}
            <header className="mypage-header-box" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ccc' }}>
                <div className="mypage-logo-box" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: 'bold' }}>PROJECT CMYK</div>
                <div>
                    <button className="btn-header-action" onClick={() => navigate('/mypage')}>마이페이지</button>
                    <button className="btn-header-action" onClick={() => navigate('/')}>메인으로</button>
                </div>
            </header>

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
                        <div className="form-action-row" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" className="mypage-action-btn" style={{ flex: 1, padding: '10px', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>수정 완료</button>
                            <button type="button" className="btn-header-action" onClick={() => navigate('/mypage')} style={{ flex: 1, padding: '10px', cursor: 'pointer' }}>취소</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ========================================================= */}
            {/* [푸터 시작] 하단 기업 정보 및 미니멀 카피라이트 마크업          */}
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

export default MemberAddressUpdate;
