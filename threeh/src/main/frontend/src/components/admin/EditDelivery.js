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
        deliveryId: Number(deliveryId),
        adminId: null, // 🌟 관리자 ID를 추적하기 위해 추가
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

    // 🌟 [추가] 관리자 세션 정보 가져오기 (AddDelivery와 동일한 방식)
    const fetchAdminInfo = async () => {
        try {
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

    // 데이터 로드 함수
    const fetchDeliveryDetail = async () => {
        if (!deliveryId) return;
        try {
            const res = await axios.get(`/admin/delivery/${deliveryId}`);
            const data = res.data;

            const phoneParts = data.deliveryPhone ? data.deliveryPhone.split('-') : ['', '', ''];

            setFormData(prev => ({
                ...prev,
                // 만약 기존 기사에 등록된 어드민 정보가 있다면 우선 채우되, 없으면 기본 유지
                adminId: data.admin?.adminId || prev.adminId, 
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
            }));
        } catch (err) {
            console.error("데이터 로드 에러:", err);
            toast.error("정보를 불러오는데 실패했습니다.");
        }
    };

    // 페이지 로드 시 관리자 확인 및 기사 상세 조회 연속 실행
    useEffect(() => {
        const initPage = async () => {
            await fetchAdminInfo();   // 1. 누가 수정하려는지 관리자 확인
            await fetchDeliveryDetail(); // 2. 수정할 기사 정보 로드
        };
        initPage();
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

        // 관리자 ID가 세션에서 누락되었을 경우 폼 제출 차단
        if (!formData.adminId) {
            toast.error("관리자 인증 정보가 없습니다. 다시 로그인해주세요.");
            return;
        }

        const fullDeliveryPhone = `${formData.phonePrefix}-${formData.phoneMiddle}-${formData.phoneLast}`;

        // 전송할 데이터 조립 (빨간 줄 해결 파트)
        const updateData = {
            deliveryId: Number(deliveryId),
            adminId: formData.adminId, // 🌟 확보된 관리자 ID를 확실하게 바인딩
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
            await axios.put(`/admin/delivery/${deliveryId}`, updateData);
            toast.success("✅ 정보 수정이 완료되었습니다!");
            setTimeout(() => {
                navigate("/admin");
            }, 1500);
        } catch (error) {
            console.error("수정 실패:", error);
            toast.error("수정 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="delivery-page">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="delivery-container">
                <h1 className="delivery-title">배송 기사 정보 수정</h1>

                <form onSubmit={handleSubmit} className="delivery-form">
                    
                    {/* 🔒 업체명 / 기사명 (수정 불가) */}
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

                    {/* 🔒 업체 전화번호 (수정 불가) */}
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

                    {/* 🔒 사업자 주소 (수정 불가) */}
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