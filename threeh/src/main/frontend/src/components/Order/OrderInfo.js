import React from 'react';
import AdrdressInput from './AdrdressInput';

function OrderInfo(orderType, setOrderType) {
    return (
        <div>
           <div>
                <label>배송 및 설치 선택</label>

                <div>
                    <label>
                        <input type='radio' id='install' name='deliveryType' value={"DELIVERY_WITH_INSTALLATION"}
                        checked={orderType === "DELIVERY_WITH_INSTALLATION"}
                        onChange={(e) => setOrderType(e.target.value)}/> 배송 및 설치
                    </label>

                    <label>
                        <input 
                        type='radio' 
                        name='deliveryType' 
                        value="DELIVERY_ONLY" 
                        checked={orderType === "DELIVERY_ONLY"}
                        onChange={(e) => setOrderType(e.target.value)}
                    /> 배송만
                    </label>
                </div>

                <label>우편번호 입력</label>
                <div>
                    <AdrdressInput/>
                </div>

            </div>
        </div>
    );
}

export default OrderInfo;