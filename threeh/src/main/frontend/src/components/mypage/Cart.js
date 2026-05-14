import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [member, setMember] = useState(null);

    // 페이지 로드 시 세션 확인 및 실제 백엔드 DB 데이터 로드
    useEffect(() => {
        const savedUser = sessionStorage.getItem('user');
        
        if (savedUser) {
            const userObj = JSON.parse(savedUser);
            setMember(userObj); 
            
            const loginUserId = userObj.id;

            if (!loginUserId) {
                console.error("유저 오브젝트 내에 로그인 id 속성이 없습니다");
                sessionStorage.removeItem('user');
                setMember(null);
                alert("로그인 정보가 올바르지 않습니다. 다시 로그인해주세요");
                navigate('/login');
                return;
            }

            // 💡 [원래 주소 복구] 팀의 공식 로그인 체계에 맞춰 본래 마이페이지 주소로 쏩니다.
            axios.get(`http://localhost:8080/mypage/cart?id=${loginUserId}`, { withCredentials: true })
                .then(res => {
                    setCartItems(res.data.cartItems || res.data.items || []);
                })
                .catch(err => {
                    console.error("장바구니 최신 데이터 로드 실패", err);

                    if (err.response && err.response.status === 401) {
                        sessionStorage.removeItem('user');
                        setMember(null);
                        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                        navigate('/login');
                    } else {
                        console.log("네트워크 장애로 인한 세션 강제 보존 및 테스트 데이터 바인딩");
                        setCartItems([
                            { cartItemId: 1, itemName: "테스트용 소파", count: 1, orderPrice: 50000 }
                        ]);
                    }
                });
                
        } else {
            setMember(null);
            alert("로그인이 필요한 service입니다.");
            navigate('/login');
        }
    }, [navigate]);

    // 상품 삭제 로직
    const deleteItem = (cartItemId) => {
        if (window.confirm("상품을 삭제하시겠습니까?")) {
            // [원래 주소 복구]
            axios.post(`http://localhost:8080/mypage/cart/delete/${cartItemId}`, {}, { withCredentials: true })
                .then(res => {
                    alert(res.data || "삭제되었습니다.");
                    setCartItems(cartItems.filter(item => item.cartItemId !== cartItemId));
                })
                .catch(err => alert("삭제 처리 실패"));
        }
    };

    // 수량 변경 로직
    const updateCount = (cartItemId, newCount) => {
        if (newCount < 1) return;

        setCartItems(prevItems =>
            prevItems.map(item => 
                item.cartItemId === cartItemId ? { ...item, count: newCount } : item
            )
        );

        const params = new URLSearchParams();
        params.append('cartItemId', cartItemId);
        params.append('count', newCount);

        // [원래 주소 복구]
        axios.post('http://localhost:8080/mypage/cart/update', params, { 
            withCredentials: true,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(() => {
            console.log("서버 장바구니 수량 동기화 완료");
        })
        .catch(err => {
            console.error("수량 변경 에러:", err.response);
        });
    };

    // 주문하기 (조장님 미션 경로 이동 및 state 복사 토스)
    const handleOrder = () => {
        if (cartItems.length === 0) return alert("장바구니가 비어 있습니다.");
        const checkedIds = cartItems.map(item => item.cartItemId);

        // [원래 주소 복구]
        axios.post('http://localhost:8080/mypage/cart/toss',
            {cartItemIds:checkedIds},
            {withCredentials:true}
        )
        .then(res => {
            const serverOrderId = res.data.orderId;
            const targetItems = res.data.orderItems; 

            navigate('/order/order', {
                state: {
                    orderItems: targetItems, 
                    orderId: serverOrderId,
                    fromCart:true,
                    user:member
                }
            })
        })
        .catch(err => {
            console.error("주문 토스 처리 실패:",err);
            alert("주문 페이지 이동 중 오류가 발생했습니다")
        })
    };

    return (
        <div className="cart-container" style={{ padding: '20px' }}>
            <h1>{member?.name || member?.id || '고객'}님의 장바구니</h1>
            
            {cartItems.map(item => (
                <div key={item.cartItemId} className="cart-item" style={{ borderBottom: '1px solid #ddd', padding: '15px' }}>
                    <p><strong>{item.itemName}</strong></p>
                    <div className="quantity-box">
                        <button onClick={() => updateCount(item.cartItemId, item.count - 1)}>-</button>
                        <span style={{ margin: '0 10px' }}>{item.count}</span>
                        <button onClick={() => updateCount(item.cartItemId, item.count + 1)}>+</button>
                    </div>

                    <p>가격: {(Number(item.orderPrice) * item.count).toLocaleString()}원</p>
                    <p>{Number(item.orderPrice).toLocaleString()}원</p>
                    <button onClick={() => deleteItem(item.cartItemId)} style={{ color: 'red' }}>삭제</button>
                </div>
            ))}

            <div className="total-price-box" style={{ marginTop: '30px', borderTop: '2px solid #333', paddingTop: '20px' }}>
                <h3>총 결제 예상 금액: {
                    cartItems.reduce((total, item) => total + (Number(item.orderPrice) * item.count), 0).toLocaleString()
                }원</h3>
            </div>

            <button onClick={handleOrder} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#333', color: '#fff' }}>
                주문하기
            </button>
        </div>
    );
};

export default Cart;
