import React, { useEffect, useState } from 'react';
import OrderInfo from './OrderInfo';
import OrderUser from './OrderUser';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import OrderItemInfo from './OrderItemInfo';

function Order(props) {

    const { itemId } = useParams();
    const location = useLocation();

    

    const [orderData, setOrderData] = useState(null);
    const [isCartOrder, setIsCartOrder] = useState(false);
    const [zipCode, setZipcode] = useState('');
    const [address, setAddress] = useState('');
    const [detailedAddress, setDetailedAddress] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    

    const [orderType, setOrderType] = useState(null);
    const navigate = useNavigate();

    const user = sessionStorage.getItem("user");
  

    if(!user) {
        alert("잘못된 접근이거나 세션이 만료되었습니다.");
        navigate('/login');
    }

    console.log(location);

    useEffect(() => {

        if(location.state && location.state.orderItems){

            const ids = location.state.orderId;

            //백엔드 검증 데이터 로드
            axios.post("/api/order/items", [ids], {
                headers: {
                    'Content-Type' : 'application/json'
                },
                withCredentials: true
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
                .catch(error => {
                   
                    if (error.response) {
                        //  401 (Unauthorized)
                        if (error.response.status === 401) {
                            console.error("인증 실패: 로그인 세션이 만료되었습니다.");
                            alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
                            navigate('/login', { state: { from: location.pathname } });
                        } 
                        // 3. 그 외 400, 500 등 서버 에러
                        else {
                            console.error(`서버 에러 (${error.response.status}):`, error.response.data);
                            alert("상품 정보를 불러오는 중 오류가 발생했습니다.");
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