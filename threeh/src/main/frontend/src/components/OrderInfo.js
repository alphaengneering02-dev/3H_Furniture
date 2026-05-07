import React from 'react';

function OrderInfo(props) {
    return (
        <div>
           <div>
                <label>배송 및 설치 선택</label>

                <div>
                    <label>
                        <input type='radio' id='install' name='deliveryType'>배송 및 설치</input>
                    </label>

                    <label>
                        <input type='radio' id='delivery' name='deliveryType'>배송만</input>
                    </label>
                </div>

                <label>우편번호 입력</label>
                우편번호 입력해서 주소지 받아오는 프로그램

            </div>
        </div>
    );
}

export default OrderInfo;