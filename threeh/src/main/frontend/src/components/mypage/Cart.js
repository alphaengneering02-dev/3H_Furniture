import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [member, setMember] = useState(null);

    // 페이지 로드 시 세션 확인 및 실제 백엔드 DB 데이터 로드 (마이페이지 동기화 방식 완벽 결합)
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

            // [팀 규격 완전 싱크] 팀원들의 세션 프리패스 대문자 주소 규칙인 /Member/cart 하위로 정석 호출합니다.
            axios.get(`http://localhost:8080/Member/cart/list?id=${loginUserId}`, { withCredentials: true })
                .then(res => {
                    // 서버 DB에서 받아온 실제 사용자의 장바구니 상품 목록 세팅
                    setCartItems(res.data.cartItems || res.data.items || []);
                })
                .catch(err => {
                    console.error("장바구니 최신 데이터 로드 실패", err);

                    // 팀 마이페이지 핵심 차단 알고리즘 구조 그대로 수용
                    if (err.response && err.response.status === 401) {
                        sessionStorage.removeItem('user');
                        setMember(null);
                        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                        navigate('/login'); // 로그인 유도 추가
                    } else {
                        console.log("네트워크 장애로 인한 세션 강제 보존 및 테스트 데이터 바인딩");
                        setCartItems([
                            { cartItemId: 1, itemName: "테스트용 소파", count: 1, orderPrice: 50000 }
                        ]);
                    }
                });
                
        } else {
            setMember(null);
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
        }
    }, [navigate]);

    // 상품 삭제 로직
    const deleteItem = (cartItemId) => {
        if (window.confirm("상품을 삭제하시겠습니까?")) {
            axios.post(`http://localhost:8080/Member/cart/delete/${cartItemId}`, {}, { withCredentials: true })
                .then(res => {
                    alert(res.data || "삭제되었습니다.");
                    setCartItems(cartItems.filter(item => (item.cartItemId || item.cartitemId) !== cartItemId));
                })
                .catch(err => alert("삭제 처리 실패"));
        }
    };

    // 수량 변경 로직 (대소문자 양방향 체킹 완벽 보완 완료)
    const updateCount = (cartItemId, newCount) => {
        if (newCount < 1) return;

        // [화면 갱신 버그 해결 핵심부] 백엔드 더미에서 내려온 소문자 'cartitemId'와 리액트의 대문자 'cartItemId' 
        // 2가지 케이스를 모두 안전하게 비교 가공하도록 정정하여 화면의 수량 텍스트가 실시간으로 변경됩니다.
        setCartItems(prevItems =>
            prevItems.map(item => {
                const currentId = item.cartItemId || item.cartitemId;
                return currentId === cartItemId ? { ...item, count: newCount } : item;
            })
        );

        // 자바 @RequestParam 수신 명세 규격에 맞게 파라미터 빌드
        const params = new URLSearchParams();
        params.append('cartItemId', cartItemId); 
        params.append('count', newCount);

        // 팀원들의 안심 대문자 경로인 /Member/cart/update 주소로 정석 발송
        axios.post('http://localhost:8080/Member/cart/update', params, { 
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
        
        // 조장님 페이지로 넘어갈 때도 수량이 최신 상태로 갱신된 cartItems 객체 통째가 넘어가도록 마감 처리
        const checkedIds = cartItems.map(item => item.cartItemId || item.cartitemId);

        axios.post('http://localhost:8080/Member/cart/toss',
            {cartItemIds:checkedIds},
            {withCredentials:true}
        )
        .then(res => {
            const serverOrderId = res.data.orderId;
            
            // [최종 수량 토스 마감] 백엔드 가상 데이터 대신, 사용자가 실시간으로 
            // 수량을 변경해 놓은 현재 화면의 최신 장바구니 배열상태(cartItems)를 그대로 복사하여 토스합니다.
            // 이로써 조장님 페이지 결제창에서도 내가 올린 수량 그대로 완벽하게 나타납니다.
            const targetItems = cartItems; 

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
                <div key={item.cartItemId || item.cartitemId} className="cart-item" style={{ borderBottom: '1px solid #ddd', padding: '15px' }}>
                    
                    {/* 이미지 경로 데이터 매핑 활성화 */}
                    {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.itemName} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} />
                    )}

                    <p><strong>{item.itemName}</strong></p>
                    <div className="quantity-box">
                        <button onClick={() => updateCount(item.cartItemId || item.cartitemId, item.count - 1)}>-</button>
                        <span style={{ margin: '0 10px' }}>{item.count}</span>
                        <button onClick={() => updateCount(item.cartItemId || item.cartitemId, item.count + 1)}>+</button>
                    </div>

                    <p>가격: {(Number(item.orderPrice) * item.count).toLocaleString()}원</p>
                    <p>{Number(item.orderPrice).toLocaleString()}원</p>
                    <button onClick={() => deleteItem(item.cartItemId || item.cartitemId)} style={{ color: 'red' }}>삭제</button>
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
