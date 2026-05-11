import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


const EditDelivery = () => {

    const { deliveryId } = useParams();

    const [formData, setFormData] = useState({
        adminId: 1,
        companyName: '',
        deliveryName: '',
        deliveryPhone: '',
        deliveryCarNo: '',
        businessNo: '',
        businessName: '',
        businessPhone: '',
        businessAddr: '',
        phonePrefix: '010',
        phoneMiddle: '',
        phoneLast: ''
    });

    const [loading, setLoading] = useState(true);

    // 1. 기존 기사 정보 조회
    useEffect(() => {

        const fetchData = async () => {

            try {

                const res = await axios.get(
                    `http://localhost:8080/api/delivery/${deliveryId}`
                );

                const data = res.data;

                // 전화번호 분리
                let phonePrefix = '010';
                let phoneMiddle = '';
                let phoneLast = '';

                if (data.deliveryPhone) {
                    const parts = data.deliveryPhone.split('-');
                    phonePrefix = parts[0];
                    phoneMiddle = parts[1];
                    phoneLast = parts[2];
                }

                setFormData({
                    ...data,
                    phonePrefix,
                    phoneMiddle,
                    phoneLast
                });

            } catch (error) {

                console.error("기사 조회 실패:", error);

            } finally {
                setLoading(false);
            }
        };

        if (deliveryId) {
            fetchData();
        }

    }, [deliveryId]);

    // 입력값 변경
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    // 수정 요청
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const fullPhone =
                `${formData.phonePrefix}-${formData.phoneMiddle}-${formData.phoneLast}`;

            const requestData = {
                ...formData,
                deliveryPhone: fullPhone
            };

            const res = await axios.put(
                `http://localhost:8080/api/delivery/${deliveryId}`,
                requestData
            );

            console.log("수정 성공:", res.data);

            alert("✅ 기사 정보가 수정되었습니다!");

        } catch (error) {

            console.error("수정 실패:", error);
            alert("❌ 수정 실패");
        }
    };

    if (loading) {
        return (
            <div className="delivery-page">
                <h2>로딩중...</h2>
            </div>
        );
    }

    return (

        <div className="delivery-page">

            <div className="delivery-container">

                <h1 className="delivery-title">
                    배송 기사 수정
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="delivery-form"
                >

                    {/* 업체명 */}
                    <div className="form-card">
                        <label className="form-label">업체명</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    {/* 기사명 */}
                    <div className="form-card">
                        <label className="form-label">기사 성함</label>
                        <input
                            type="text"
                            name="deliveryName"
                            value={formData.deliveryName}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    {/* 전화번호 */}
                    <div className="form-card">
                        <label className="form-label">전화번호</label>

                        <div className="phone-group">

                            <select
                                name="phonePrefix"
                                value={formData.phonePrefix}
                                onChange={handleChange}
                                className="phone-select"
                            >
                                <option value="010">010</option>
                                <option value="011">011</option>
                                <option value="016">016</option>
                                <option value="017">017</option>
                                <option value="018">018</option>
                                <option value="019">019</option>
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
                            />

                            <span className="phone-dash">-</span>

                            <input
                                type="text"
                                name="phoneLast"
                                value={formData.phoneLast}
                                onChange={handleChange}
                                maxLength={4}
                                className="phone-input"
                            />

                        </div>
                    </div>

                    {/* 차량번호 */}
                    <div className="form-card">
                        <label className="form-label">차량 번호</label>
                        <input
                            type="text"
                            name="deliveryCarNo"
                            value={formData.deliveryCarNo}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    {/* 사업자 정보 */}
                    <div className="business-section">
                        사업자 정보
                    </div>

                    {/* 사업자번호 */}
                    <div className="form-card">
                        <label className="form-label">사업자 번호</label>
                        <input
                            type="text"
                            name="businessNo"
                            value={formData.businessNo}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    {/* 사업주 이름 */}
                    <div className="form-card">
                        <label className="form-label">사업주 이름</label>
                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    {/* 버튼 */}
                    <button
                        type="submit"
                        className="submit-btn"
                    >
                        수정하기
                    </button>

                </form>

            </div>

        </div>
    );
};

export default EditDelivery;