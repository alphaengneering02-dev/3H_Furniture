import React, { useState } from 'react';
import axios from 'axios';

const DriverPage = () => {
    const [loginInfo, setLoginInfo] = useState({ phone: '', carSuffix: '' });
    const [driver, setDriver] = useState(null); 
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 1. 기사 로그인
    const handleLogin = async () => {
        try {
            const res = await axios.post('/admin/driver/login', loginInfo); 
            setDriver(res.data);
            setIsLoggedIn(true);
            fetchOrders(res.data.deliveryId);
        } catch (err) {
            alert("로그인 정보가 일치하지 않습니다.");
        }
    };

    // 2. 배정된 주문 목록 가져오기
    const fetchOrders = async (id) => {
    try {
        const res = await axios.get(`/admin/driver/${id}/orders`);

        console.log("기사 주문 데이터:", res.data);

        setAssignedOrders(res.data);
    } catch (err) {
        console.error("목록 로드 실패", err);
    }
};
    // 3. 수락 및 완료 처리 (통합 핸들러)
    const handleAction = async (orderId, actionType) => {
        try {
            if (actionType === 'ACCEPT') {
                // 수락/거절 (PATCH)
                await axios.patch(`/admin/driver/orders/${orderId}/response`, { action: 'ACCEPT' });
            } else if (actionType === 'COMPLETE') {
                // 배송 완료 (POST)
                await axios.post(`/admin/orders/${orderId}/complete`);
            }
            
            alert("처리가 완료되었습니다.");
            fetchOrders(driver.deliveryId); // 리스트 갱신
        } catch (err) {
            alert("처리 중 오류가 발생했습니다.");
        }
    };

    // [로그인 화면]
    if (!isLoggedIn) {
        return (
            <div className="login-wrapper">
                <h2>기사 로그인</h2>
                <input 
                    type="text"
                    placeholder="전화번호" 
                    onChange={e => setLoginInfo({...loginInfo, phone: e.target.value})} 
                />
                <input 
                    type="text"
                    placeholder="차량번호 뒤 4자리" 
                    onChange={e => setLoginInfo({...loginInfo, carSuffix: e.target.value})} 
                />
                <button onClick={handleLogin}>로그인</button>
            </div>
        );
    }

    // [메인 배송 관리 화면]
    return (
        <div className="driver-main">
            <div className="driver-info">
                <p>기사명: {driver.deliveryName} ({driver.deliveryCarNo})</p>
            </div>

            {/* 섹션 1: 신규 배정 목록 */}
            <div className="section">
                <h3>📌 신규 배정 내역</h3>
                {assignedOrders
                    .filter(o => o.orderState === '배송 준비중')
                    .map(order => (
                        <div key={order.orderId} className="order-item">
                            <p>주소: {order.deliveryAddr}</p>
                            <p>상품: {order.orderitems[0]?.itemName || '상품명 없음'}</p>
                            <button onClick={() => handleAction(order.orderId, 'ACCEPT')}>배송 수락</button>
                        </div>
                    ))}
            </div>

            <hr />

            {/* 섹션 2: 배송 중 목록 */}
            <div className="section">
                <h3>🚚 배송 중인 주문</h3>
                {assignedOrders
                    .filter(o => o.orderState === '배송중')
                    .map(order => (
                        <div key={order.orderId} className="order-item">
                            <p>주소: {order.deliveryAddr}</p>
                            <p>상태: 배송 중</p>
                            <button onClick={() => handleAction(order.orderId, 'COMPLETE')}>배송 완료 처리</button>
                        </div>
                    ))}
            </div>

            {assignedOrders.length === 0 && <p>현재 배정된 주문이 없습니다.</p>}
        </div>
    );
};

export default DriverPage;