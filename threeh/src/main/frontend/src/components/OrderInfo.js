import React from 'react';
import AdrdressInput from './AdrdressInput';

function OrderInfo(props) {
    return (
        <div>
           <div>
                <label>배송 및 설치 선택</label>

                <div>
                    <label>
                        <input type='radio' id='install' name='deliveryType' value={"배송 및 설치"}/> 배송 및 설치
                    </label>

                    <label>
                        <input type='radio' id='delivery' name='deliveryType' value={"배송만"}/> 배송만
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