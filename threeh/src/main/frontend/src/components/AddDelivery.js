import React, { useState } from 'react';
import axios from 'axios';

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
        businessAddr: ''
    });

    // 2. 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // 3. 등록 버튼 클릭 (백엔드 통신)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/delivery/register', formData);
            
            if (response.status === 200) {
                alert("✅ 기사 등록이 완료되었습니다!");
               
            }
        } catch (error) {
         
            if (error.response && error.response.data) {
                const { status, message } = error.response.data;
                console.error(`에러 발생 [${status}]: ${message}`);
                alert(`❌ 등록 실패: ${message}`); 
              
            } else {
                alert("서버와 통신 중 문제가 발생했습니다.");
            }
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <h2>배송 기사 등록1</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>업체명:</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
                </div>
                <div>
                    <label>기사 성함:</label>
                    <input type="text" name="deliveryName" value={formData.deliveryName} onChange={handleChange} required />
                </div>
                <div>
                <label>전화번호:</label>

                {/* 앞자리 선택 */}
                <select
                    name="phonePrefix"
                    value={formData.phonePrefix}
                    onChange={handleChange}
                    required
                >
                    <option value="010">010</option>
                    <option value="011">011</option>
                    <option value="016">016</option>
                    <option value="017">017</option>
                    <option value="018">018</option>
                    <option value="019">019</option>
                    <option value="070">070</option>
                </select>
                -
                <input
                    type="text"
                    name="phoneMiddle"
                    value={formData.phoneMiddle}
                    onChange={handleChange}
                    maxLength={4}
                    pattern="\d{4}"
                    inputMode="numeric"
                    required
                    style={{ width: "60px" }}
                />
                -
                <input
                    type="text"
                    name="phoneLast"
                    value={formData.phoneLast}
                    onChange={handleChange}
                    maxLength={4}
                    pattern="\d{4}"
                    inputMode="numeric"
                    required
                    style={{ width: "60px" }}
                />
            </div>
                <div>
                    <label>차량 번호:</label>
                    <input type="text" name="deliveryCarNo" value={formData.deliveryCarNo} onChange={handleChange} required />
                </div>
                <hr />
                <h4>사업자 정보 (필수)</h4>
                <div>
                    <label>사업자 번호:</label>
                    <input type="text" name="businessNo" value={formData.businessNo} onChange={handleChange} required />
                </div>
                <div>
                    <label>상호명:</label>
                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required />
                </div>
                
                <button type="submit" style={{ marginTop: '20px', width: '100%', padding: '10px' }}>
                    등록하기
                </button>
            </form>
        </div>
    );
};

export default AddDelivery;