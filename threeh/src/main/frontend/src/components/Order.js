import React, { useEffect, useState } from 'react';
import OrderInfo from './OrderInfo';
import OrderUser from './OrderUser';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import OrderItemInfo from './OrderItemInfo';

function Order(props) {

    const { itemId } = useParams();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        axios.get(`/order/${itemId}`)
        .then(res => setOrderData(res.data))
        .catch(error => console.log(error))
    }, [itemId])

    return (
        <>
            <OrderInfo orderData={orderData}/>
            <OrderUser orderData={orderData}/>
            <OrderItemInfo orderData={orderData}/>
        </>
    );
}

export default Order;