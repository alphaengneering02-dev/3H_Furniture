import React, { useState } from 'react';
import axios from 'axios';
import './AddDelivery.css';

const AddDelivery = () => {

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

        try {

            const fullPhone =
                `${formData.phonePrefix}-${formData.phoneMiddle}-${formData.phoneLast}`;

            const requestData = {
                ...formData,
                deliveryPhone: fullPhone
            };

            const response = await axios.post(
                '/api/delivery/register',
                requestData
            );

            if (response.status === 200) {

                alert("✅ 기사 등록이 완료되었습니다!");
            }

        } catch (error) {

            if (
                error.response &&
                error.response.data
            ) {

                const {
                    status,
                    message
                } = error.response.data;

                console.error(
                    `에러 발생 [${status}]: ${message}`
                );

                alert(`❌ 등록 실패: ${message}`);

            } else {

                alert(
                    "서버와 통신 중 문제가 발생했습니다."
                );
            }
        }
    };

    return (

        <div className="delivery-page">

            <div className="delivery-container">

                <h1 className="delivery-title">
                    배송 기사 등록
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="delivery-form"
                >

                    {/* 업체명 */}
                    <div className="form-card">

                        <label className="form-label">
                            업체명
                        </label>

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

                    {/* 기사명 */}
                    <div className="form-card">

                        <label className="form-label">
                            기사 성함
                        </label>

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

                    {/* 전화번호 */}
                    <div className="form-card">

                        <label className="form-label">
                            전화번호
                        </label>

                        <div className="phone-group">

                            <select
                                name="phonePrefix"
                                value={formData.phonePrefix}
                                onChange={handleChange}
                                className="phone-select"
                                required
                            >

                                <option value="010">
                                    010
                                </option>

                                <option value="011">
                                    011
                                </option>

                                <option value="016">
                                    016
                                </option>

                                <option value="017">
                                    017
                                </option>

                                <option value="018">
                                    018
                                </option>

                                <option value="019">
                                    019
                                </option>

                                <option value="070">
                                    070
                                </option>

                            </select>

                            <span className="phone-dash">
                                -
                            </span>

                            <input
                                type="text"
                                name="phoneMiddle"
                                value={formData.phoneMiddle}
                                onChange={handleChange}
                                maxLength={4}
                                className="phone-input"
                                required
                            />

                            <span className="phone-dash">
                                -
                            </span>

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

                    {/* 차량번호 */}
                    <div className="form-card">

                        <label className="form-label">
                            차량 번호
                        </label>

                        <input
                            type="text"
                            name="deliveryCarNo"
                            value={formData.deliveryCarNo}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="12가1234"
                            required
                        />

                    </div>

                    {/* 사업자 정보 */}
                    <div className="business-section">

                        사업자 정보

                    </div>

                    {/* 사업자번호 */}
                    <div className="form-card">

                        <label className="form-label">
                            사업자 번호
                        </label>

                        <input
                            type="text"
                            name="businessNo"
                            value={formData.businessNo}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />

                    </div>

                    {/* 사업주 이름 */}
                    <div className="form-card">

                        <label className="form-label">
                            사업주 이름
                        </label>

                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />

                    </div>

                    {/* 버튼 */}
                    <button
                        type="submit"
                        className="submit-btn"
                    >
                        등록하기
                    </button>

                </form>

            </div>

        </div>
    );
};

export default AddDelivery;