import React, { useState } from 'react';

function OrderUser({ orderData, deliveryDate, setDeliveryDate }) {

    

    return (
        <div>


            <div>
                <label>이름</label>

                <input type='text'
                value={orderData ? orderData.memberName : ''}
                readOnly/>
            </div>

            <div>
                <label>전화번호</label>

                <input type='text'
                value={orderData? orderData.phone  : ''}
                readOnly
                />
            </div>

            <div>
                <label>배송 설치 희망 날짜</label>
                <input type='datetime-local'
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                />
            </div>
            
            
        </div>
    );
}

export default OrderUser;