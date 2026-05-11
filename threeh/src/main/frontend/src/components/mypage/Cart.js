import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
    const navigete = useNavigate();
    const [cartItems, setCartItems] = useState([]);

    //데이터 가져오기
    useEffect(() => {
        axios.get('http://localhost:8080/mypage/cart',{withCredentials:true})
        .then(res => {

            console.log("백엔드 데이터:", res.data);

            setCartItems(res.data.cartItems || res.data.items || []);
        })
        .catch(err => console.error("장바구니 로드 실패", err));
    },[]);
    
    //주문하기 버튼 클릭
    const handleOrder = () => {
        if (cartItems.length === 0) {
            alert("장바구니가 비어 있습니다")
            return;
        }

        //상품정보를 가지고 주문 페이지로 이동
        navigete('/order/form',{
            state: {
                orderItems: cartItems,
                fromCart: true
            }
        })
    }

    return (
        <div className = "cart-container">
            <h1>장바구니</h1>
            {/*장바구니 아이템 리스트 가져오기*/}
            {cartItems.map(item => (
                <div key={item.cartItemId} className="cart-item">
                    <p>상품명: {item.itemName}</p>
                    <p>수량: {item.count}</p>
                    <p>가격: {item.orderPrice}원</p>
                </div>
            ))}

        <div className="cart-action">
        <button onClick={handleOrder}
                style={{marginTop: '20px',padding:'10px 20px',cursor:'pointer'}}>
            주문하기
            </button>
        </div>
    </div>
    )
    
};

export default Cart;