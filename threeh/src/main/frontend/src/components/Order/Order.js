import React, { useEffect, useState } from 'react';
import OrderInfo from './OrderInfo';
import OrderUser from './OrderUser';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import OrderItemInfo from './OrderItemInfo';
import { useToast } from '../../hook/useToast';
import Header from '../main/Header';
import Footer from '../main/Footer';

function Order(props) {

    const { itemId } = useParams();
    const location = useLocation();

    

    const [orderData, setOrderData] = useState(null);
    const [isCartOrder, setIsCartOrder] = useState(false);
    
    const [deliveryDate, setDeliveryDate] = useState('');
    

    const [orderType, setOrderType] = useState(null);
    const navigate = useNavigate();

    const user = sessionStorage.getItem("user");
    const userId = user ? JSON.parse(user) : null;
    const saveAddress = JSON.parse(localStorage.getItem(`addresses_${userId.id}`)) || [];
    const defaultAddress = saveAddress.find(addr => addr.addressName === "기본 배송지");

    // console.log("유저 정보", user);
    // console.log("저장주소",saveAddress);
    // console.log("기본주소", defaultAddress);


    const [zipCode, setZipcode] = useState(defaultAddress?.zonecode || '');
    const [address, setAddress] = useState(defaultAddress?.address || '');
    const [detailedAddress, setDetailedAddress] = useState(defaultAddress?.detail || '');

    const { success, error, warn } = useToast();
  

    if(!user) {
        warn("잘못된 접근이거나 세션이 만료되었습니다.");
        navigate('/login');
    }

    console.log(location);

    const { orderItems, fromCart } = location.state || {};

    console.log("주문 아이템 정보", orderItems);

    useEffect(() => {

            // if (defaultAddress) {
            //     setZipcode(defaultAddress.zipCode || '');
            //     setAddress(defaultAddress.address || '');
            //     setDetailedAddress(defaultAddress.detail || '');
            // }

        if(fromCart && orderItems){

            

            

            if (!orderItems) {
                console.log("주문할 아이템 ID가 존재하지 않습니다.");
                return;
            }

            const requestBody = orderItems.map(item => Number(item.cartItemId));

            // console.log("백엔드 보낼 데이터 : ", requestBody);

            //백엔드 검증 데이터 로드
            axios.post("/api/order/items", requestBody, {
                headers: {
                    'Content-Type' : 'application/json'
                },
                withCredentials: true
            })
                .then(res => {
                    // console.log("서버 검증 데이터: ", res.data);

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
                    error("상품 정보를 불러오는데 실패");
                    //navigate('/cart');
                })
            
        }else if (itemId) {
            axios.get(`/api/order/${itemId}`)
                .then(res => {
                   
                    setOrderData(res.data);
                    setIsCartOrder(false);
                })
                .catch(error => {
                   
                    if (error.response) {
                        //  401 (Unauthorized)
                        if (error.response.status === 401) {
                            console.error("인증 실패: 로그인 세션이 만료되었습니다.");
                            warn("로그인이 만료되었습니다. 다시 로그인해주세요.");
                            navigate('/login', { state: { from: location.pathname } });
                        } 

                        // 3. 그 외 400, 500 등 서버 에러
                        else {
                            console.error(`서버 에러 (${error.response.status}):`, error.response.data);
                            error("상품 정보를 불러오는 중 오류가 발생했습니다.");
                        }
                    } 
                    // 4. 서버 응답 자체가 없는 경우 (네트워크 에러 등)
                    else if (error.request) {
                        console.error("응답 없음: 서버와 통신할 수 없습니다.");
                    } 
                    // 5. 기타 코드 에러
                    else {
                        console.error("Error:", error.message);
                    }
                });
        }
    }, [itemId, location.state]);

    console.log("보낼 상품 정보:", orderData);

    

    return (
        <>
            <div className='main-header'>
            <Header/>
            </div>

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
            

            <div className="main-mypage-footer">
                <Footer/>
            </div>
        </>
    );
}

export default Order;