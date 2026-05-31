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

    // 데이터 로드 함수
    const fetchDeliveryDetail = async () => {
        if (!deliveryId) return;
        try {
            const res = await axios.get(`/admin/delivery/${deliveryId}`);
            const data = res.data;

            const phoneParts = data.deliveryPhone ? data.deliveryPhone.split('-') : ['', '', ''];

            setFormData({
                adminId: data.admin?.adminId || '',
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

    useEffect(() => {
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
            adminId: formData.adminId,
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
            if (response.status === 200 || response.data) {
                toast.success("✅ 정보 수정이 완료되었습니다!");
                setTimeout(() => {
                    navigate('/admin'); 
                }, 1500);
            }
        } catch (error) {
            console.error("수정 에러:", error);
            toast.error(`❌ 수정 실패: ${error.response?.data?.message || "서버 통신 에러"}`);
        }
    };

    return (
    <div className="delivery-page">
        <ToastContainer />
        <div className="delivery-container">
            <h1 className="delivery-title">배송 기사 정보 수정</h1>

            <form onSubmit={handleSubmit} className="delivery-form">
                
                {/* 🔒 업체명 / 기사명 (기존 비활성화) */}
                <div className="delivery-form-card delivery-readonly-section">
                    <label className="delivery-form-label">업체명 / 기사명 (수정 불가)</label>
                    <div className="delivery-form-input delivery-readonly-box">
                        {formData.companyName} / {formData.deliveryName}
                    </div>
                </div>

                {/* 📞 기사 연락처 (수정 가능) */}
                <div className="delivery-form-card">
                    <label className="delivery-form-label">기사 연락처 (수정 가능)</label>
                    <div className="delivery-phone-group">
                        <select name="phonePrefix" value={formData.phonePrefix} onChange={handleChange}>
                            <option value="010">010</option>
                            <option value="011">011</option>
                            <option value="070">070</option>
                        </select>
                        <span className="delivery-phone-dash">-</span>
                        <input type="text" name="phoneMiddle" value={formData.phoneMiddle} onChange={handleChange} maxLength={4} className="delivery-phone-input" required />
                        <span className="delivery-phone-dash">-</span>
                        <input type="text" name="phoneLast" value={formData.phoneLast} onChange={handleChange} maxLength={4} className="delivery-phone-input" required />
                    </div>
                </div>

                {/* 🚗 차량 번호 (수정 가능) */}
                <div className="delivery-form-card">
                    <label className="delivery-form-label">차량 번호 (수정 가능)</label>
                    <input type="text" name="deliveryCarNo" value={formData.deliveryCarNo} onChange={handleChange} placeholder="12가1234" className="delivery-form-input" required />
                </div>

                <h3 className="delivery-business-section-title">업체 정보 (수정 불가)</h3>

                {/* 🔒 업체 전화번호 (수정 불가 변경) */}
                <div className="delivery-form-card delivery-readonly-section">
                    <label className="delivery-form-label">업체 전화번호</label>
                    <input 
                        type="text" 
                        name="businessPhone" 
                        value={formData.businessPhone} 
                        className="delivery-form-input delivery-readonly-box" 
                        readOnly 
                    />
                </div>

                {/* 🔒 사업자 주소 (수정 불가 변경) */}
                <div className="delivery-form-card delivery-readonly-section">
                    <label className="delivery-form-label">사업자 주소</label>
                    <input 
                        type="text" 
                        name="businessAddr" 
                        value={formData.businessAddr} 
                        className="delivery-form-input delivery-readonly-box" 
                        readOnly 
                    />
                </div>

                {/* 하단 버튼 제어 바 */}
                <div className="delivery-button-group">
                    <button type="button" onClick={() => navigate(-1)} className="delivery-cancel-btn">
                        취소
                    </button>
                    <button type="submit" className="delivery-submit-btn">
                        수정 완료
                    </button>
                </div>
            </form>
        </div>
    </div>
);
};

export default EditDelivery;