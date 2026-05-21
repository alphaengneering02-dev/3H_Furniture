import React, { useState } from 'react';

function OrderUser({ orderData, deliveryDate, setDeliveryDate }) {

    

    return (
        <div className="order-section-body">



            <div className="order-info-row">
                <label className='order-info-th'>이름</label>

                <input type='text' className="order-input"
                value={orderData ? orderData.memberName : ''}
                readOnly/>
            </div>

            <div className="order-info-row">
                <label className='order-info-th'>전화번호</label>

                <input type='text' className="order-input"
                value={orderData? orderData.phone  : ''}
                readOnly
                />
            </div>

            <div className="order-info-row">
                <label className='order-date-block'>배송 설치 희망 날짜</label>
                <input type='datetime-local'
                className='order-date-input'
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                />
            </div>
            
            
        </div>
    );
}

export default OrderUser;