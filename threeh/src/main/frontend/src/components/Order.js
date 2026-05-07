import React from 'react';
import OrderInfo from './OrderInfo';
import OrderUser from './OrderUser';

function Order(props) {
    return (
        <>
            <OrderInfo/>
            <OrderUser/>
        </>
    );
}

export default Order;