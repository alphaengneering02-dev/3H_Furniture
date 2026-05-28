import React, { useEffect, useState } from 'react';
import OrderInfo from './OrderInfo';
import OrderUser from './OrderUser';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import OrderItemInfo from './OrderItemInfo';
import { useToast } from '../../hook/useToast';
import Header from '../main/Header';
import Footer from '../main/Footer';

//김인호 스타일 시트 로드
import '../../css/orderPageCss/orderPage.css';

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
    const saveAddress = userId
    ? (JSON.parse(localStorage.getItem(`addresses_${userId.id}`)) || [])
    : [];
    const defaultAddress = saveAddress.find(addr => addr.addressName === "기본 배송지");

    // console.log("유저 정보", user);
    // console.log("저장주소",saveAddress);
    // console.log("기본주소", defaultAddress);


    const [zipCode, setZipcode] = useState(defaultAddress?.zonecode || '');
    const [address, setAddress] = useState(defaultAddress?.address || '');
    const [detailedAddress, setDetailedAddress] = useState(defaultAddress?.detail || '');

    const { success, error: toastError, warn, info } = useToast();
  

   

    console.log(location);

    const { orderItems, fromCart } = location.state || {};

    console.log("주문 아이템 정보", orderItems);
    // if(!userId) {
    //         warn("잘못된 접근이거나 세션이 만료되었습니다.");
    //         navigate('/login');
    //         return;
    // }

    useEffect(() => {


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
                    toastError("상품 정보를 불러오는데 실패");
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
                            toastError("상품 정보를 불러오는 중 오류가 발생했습니다.");
                        }
                    } 
                    // 4. 서버 응답 자체가 없는 경우 (네트워크 에러 등)
                    else if (error.request) {
                        console.toastError("응답 없음: 서버와 통신할 수 없습니다.");
                    } 
                    // 5. 기타 코드 에러
                    else {
                        console.toastError("Error:", error.message);
                    }
                });
        }
    }, [itemId, location.state]);

    //if (!userId) return;
    console.log("보낼 상품 정보:", orderData);

    

        return (
        // [시작] 페이지 전체 최상위 루트 (배경색 및 최소 높이 제어)
        <div className="order-page-global-root">
            
            {/* 1. 상단 공용 헤더 영역 */}
            <div className='main-header'>
                <Header/>
            </div> {/* [종료] main-header */}

            {/* 2. 중앙 컨텐츠 메인 랩퍼 (가로폭 1200px 최대 제한 및 중앙 정렬) */}
            <div className="order-page-wrapper">
                
                {/* 대형 페이지 타이틀 */}
                <h2 className="order-page-title">주문 / 결제</h2>

                {/* [시작] 원본 이미지처럼 좌우 레이아웃을 찢어주는 플렉스 컨테이너 */}
                <div className="order-content-layout">
                    
                    {/* [시작] 좌측 영역: 입력 카드 컴포넌트들을 위아래로 쌓아두는 세로 정렬 박스 */}
                    <div className="order-left-section">
                        
                        {/* [독립 카드 1] 배송 및 설치 선택 / 주소지 정보 입력창 */}
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

                        {/* [독립 카드 2] 주문 고객 이름, 전화번호 및 배송 설치 날짜 */}
                        <OrderUser 
                            orderData={orderData}
                            deliveryDate={deliveryDate}
                            setDeliveryDate={setDeliveryDate}
                        />
                        
                    </div> {/* [종료] order-left-section */}

                    {/* [시작] 우측 영역: 기본배송지 미리보기 + 상품 목록 + 결제 버튼 스티키 사이드바 부모 박스 */}
                    <div className="order-right-section">
                        
                        {/* 영수증 및 결제하기 목록 전체 뷰 컴포넌트 */}
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
                        
                    </div> {/* 👉 [종료] order-right-section */}

                </div> {/* [종료] order-content-layout (좌우 2단 분할 레이아웃 컨테이너 끝) */}
                
            </div> {/* [종료] order-page-wrapper (중앙 메인 컨텐츠 영역 끝) */}

            {/* 3. 하단 공용 푸터 영역 */}
            <div className="main-mypage-footer">
                <Footer/>
            </div> {/* [종료] main-mypage-footer */}

        </div> // [종료] order-page-global-root (페이지 전체 최상위 루트 끝)
    );
}

export default Order;