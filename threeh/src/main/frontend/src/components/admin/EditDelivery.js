import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditDelivery = () => {
    const { deliveryId } = useParams(); 
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        adminId: '',
        companyName: '',
        deliveryName: '',
        businessNo: '',
        businessName: '',
        deliveryCarNo: '',
        businessPhone: '',
        businessAddr: '',
        phonePrefix: '010',
        phoneMiddle: '',
        phoneLast: ''
    });

    // 1. 기존 데이터 불러오기 및 임시 로그인 세팅
    useEffect(() => {
        // [임시 로그인] localStorage 세팅
        if (!localStorage.getItem('memberId')) {
            localStorage.setItem('memberId', '1'); 
            localStorage.setItem('role', 'ADMIN');
        }

        const savedMemberId = localStorage.getItem('memberId');

        //로그인 완성시 admin1로 넣는거 완성하기
        const fetchDeliveryDetail = async () => {
            if (!deliveryId) return;
            try {
                const res = await axios.get(`/admin/delivery/${deliveryId}`);
                const data = res.data;

                const phoneParts = data.deliveryPhone ? data.deliveryPhone.split('-') : ['', '', ''];

                setFormData({
                    // 중요: 서버 데이터보다 localStorage의 ID를 우선순위로 두어 null 방지
                    adminId: savedMemberId || data.admin?.adminId || '',
                    companyName: data.companyName || '',
                    deliveryName: data.deliveryName || '',
                    businessNo: data.businessNo || '',
                    businessName: data.businessName || '',
                    deliveryCarNo: data.deliveryCarNo || '',
                    businessPhone: data.businessPhone || '',
                    businessAddr: data.businessAddr || '',
                    phonePrefix: phoneParts[0] || '010',
                    phoneMiddle: phoneParts[1] || '',
                    phoneLast: phoneParts[2] || ''
                });
            } catch (err) {
                console.error("데이터 로드 에러:", err);
                alert("정보를 불러오는데 실패했습니다.");
            }
        };

        fetchDeliveryDetail();
    }, [deliveryId]);

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 수정 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        const fullDeliveryPhone = `${formData.phonePrefix}-${formData.phoneMiddle}-${formData.phoneLast}`;
        
        const updateData = {
            adminId: formData.adminId, // 전송 시 adminId 포함
            companyName: formData.companyName,
            deliveryName: formData.deliveryName,
            businessNo: formData.businessNo,
            businessName: formData.businessName,
            deliveryPhone: fullDeliveryPhone,
            deliveryCarNo: formData.deliveryCarNo,
            businessPhone: formData.businessPhone,
            businessAddr: formData.businessAddr,
        };

        try {
            const response = await axios.put(`/admin/delivery/${deliveryId}`, updateData);
            if (response.status === 200) {
                alert("✅ 정보 수정이 완료되었습니다!");
                navigate('/admin'); 
            }
        } catch (error) {
            console.error("수정 에러:", error);
            alert(`❌ 수정 실패: ${error.response?.data?.message || "서버 통신 에러"}`);
        }
    };

    return (
        <div className="delivery-page" style={{ padding: '20px' }}>
            <div className="delivery-container">
                <h1 className="delivery-title">배송 기사 정보 수정</h1>

                <form onSubmit={handleSubmit} className="delivery-form">
                    
                    <div className="form-card readonly-section" style={{ opacity: 0.8, marginBottom: '20px' }}>
                        <label className="form-label">업체명 / 기사명 (수정 불가)</label>
                        <div className="form-input" style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                            {formData.companyName} / {formData.deliveryName}
                        </div>
                    </div>

                    <div className="form-card" style={{ marginBottom: '15px' }}>
                        <label className="form-label">기사 연락처</label>
                        <div className="phone-group" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <select name="phonePrefix" value={formData.phonePrefix} onChange={handleChange} style={{ padding: '8px' }}>
                                <option value="010">010</option>
                                <option value="011">011</option>
                                <option value="070">070</option>
                            </select>
                            <span>-</span>
                            <input type="text" name="phoneMiddle" value={formData.phoneMiddle} onChange={handleChange} maxLength={4} style={{ width: '60px', padding: '8px' }} required />
                            <span>-</span>
                            <input type="text" name="phoneLast" value={formData.phoneLast} onChange={handleChange} maxLength={4} style={{ width: '60px', padding: '8px' }} required />
                        </div>
                    </div>

                    <div className="form-card" style={{ marginBottom: '15px' }}>
                        <label className="form-label">차량 번호</label>
                        <input type="text" name="deliveryCarNo" value={formData.deliveryCarNo} onChange={handleChange} placeholder="12가1234" style={{ width: '100%', padding: '8px' }} required />
                    </div>

                    <h3 style={{ marginTop: '30px' }}>업체 정보 수정</h3>

                    <div className="form-card" style={{ marginBottom: '15px' }}>
                        <label className="form-label">업체 전화번호</label>
                        <input type="text" name="businessPhone" value={formData.businessPhone} onChange={handleChange} placeholder="02-123-4567" style={{ width: '100%', padding: '8px' }} required />
                    </div>

                    <div className="form-card" style={{ marginBottom: '15px' }}>
                        <label className="form-label">사업자 주소</label>
                        <input type="text" name="businessAddr" value={formData.businessAddr} onChange={handleChange} placeholder="전체 주소를 입력하세요" style={{ width: '100%', padding: '8px' }} required />
                    </div>

                    <div className="button-group" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="button" onClick={() => navigate(-1)} style={{ flex: 1, padding: '12px', cursor: 'pointer' }}>
                            취소
                        </button>
                        <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            수정 완료
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDelivery;