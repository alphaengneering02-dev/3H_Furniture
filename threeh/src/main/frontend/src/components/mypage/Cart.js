import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [member, setMember] = useState(null);

    //페이지 로드 시 세션 확인 및 데이터 로드
    useEffect(() => {
        const savedUser = sessionStorage.getItem('user');
        if(savedUser) {
            setMember(JSON.parse(savedUser));
        }

        axios.get('http://localhost:8080/mypage/cart',{withCredentials:true})
            .then(res => {
                setCartItems(res.data.cartItems || res.data.items || []);
            })
            .catch(err => {
                console.error("데이터 로드 실패",err);
                setCartItems([
                    {cartItemId: 1, itemName: "테스트용 소파",count: 1, orderPrice : 50000}
                ])
            })
    },[]);

    //상품 삭제 로직
    const deleteItem = (cartItemId) => {
        if (window.confirm("상품을 삭제하시겠습니까?")) {
            axios.post(`http://localhost:8080/mypage/cart/delete/${cartItemId}`, {}, { withCredentials: true })
                .then(res => {
                    alert(res.data);
                    setCartItems(cartItems.filter(item => item.cartItemId !== cartItemId));
                })
                .catch(err => alert("삭제 실패"));
        }
    };

    //수량 변경 로직
    const updateCount = (cartItemId, newCount) => {
        if (newCount < 1) return;

        setCartItems(prevItems =>
                    prevItems.map(item => 
                        item.cartItemId === cartItemId ? { ...item, count: newCount } : item
                    )
            )    

        const params = new URLSearchParams();
        params.append('cartItemId', cartItemId);
        params.append('count', newCount);

        axios.post('http://localhost:8080/mypage/cart/update', params, { withCredentials: true,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
         })
            .then(() => {
                console.log("서버 저장 완료");
    })
            .catch(err => {
                console.error("수량 변경 에러:",err.response);
                //alert("수량 변경 실패")
            });
        };

    // 주문하기 (조장님 미션 경로) //잘 넘어가는지 나중에 테스트
    const handleOrder = () => {
        if (cartItems.length === 0) return alert("장바구니가 비어 있습니다.");
        navigate('/order/form', { state: { orderItems: cartItems, fromCart: true } });
    };

    return (
        <div className="cart-container" style={{ padding: '20px' }}>
            <h1>장바구니</h1>
            {cartItems.map(item => (
                <div key={item.cartItemId} className="cart-item" style={{ borderBottom: '1px solid #ddd', padding: '15px' }}>
                    <p><strong>{item.itemName}</strong></p>
                    <div className="quantity-box">
                        <button onClick={() => updateCount(item.cartItemId, item.count - 1)}>-</button>
                        <span style={{ margin: '0 10px' }}>{item.count}</span>
                        <button onClick={() => updateCount(item.cartItemId, item.count + 1)}>+</button>
                    </div>

                    <p>가격: {(item.orderPrice * item.count).toLocaleString()}원</p>

                    <p>{item.orderPrice}원</p>
                    <button onClick={() => deleteItem(item.cartItemId)} style={{ color: 'red' }}>삭제</button>
                </div>
            ))}

            <div className="total-price-box" style={{ marginTop: '30px', borderTop: '2px solid #333', paddingTop: '20px' }}>
                <h3>총 결제 예상 금액: {
                cartItems.reduce((total, item) => total + (item.orderPrice * item.count), 0).toLocaleString()
                }원</h3>
            </div>

            <button onClick={handleOrder} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#333', color: '#fff' }}>
                주문하기
            </button>
        </div>
    );
};

export default Cart;
