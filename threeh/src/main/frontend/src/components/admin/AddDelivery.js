import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/adminCss/DeliveryAE.css';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

const AddDelivery = () => {


    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        adminId: null,
        companyName: '',
        deliveryName: '',
        deliveryPhone: '',
        deliveryCarNo: '',
        businessNo1: '', 
        businessNo2: '', 
        businessNo3: '', 
        businessName: '',
        businessPhone: '',
        businessAddr: '',
        phonePrefix: '010',
        phoneMiddle: '',
        phoneLast: ''
    });

    useEffect(() => {
    const fetchAdminInfo = async () => {
        try {
            // 1. 서버 세션 확인 (쿠키를 함께 보냄)
            const response = await axios.get('/admin/me', { withCredentials: true });
            
            if (response.data && response.data.adminId) {
                setFormData(prev => ({
                    ...prev,
                    adminId: response.data.adminId
                }));
            }
        } catch (error) {
            console.error("세션이 만료되었거나 정보가 없습니다.", error);
            
          
            const savedUser = sessionStorage.getItem("user");
            if (savedUser) {
                const userObj = JSON.parse(savedUser);
                setFormData(prev => ({ ...prev, adminId: userObj.adminId }));
            } else {              
                toast.error("로그인 세션이 만료되었습니다.");
                navigate("/login");
            }
        }
    };

    fetchAdminInfo();
}, [navigate]);


    // 입력값 변경
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    
    // 등록
    const handleSubmit = async (e) => {
       e.preventDefault();

       if (!formData.adminId) {
        toast.error("관리자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    const fullBusinessNo = `${formData.businessNo1}-${formData.businessNo2}-${formData.businessNo3}`;
    const fullDeliveryPhone = `${formData.phonePrefix}-${formData.phoneMiddle}-${formData.phoneLast}`;

    const finalRequestData = {

            adminId: formData.adminId,
            companyName: formData.companyName,
            businessName: formData.businessName,
            businessNo: `${formData.businessNo1}-${formData.businessNo2}-${formData.businessNo3}`,
            businessPhone: formData.businessPhone, 
            businessAddr: formData.businessAddr,   
            deliveryName: formData.deliveryName,
            deliveryPhone: `${formData.phonePrefix}-${formData.phoneMiddle}-${formData.phoneLast}`,
            deliveryCarNo: formData.deliveryCarNo,
            status: 'WAITING'
        };

        try {

    const response = await axios.post('/admin/delivery', finalRequestData);
        
        if (response.status === 200) {
            toast.error("✅ 기사 등록이 완료되었습니다!");
             navigate("/admin");
        }
    } catch (error) {
        // 에러 처리 로직 (기존 유지)
        if (error.response && error.response.data) {
            const { status, message } = error.response.data;
            console.error(`에러 발생 [${status}]: ${message}`);
            toast.error(`❌ 등록 실패: ${message}`);
        } else {
            toast.error("서버와 통신 중 문제가 발생했습니다.");
        }
    }
};



    return (
<div className="delivery-page">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="delivery-container">
                <h1 className="delivery-title">배송 기사 등록</h1>

                <form onSubmit={handleSubmit} className="delivery-form">
                    
                    {/* 기본 정보 파트 */}
                    <div className="form-card">
                        <label className="form-label">업체명</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="업체명을 입력하세요"
                            required
                        />
                    </div>

                    <div className="form-card">
                        <label className="form-label">기사 성함</label>
                        <input
                            type="text"
                            name="deliveryName"
                            value={formData.deliveryName}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="기사 성함 입력"
                            required
                        />
                    </div>

                    <div className="form-card">
                        <label className="form-label">전화번호</label>
                        <div className="phone-group">
                            <select
                                name="phonePrefix"
                                value={formData.phonePrefix}
                                onChange={handleChange}
                                className="phone-select"
                                required
                            >
                                <option value="010">010</option>
                                <option value="011">011</option>
                                <option value="070">070</option>
                            </select>
                            <span className="phone-dash">-</span>
                            <input
                                type="text"
                                name="phoneMiddle"
                                value={formData.phoneMiddle}
                                onChange={handleChange}
                                maxLength={4}
                                className="phone-input"
                                required
                            />
                            <span className="phone-dash">-</span>
                            <input
                                type="text"
                                name="phoneLast"
                                value={formData.phoneLast}
                                onChange={handleChange}
                                maxLength={4}
                                className="phone-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-card">
                        <label className="form-label">차량 번호</label>
                        <input
                            type="text"
                            name="deliveryCarNo"
                            value={formData.deliveryCarNo}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="예: 12가1234"
                            required
                        />
                    </div>

                    {/* 섹션 구분 타이틀 */}
                    <div className="business-section">사업자 정보</div>

                    {/* 사업자 정보 파트 */}
                    <div className="form-card">
                        <label className="form-label">사업자 번호</label>
                        <div className="phone-group"> 
                            <input
                                type="text"
                                name="businessNo1"
                                value={formData.businessNo1}
                                onChange={handleChange}
                                maxLength={3}
                                placeholder="3자리"
                                className="phone-input"
                                required
                            />
                            <span className="phone-dash">-</span>
                            <input
                                type="text"
                                name="businessNo2"
                                value={formData.businessNo2}
                                onChange={handleChange}
                                maxLength={2}
                                placeholder="2자리"
                                className="phone-input"
                                required
                            />
                            <span className="phone-dash">-</span>
                            <input
                                type="text"
                                name="businessNo3"
                                value={formData.businessNo3}
                                onChange={handleChange}
                                maxLength={5}
                                placeholder="5자리"
                                className="phone-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-card">
                        <label className="form-label">업체 전화번호</label>
                        <input 
                            type="text" 
                            name="businessPhone" 
                            value={formData.businessPhone}
                            onChange={handleChange} 
                            className="form-input"
                            placeholder="예: 02-123-4567"
                            required 
                        />
                    </div>
                
                    <div className="form-card">
                        <label className="form-label">사업자 주소</label>
                        <input 
                            type="text" 
                            name="businessAddr" 
                            value={formData.businessAddr}
                            onChange={handleChange} 
                            className="form-input"
                            placeholder="사업장 전체 주소를 입력하세요"
                            required 
                        />
                    </div>

                    <div className="form-card">
                        <label className="form-label">사업주 이름</label>
                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="사업자등록증상 대표자명"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        등록하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddDelivery;