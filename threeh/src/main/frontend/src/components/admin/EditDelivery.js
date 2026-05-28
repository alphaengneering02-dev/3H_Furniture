import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import '../../css/adminCss/DeliveryAE.css';

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
                toast.error("정보를 불러오는데 실패했습니다.");
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
                toast.error("✅ 정보 수정이 완료되었습니다!");
                navigate('/admin'); 
            }
        } catch (error) {
            console.error("수정 에러:", error);
            toast.error(`❌ 수정 실패: ${error.response?.data?.message || "서버 통신 에러"}`);
        }
    };

    return (
        <div className="delivery-page">
            <div className="delivery-container">
                <h1 className="delivery-title">배송 기사 정보 수정</h1>

                <form onSubmit={handleSubmit} className="delivery-form">
                    
                    <div className="form-card readonly-section">
                        <label className="form-label">업체명 / 기사명 (수정 불가)</label>
                        <div className="form-input readonly-box">
                            {formData.companyName} / {formData.deliveryName}
                        </div>
                    </div>

                    <div className="form-card">
                        <label className="form-label">기사 연락처</label>
                        <div className="phone-group">
                            <select name="phonePrefix" value={formData.phonePrefix} onChange={handleChange}>
                                <option value="010">010</option>
                                <option value="011">011</option>
                                <option value="070">070</option>
                            </select>
                            <span className="phone-dash">-</span>
                            <input type="text" name="phoneMiddle" value={formData.phoneMiddle} onChange={handleChange} maxLength={4} className="phone-input" required />
                            <span className="phone-dash">-</span>
                            <input type="text" name="phoneLast" value={formData.phoneLast} onChange={handleChange} maxLength={4} className="phone-input" required />
                        </div>
                    </div>

                    <div className="form-card">
                        <label className="form-label">차량 번호</label>
                        <input type="text" name="deliveryCarNo" value={formData.deliveryCarNo} onChange={handleChange} placeholder="12가1234" className="form-input" required />
                    </div>

                    {/* 소제목 스타일 클래스 부여 */}
                    <h3 className="business-section-title">업체 정보 수정</h3>

                    <div className="form-card">
                        <label className="form-label">업체 전화번호</label>
                        <input type="text" name="businessPhone" value={formData.businessPhone} onChange={handleChange} placeholder="02-123-4567" className="form-input" required />
                    </div>

                    <div className="form-card">
                        <label className="form-label">사업자 주소</label>
                        <input type="text" name="businessAddr" value={formData.businessAddr} onChange={handleChange} placeholder="전체 주소를 입력하세요" className="form-input" required />
                    </div>

                    {/* 하단 버튼 그룹 */}
                    <div className="button-group">
                        <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
                            취소
                        </button>
                        <button type="submit" className="submit-btn">
                            수정 완료
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDelivery;