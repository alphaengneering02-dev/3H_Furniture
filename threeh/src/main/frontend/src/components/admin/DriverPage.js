import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DriverPage = () => {
    const [driver, setDriver] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [orders, setOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    
    const [acceptedOrders, setAcceptedOrders] = useState([]);

    const [shippingOrders, setShippingOrders] = useState([]);
    const [shippingCheckeds, setShippingCheckeds] = useState([]);

    const [loginInfo, setLoginInfo] = useState({ phone: '', carSuffix: '' });

    useEffect(() => {
        const savedDriver = localStorage.getItem('driverInfo');
        if (savedDriver) {
            const driverData = JSON.parse(savedDriver);
            setDriver(driverData);
            setIsLoggedIn(true);
            fetchDriverOrders(driverData.deliveryId);
        }
    }, []);

    // 💡 백엔드 상태에 맞춘 데이터 필터링 정의
    const fetchDriverOrders = async (deliveryId) => {
        try {
            const orderRes = await axios.get(`/admin/driver/${deliveryId}/orders`);
        const dbOrders = orderRes.data;
        
        // 🛠️ 수정: deliveryStatus가 null(또는 없을 때)이 진짜 "신규 배정" 요청입니다!
        setOrders(dbOrders.filter(o => !o.deliveryStatus));
        
        // 배송 중 조건은 그대로 유지
        setShippingOrders(dbOrders.filter(o => o.deliveryStatus === 'SHIPPING'));
    } catch (err) {
        console.error("주문 목록 로드 실패", err);
    }
};

    // 로그인
    const handleLogin = async () => {
        try {
            const res = await axios.post('/admin/driver/login', loginInfo);
            setDriver(res.data);
            setIsLoggedIn(true);
            localStorage.setItem('driverInfo', JSON.stringify(res.data)); // 로컬스토리지 저장 추가

            //리로드 새로고침
            const orderRes = await axios.get(`/admin/driver/${res.data.deliveryId}/orders`);
            const dbOrders = orderRes.data;
            
            setOrders(dbOrders.filter(o => o.deliveryStatus === 'WAITING'));
            setShippingOrders(dbOrders.filter(o => o.deliveryStatus === 'SHIPPING'));
        } catch (err) {
            alert("로그인 실패");
        }
    };

    //로그아웃
    const handleLogout = () => {
        // 1. 로컬스토리지에서 기사 정보 삭제
        localStorage.removeItem('driverInfo');
        
        // 2. 로그인 및 기사 관련 상태 초기화
        setDriver(null);
        setIsLoggedIn(false);
        setLoginInfo({ phone: '', carSuffix: '' });

        // 3. 주문 관련 모든 리스트 상태 초기화
        setOrders([]);
        setSelectedOrders([]);
        setAcceptedOrders([]);
        setShippingOrders([]);
        setShippingCheckeds([]);

        alert("로그아웃 되었습니다.");
    };

    // 신규 배정 체크박스 토글
    const toggleSelect = (id) => {
        setSelectedOrders(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        );
    };

    // 🚚 배송 중 목록 체크박스 토글
    const toggleShippingSelect = (id) => {
        setShippingCheckeds(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        );
    };

    // 선택 수락 (화면 상의 '수락된 주문'으로 임시 이동)
    const handleAccept = async () => {
        if (selectedOrders.length === 0) return;

        try {
            await Promise.all(
                selectedOrders.map(id =>
                    axios.patch(`/admin/driver/orders/${id}/response`, {
                        action: 'ACCEPT'
                    })
                )
            );

            const accepted = orders.filter(o => selectedOrders.includes(o.orderId));

            setAcceptedOrders(prev => [...prev, ...accepted]);
            setOrders(prev => prev.filter(o => !selectedOrders.includes(o.orderId)));
            setSelectedOrders([]);

        } catch (err) {
            alert("수락 실패");
        }
    };

    // 선택 거절 (거절 시 내 목록에서 완전히 삭제 및 백엔드 리로드)
    const handleReject = async () => {
        if (selectedOrders.length === 0) return;
        try {
            await Promise.all(
                selectedOrders.map(id =>
                    axios.patch(`/admin/driver/orders/${id}/response`, {
                        action: 'REJECT'
                    })
                )
            );

            // 💡 새로고침하여 확실하게 내 배정 대기 리스트에서 제외시킵니다.
            fetchDriverOrders(driver.deliveryId);
            setSelectedOrders([]);
            alert("선택한 주문을 거절했습니다. (어드민 미배정으로 복구)");

        } catch (err) {
            alert("거절 실패");
        }
    };

    // 배송 시작 (수락 목록 전체 출발 -> 배송 중 목록으로 이동)
    const handleStartDelivery = async () => {
    try {
        // 1. 모든 선택된 주문에 대해 배송 출발 API 호출
        await Promise.all(
            acceptedOrders.map(o =>
                axios.post(`/admin/orders/${o.orderId || o.id}/start`) // 혹시 모를 id 키값 대응
            )
        );

        alert("배송 출발!");

        // 2. 💡 수동으로 상태를 옮기지 말고, 백엔드에서 최신 데이터를 새로고침(Reload) 합니다.
        if (driver && driver.deliveryId) {
            await fetchDriverOrders(driver.deliveryId);
        }

        // 3. 출발 처리가 끝났으므로 수락 리스트(화면)는 비워줍니다.
        setAcceptedOrders([]);

    } catch (err) {
        console.error("배송 출발 처리 중 에러 발생:", err);
        alert("배송 출발 실패");
    }
};
// 기사 상태만 WAITING으로 돌려서 화면 비우기
const handleResetToWaiting = async () => {
    try {
        // 1. post를 put으로 변경
        // 2. 따옴표(') 대신 키보드 1번 왼쪽의 백틱(`)을 사용해 ${}가 작동하도록 수정
        await axios.put(`/admin/driver/${driver.deliveryId}/reset-status`);
        
        // 프론트엔드 기사 화면 초기화
        setAcceptedOrders([]);    
        setShippingOrders([]);    
        setShippingCheckeds([]);
        
        alert("대기 상태로 전환되었습니다. 새로운 배정을 받을 수 있습니다!");
        
        if (typeof fetchDriverOrders === 'function') {
            fetchDriverOrders(driver.deliveryId);
        }
    } catch (err) {
        console.error(err);
        alert("대기 전환 실패: 서버 에러가 발생했습니다.");
    }
};

    // 선택 배송 완료 (체크박스 기반)
    const handlecomplete = async () => {
        if (shippingCheckeds.length === 0) {
            alert("완료 처리할 주문을 선택해 주세요.");
            return;
        }

        try {
            await Promise.all(
                shippingCheckeds.map(id =>
                    axios.post(`/admin/orders/${id}/complete`)
                )
            );

            // 완료된 주문들은 배송 중 목록(shippingOrders)에서 제외 처리
            setShippingOrders(prev => 
                prev.filter(o => !shippingCheckeds.includes(o.orderId))
            );

            
            
            // 체크박스 선택 초기화
            setShippingCheckeds([]);
            alert("선택하신 주문의 배송 완료 처리가 되었습니다.");

        } catch (err) {
            alert("배송 완료 처리 실패");
        }
    };

    if (!isLoggedIn) {
        return (
            <div>
                <h2>기사 로그인</h2>
                <input placeholder="전화번호"
                    onChange={e => setLoginInfo({ ...loginInfo, phone: e.target.value })} />
                <input placeholder="차량번호"
                    onChange={e => setLoginInfo({ ...loginInfo, carSuffix: e.target.value })} />
                <button onClick={handleLogin}>로그인</button>
            </div>
        );
    }

    return (
        <div>
            <div className="driver-info">
                <p>기사명: {driver.deliveryName} ({driver.deliveryCarNo})</p>
                <button onClick={handleLogout}>로그아웃</button>
            </div>

            {/* 1. 신규 배정 */}
            <h2>📌 신규 배정 (수락 대기 WAITING)</h2>
            {orders.length === 0 ? <p>새로운 배정 요청이 없습니다.</p> : 
                orders.map(order => (
                    <div key={order.orderId}>
                        <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.orderId)}
                            onChange={() => toggleSelect(order.orderId)}
                        />
                        주문번호: {order.orderId} | 주소: {order.deliveryAddr}
                    </div>
                ))
            }
            {orders.length > 0 && (
                <div>
                    <button onClick={handleAccept}>선택 수락</button>
                    <button onClick={handleReject}>선택 거절</button>
                </div>
            )}

            <hr />

            {/* 2. 수락 리스트 */}
            <h2>📦 수락된 주문 (출발 전 WAITING에서 )</h2>
            {acceptedOrders.length === 0 ? <p>수락 후 대기 중인 주문이 없습니다.</p> :
                acceptedOrders.map(order => (
                    <div key={order.orderId}>
                        주문번호: {order.orderId} | 주소: {order.deliveryAddr}
                    </div>
                ))
            }
            {acceptedOrders.length > 0 && (
                <button onClick={handleStartDelivery}>
                    🚚 배송 출발 (상차 완료)
                </button>
            )}

            <hr />

            {/* 3. 배송 중 리스트 💡 오타 수정 및 체크박스 기능 연동 완료 */}
            <h2>🚚 배달중 (현재 배송 진행)</h2>
            {shippingOrders.length === 0 ? <p>현재 진행 중인 배송이 없습니다.</p> :
                shippingOrders.map(order => (
                    <div key={order.orderId}>
                        <input
                            type="checkbox"
                            checked={shippingCheckeds.includes(order.orderId)}
                            onChange={() => toggleShippingSelect(order.orderId)}
                        />
                        주문번호: {order.orderId} | 주소: {order.deliveryAddr}
                    </div>
                ))
            }
            {shippingOrders.length > 0 && (
                <button onClick={handlecomplete}>
                    ✅ 선택 주문 배송 완료
                </button>
            )}

            <hr />
{shippingOrders.length === 0 && acceptedOrders.length === 0 && (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <p style={{ color: '#666' }}>💡 현재 진행 중인 배송 임무가 없습니다.</p>
        <button 
            onClick={handleResetToWaiting} 
            style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                padding: '12px 24px', 
                fontSize: '16px', 
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}
        >
            🔄 다음 배송 받기 (대기 상태 전환)
        </button>
    </div>
)}




        </div>
    );
};

export default DriverPage;