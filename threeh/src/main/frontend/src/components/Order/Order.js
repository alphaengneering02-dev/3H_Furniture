import React, { useEffect, useState } from 'react';
import OrderInfo from './OrderInfo';
import OrderUser from './OrderUser';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import OrderItemInfo from './OrderItemInfo';

function Order(props) {

    const { itemId } = useParams();
    const cartItems = useLocation();


    const [orderData, setOrderData] = useState(null);
    const [isCartOrder, setIsCartOrder] = useState(false);
    const [zipCode, setZipcode] = useState('');
    const [address, setAddress] = useState('');
    const [detailedAddress, setDetailedAddress] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    

    const [orderType, setOrderType] = useState(null);
    const navigate = useNavigate();

    // const user = sessionStorage.getItem("user");

    if(!cartItems.state.user) {
        alert("로그인이 필요한 서비스입니다.");
        navigate('/login');
    }

    console.log(cartItems);

    useEffect(() => {

        if(cartItems.state && cartItems.state.orderItems){

            const ids = cartItems.state.orderId;

            //백엔드 검증 데이터 로드
            axios.post("/api/order/items", [ids], {
                headers: {
                    'Content-Type' : 'qpplication/json'
                }
            })
                .then(res => {
                    console.log("서버 검증 데이터: ", res.data);

                    setOrderData(res.data); 
                    setIsCartOrder(true);

                    if(res.data.defaultAddr){
                        setAddress(res.defaultAddr);
                        setDetailedAddress(res.detailedAddress);
                        setZipcode(res.zipCode);
                    }
                })

                .catch(error =>  {
                    console.log(error)
                    alert("상품 정보를 불러오는데 실패");
                    navigate('/cart');
                })
            
        }else if (itemId) {
            axios.get(`/api/order/${itemId}`)
                .then(res => {
                    setOrderData(res.data);
                    setIsCartOrder(false);
                })
                .catch(error => console.log(error));
        }
    }, [itemId, cartItems.state]);

    

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
                isCartOrder={isCartOrder}
                zipCode={zipCode}
                address={address}
                deliveryDate={deliveryDate}
                detailedAddress={detailedAddress}
               />
        </>
    );
}

export default Order;