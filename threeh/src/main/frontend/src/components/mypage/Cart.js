import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { getUrl } from '../../utils/BackendPath';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [member, setMember] = useState(null);

    //체크박스 수동/전체 선택 상태 관리용
    const [selectedIds, setSelectedIds] = useState([]);

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
            axios.get(`/api/Member/cart/list?id=${loginUserId}`, { withCredentials: true })
                .then(res => {

                    console.log(res);
                    // 서버 DB에서 받아온 실제 사용자의 장바구니 상품 목록 세팅
                    if(res.data){
                        setCartItems(res.data.cartItems);
                    }
                    //최초 데이터 로드 시 모든 상품 기본체크상태로
                    const allIds = res.data.cartItems.map(item => item.cartItemId || item.cartitemId);
                        setSelectedIds(allIds);
                    
                })
                .catch(err => {
                    console.error("장바구니 최신 데이터 로드 실패", err);

                    // 팀 마이페이지 핵심 차단 알고리즘 구조 그대로 수용
                    if (err.response && err.response.status === 401) {
                        // sessionStorage.removeItem('user');
                        // setMember(null);
                        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                        navigate('/login'); // 로그인 유도 추가
                    } else {
                        // console.log("네트워크 장애로 인한 세션 강제 보존 및 테스트 데이터 바인딩");
                        // setCartItems([
                        //     { cartItemId: 1, itemName: "테스트용 소파", count: 1, orderPrice: 50000 }
                        // ]);
                         alert("시스템 오류");
                    }
                });
                
        } else {
            setMember(null);
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
        }
    }, [navigate]);

    //실시간 가격 합산/차감 계산식 및 체크박스 제어 기능 배치
    const totalOrderPrice = cartItems
        .filter(item => selectedIds.includes(item.cartItemId || item.cartItemId))
        .reduce((total, item) => total + (Number(item.orderPrice) * item.count), 0);

    //개별 수동 체크박스 토글 함수
    const handleCheckElement = (id) => {
        if(selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }else {
            //체크 선택 시 : 배열에 추가해서 금액 합산 및 주문 대상에 포함
            setSelectedIds(prev => [...prev, id]);
        }
    };

    //전체 선택/해제 함수
    const handleAllCheck = (checked) => {
        if(checked) {
            const allIds = cartItems.map(item => item.cartItemId || item.cartItemId);
            setSelectedIds(allIds); //전체 금액 합산
        } else {
            setSelectedIds([]); //전체 금액 0원 처리
        }
    }

    // 상품 삭제 로직
    const deleteItem = (cartItemId) => {
        if (window.confirm("상품을 삭제하시겠습니까?")) {
            axios.post(`/api/Member/cart/delete/${cartItemId}`, {}, { withCredentials: true })
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
        axios.post('/api/Member/cart/update', params, { 
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
         // 수정/추가  장바구니 전체 수량이 아니라, '현재 체크박스가 켜진 선택 상품'이 존재하는지 유효성 검증
        if (selectedIds.length === 0) return alert("주문할 상품을 선택해주세요.");
        
        //선택한 물픔이 주문으로 넘어가게끔 수정
        const targetItems = cartItems.filter(item => 
            selectedIds.includes(item.cartItemId || item.cartitemId)
        );

        axios.post('/api/Member/cart/toss',
            {cartItemIds:selectedIds},
            {withCredentials:true}
        )
        .then(res => {
            const serverOrderId = res.data.orderId;
            
            // [최종 수량 토스 마감] 백엔드 가상 데이터 대신, 사용자가 실시간으로 
            // 수량을 변경해 놓은 현재 화면의 최신 장바구니 배열상태(cartItems)를 그대로 복사하여 토스합니다.
            // 이로써 조장님 페이지 결제창에서도 내가 올린 수량 그대로 완벽하게 나타납니다.
            //const targetItems = cartItems; 

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
        <div className="cart-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>{member?.name || member?.id || '고객'}님의 장바구니</h1>
            
            {/* 💡 [수정/추가 완료] 상단 전체 선택 바 레이아웃 배치 */}
            {cartItems.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '2px solid #ccc', marginBottom: '15px' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <input 
                            type="checkbox" 
                            onChange={(e) => handleAllCheck(e.target.checked)}
                            // 전체 장바구니 상품 개수와 내가 선택한 상자의 개수가 완벽히 일치할 때만 전체 체크박스에 불이 들어옵니다.
                            checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                            전체 선택 ({selectedIds.length}/{cartItems.length})
                        </span>
                    </label>
                </div>
            )}

            {cartItems.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '30px 0' }}>장바구니가 비어 있습니다.</p>
            ) : (
                cartItems.map(item => {
                    const itemId = item.cartItemId || item.cartitemId;
                    return (
                        <div key={itemId} className="cart-item" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd', padding: '15px 0' }}>
                            
                            {/* 💡 [수정/추가 완료] 개별 상품 왼쪽 수동 체크박스 주입 */}
                            <input 
                                type="checkbox" 
                                // 현재 순회 중인 상품의 ID가 선택된 ID 보관함(selectedIds)에 포함되어 있는지 여부로 체크 판정
                                checked={selectedIds.includes(itemId)}
                                onChange={() => handleCheckElement(itemId)} // 클릭 시 보관함에 넣거나 빼는 핸들러 가동
                                style={{ marginRight: '15px', width: '18px', height: '18px', cursor: 'pointer' }}
                            />

                            <img src={getUrl(item.imageUrl)} alt={item.itemName} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} />

                            <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 10px 0' }}><strong>{item.itemName}</strong></p>
                                <div className="quantity-box" style={{ display: 'flex', alignItems: 'center' }}>
                                    <button onClick={() => updateCount(itemId, item.count - 1)} style={{ padding: '2px 8px' }}>-</button>
                                    <span style={{ margin: '0 15px', fontWeight: 'bold' }}>{item.count}</span>
                                    <button onClick={() => updateCount(itemId, item.count + 1)} style={{ padding: '2px 8px' }}>+</button>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', marginRight: '20px' }}>
                                <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '13px' }}>개당 {Number(item.orderPrice).toLocaleString()}원</p>
                                <p style={{ margin: '0', fontWeight: 'bold', color: '#333' }}>{(Number(item.orderPrice) * item.count).toLocaleString()}원</p>
                            </div>

                            <button onClick={() => deleteItem(itemId)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>삭제</button>
                        </div>
                    );
                })
            )}

            {/* 💡 [수정/추가 완료] 실시간 동적 변수 totalOrderPrice를 매핑하여 체크 해제나 수량 변경 시 금액이 무조건 실시간 동기화됨 */}
            <div className="total-price-box" style={{ marginTop: '30px', borderTop: '2px solid #333', paddingTop: '20px', textAlign: 'right' }}>
                <h3>총 결제 예상 금액: <span style={{ color: '#d9534f', fontSize: '24px' }}>{totalOrderPrice.toLocaleString()}</span>원</h3>
            </div>

            <button onClick={handleOrder} style={{ marginTop: '20px', padding: '15px', backgroundColor: '#333', color: '#fff', border: 'none', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' }}>
                {selectedIds.length}개 상품 주문하기
            </button>
        </div>
    );
};


export default Cart;
