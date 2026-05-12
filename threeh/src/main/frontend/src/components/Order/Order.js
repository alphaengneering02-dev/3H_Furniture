import React, { useEffect, useState } from 'react';
import OrderInfo from './OrderInfo';
import OrderUser from './OrderUser';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import OrderItemInfo from './OrderItemInfo';

function Order(props) {

    const { itemId } = useParams();
    const [orderData, setOrderData] = useState(null);

    const [orderType, setOrderType] = useState("DELIVERY_ONLY");

    useEffect(() => {
        axios.get(`/order/${itemId}`)
        .then(res => setOrderData(res.data))
        .catch(error => {
            console.log(error);
             if (error.response?.status === 401 || error.response?.status === 500) {
                navigator("/login");
            }
        })
    }, [itemId])

    return (
        <>
            <OrderInfo setOrderType={setOrderType} orderType={orderType} orderData={orderData}/>
            <OrderUser orderData={orderData}/>
            <OrderItemInfo setOrderType={setOrderType} orderType={orderType} orderData={orderData}/>
        </>
    );
}

export default Order;