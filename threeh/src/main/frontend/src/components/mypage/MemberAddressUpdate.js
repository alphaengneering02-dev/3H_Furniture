import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const MemberAddressUpdate = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        id: id || '',
        name: '',
        phone: '',
        email: ''
    });

    const handleUpdateSubmit = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        params.append('id', formData.id);
        params.append('name', formData.name);
        params.append('phone', formData.phone);
        params.append('email', formData.email);

        axios.post('http://localhost:8080/Member/info/update', params, { withCredentials: true })
            .then(res => {
                alert("회원 정보가 수정되었습니다");
                sessionStorage.setItem('user', JSON.stringify(formData));
                navigate('/mypage');
            })
            .catch(err => {
                console.error("수정 실패 오류:",err);
                if(err.response && err.response.data) {
                    alert("수정 실패:" + err.response.data);
                }else {
                    alert("정보 수정 중 오류가 발생했습니다");
                }
            })

    
    }

    return (
        <div style={{ padding: '30px', maxWidth: '500px', margin: '0 auto' }}>
            <h2>내 정보 수정</h2>
            <hr />
            <form onSubmit={handleUpdateSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>아이디: </label>
                    <input
                        type="text"
                        name="id"
                        value={formData.id}
                        readOnly
                        style={{ backgroundColor: '#f0f0f0', width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>이름: </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>연락처: </label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>이메일: </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>

                <div style={{ marginTop: '20px' }}>
                    <button type="submit">정보 변경하기</button>
                    <button type="button" onClick={() => navigate('/mypage')}>취소</button>
                </div>
            </form>



        </div>
    )


};

export default MemberAddressUpdate;