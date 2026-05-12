import React, { useEffect, useState } from 'react';
import OrderInfo from './OrderInfo';
import OrderUser from './OrderUser';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import OrderItemInfo from './OrderItemInfo';

function Order(props) {

    const { itemId } = useParams();
    const [orderData, setOrderData] = useState(null);
    const [zipCode, setZipcode] = useState('');
    const [address, setAddress] = useState('');
    const [detailedAddress, setDetailedAddress] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    

    const [orderType, setOrderType] = useState(null);
    const navigate = useNavigate();

     const user = sessionStorage.getItem("user");

    

    useEffect(() => {

        

        axios.get(`/api/order/${itemId}`)
        .then(res => {
            console.log(res);
            setOrderData(res.data);
            
        })
        .catch(error => {
            console.log(error);
            // navigate('/error')
        })

        
    }, [itemId])

    return (
        <>
            <OrderInfo 
                setOrderType={setOrderType} 
                orderType={orderType} 
                orderData={orderData}
                setZipcode={setZipcode}
                zipCode={zipCode}
                address={address}
                detailedAddress={detailedAddress}
                setDetailedAddress={setDetailedAddress}
                setAddress={setAddress}
                />

            <OrderUser 
                orderData={orderData}
                deliveryDate={deliveryDate}
                setDeliveryDate={setDeliveryDate}/>

            <OrderItemInfo 
                setOrderType={setOrderType} 
                orderType={orderType} 
                orderData={orderData}
                zipCode={zipCode}
                address={address}
                deliveryDate={deliveryDate}
                detailedAddress={detailedAddress}
               />
        </>
    );
}

export default Order;