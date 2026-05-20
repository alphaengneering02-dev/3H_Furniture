import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/adminCss/driverPage.css';

const DriverPage = () => {
    const [driver, setDriver] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [orders, setOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    
    const [acceptedOrders, setAcceptedOrders] = useState([]);

    const [shippingOrders, setShippingOrders] = useState([]);
    const [shippingCheckeds, setShippingCheckeds] = useState([]);

    const [pickupOrders, setPickupOrders] = useState([]);
    const [pickupCheckeds, setPickupCheckeds] = useState([]);

    const [canceledOrders, setCanceledOrders] = useState([]);

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
            
            // 1. 신규 배정 및 배송중 필터링
            const newOrders = dbOrders.filter(o => !o.deliveryStatus && o.orderState !== 'CANCEL');
            const shipping = dbOrders.filter(o => o.deliveryStatus === 'SHIPPING' && o.orderState !== 'CANCEL');

            //2. 교환, 반품 필터링
            const pickups = dbOrders.filter(o => 
                o.deliveryStatus === 'PICKUP' && (o.orderState === 'EXCHANGE' || o.orderState === 'CANCEL')
            );
            
            setOrders(newOrders);
            setShippingOrders(shipping);
            setPickupOrders(pickups);

            // 💡 핵심 방어 로직
            if (acceptedOrders.length > 0) {
                const dbOrderIds = dbOrders.map(o => o.orderId);
                const missingOrders = acceptedOrders.filter(ao => !dbOrderIds.includes(ao.orderId));
                
                if (missingOrders.length > 0) {
                    setCanceledOrders(prev => {
                        const prevIds = prev.map(p => p.orderId);
                        const uniqueMissing = missingOrders.filter(m => !prevIds.includes(m.orderId));
                        return [...prev, ...uniqueMissing];
                    });
                    setAcceptedOrders(prev => prev.filter(ao => dbOrderIds.includes(ao.orderId)));
                }
            }

        } catch (err) {
            console.error("주문 목록 로드 실패", err);
        }
    };

    const DriverPhoneCell = ({ memberId }) => {
    const [displayValue, setDisplayValue] = useState('조회 중...');

    useEffect(() => {
        if (!memberId) {
            setDisplayValue('비회원');
            return;
        }
        
        axios.get(`/api/member/seq/${memberId}`, { withCredentials: true })
            .then(res => {
                const email = res.data?.email || '';
                const phone = res.data?.phone || '';

                // 1. 만약 phone 필드에 영어가 포함되어 있다면 (소셜 난수 ID나 이메일 오입력 등)
                //    또는 phone 값이 아예 없다면 이메일 주소를 그대로 표기합니다.
                if (/[a-zA-Z]/.test(phone) || !phone) {
                    return setDisplayValue(email ? email : '연락처 없음');
                }

                // 2. phone 필드가 정상적인 숫자/하이픈 형태라면 전화번호를 표기합니다.
                if (phone) {
                    return setDisplayValue(phone);
                }

                setDisplayValue('연락처 없음');
            })
            .catch((err) => {
                console.error(`${memberId}번 회원 조회 실패:`, err);
                setDisplayValue('확인 불가');
            });
    }, [memberId]);

    return <span>{displayValue}</span>;
};

    // 로그인 핸들러 수정
const handleLogin = async () => {
    try {
        const res = await axios.post('/admin/driver/login', loginInfo);
        
        // 1. 기사 정보 상태 저장 및 로컬스토리지 저장
        setDriver(res.data);
        setIsLoggedIn(true);
        localStorage.setItem('driverInfo', JSON.stringify(res.data)); 

        // 🔄 2. 이미 만들어둔 함수를 이용해 로그인 즉시 최신 주문 목록 새로고침(리로드)
        await fetchDriverOrders(res.data.deliveryId);

    } catch (err) {
        console.error(err);
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
        setPickupOrders([]);
        setPickupCheckeds([]);

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

    // 🔄 회수 목록 체크박스 토글 함수 추가
    const togglePickupSelect = (id) => {
        setPickupCheckeds(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        );
    };

    // 선택 수락
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

        if (driver && driver.deliveryId) {
            await fetchDriverOrders(driver.deliveryId);
        }

        setAcceptedOrders([]);

    } catch (err) {
        console.error("배송 출발 처리 중 에러 발생:", err);
        alert("배송 출발 실패");
    }
};



// 기사 상태만 WAITING으로 돌려서 화면 비우기
const handleResetToWaiting = async () => {
    try {
        await axios.put(`/admin/driver/${driver.deliveryId}/reset-status`);
        
        // 프론트엔드 기사 화면 초기화
        setAcceptedOrders([]);    
        setShippingOrders([]);    
        setShippingCheckeds([]);
        setPickupOrders([]);
        setPickupCheckeds([]);
        
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

    const handlePickupComplete = async () => {
        if (pickupCheckeds.length === 0) {
            alert("회수 완료 처리할 주문을 선택해 주세요.");
            return;
        }

        try {
            await Promise.all(
                pickupCheckeds.map(id =>
                    axios.post(`/admin/orders/${id}/complete`) // 백엔드 설계에 따라 pickup 혹은 complete 호출
                )
            );

            setPickupOrders(prev => 
                prev.filter(o => !pickupCheckeds.includes(o.orderId))
            );

            setPickupCheckeds([]);
            alert("선택하신 주문의 회수(물건 수거) 완료 처리가 되었습니다.");

        } catch (err) {
            alert("회수 완료 처리 실패");
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="driver-body-wrapper">
               <div className="driver-login-section"> 
                <h2 className="driver-login-title">기사 로그인</h2>
                <input className="driver-login-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="전화번호(010 0000 0000)"
                    value={loginInfo.phone}
                    onChange={e => {
                        const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                        setLoginInfo({ ...loginInfo, phone: onlyNums });
                                }} 
                            />
                    <input 
                    className="driver-login-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="차량번호 (4자리)"
                    value={loginInfo.carSuffix}
                    onChange={e => {
                        const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                        setLoginInfo({ ...loginInfo, carSuffix: onlyNums });
                            }} 
                        />
            <button className="driver-btn driver-btn-primary" 
            style={{marginTop: '10px'}} onClick={handleLogin}>
            로그인</button>
                </div>
            </div> 
        );
    }
return (
        <div className="driver-body-wrapper">
            {/* 기사 상단 헤더 정보 바 */}
            <div className="driver-top-info-bar">
                <div className="driver-top-info-list">
                    <p className="driver-info-text">
                        배송 파트너: <strong>{driver.deliveryName}</strong> 기사님 ({driver.deliveryCarNo})
                    </p>
                    <button className="driver-btn" style={{padding: '6px 16px', fontSize: '12px'}} onClick={handleLogout}>
                        로그아웃
                    </button>
                </div>
            </div>

            <div className="driver-container">
                
                {/* 1. 신규 배정 섹션 (4열 Grid 스타일 적용) */}
                <h2 className="driver-headline">📌 신규 배정 (수락 대기 목록)</h2>
                {orders.length === 0 ? (
                    <p className="driver-empty-msg">새로운 배정 요청이 없습니다.</p>
                ) : (
                    <>
                        <div className="driver-order-grid">
    {orders.map(order => {
        const isChecked = selectedOrders.includes(order.orderId);

        // 💡 [해결 포인트] 소문자 orderitems와 대소문자 orderItems를 둘 다 받아오도록 통합
        const currentItems = order.orderitems || order.orderItems || [];
        
        let itemDisplay = "상품 정보 없음";
        
        if (currentItems && currentItems.length > 0) {
            // 내부 아이템 필드명도 대소문자(itemName, ItemName) 모두 방어
            const firstItemName = currentItems[0].itemName || currentItems[0].ItemName || "이름 없는 상품";
            const firstItemCount = currentItems[0].count || 0;

            if (currentItems.length === 1) {
                itemDisplay = `${firstItemName} (${firstItemCount}개)`;
            } else {
                // 전체 수량 총합 계산
                const totalCount = currentItems.reduce((sum, item) => sum + (item.count || 0), 0);
                itemDisplay = `${firstItemName} 외 ${currentItems.length - 1}건 (총 ${totalCount}개)`;
            }
        }

        return (
            <div key={order.orderId} className={`driver-order-card ${isChecked ? 'checked' : ''}`}>
                <div className="driver-card-header">
                    <input
                        type="checkbox"
                        className="driver-checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(order.orderId)}
                    />
                    <span className="driver-order-id">NO. {order.orderId}</span>
                    {order.orderType && (
                        <span className={`driver-badge ${order.orderType.toLowerCase()}`}>
                            {order.orderType === 'DELIVERY_WITH_INSTALLATION' ? '설치배송' : '일반배송'}
                        </span>
                    )}
                </div>

                <div className="driver-card-body">
            {/* 1. 주문자 이름 */}
            <p className="driver-order-name">
                <strong>주문자:</strong> {order.memberName || '비회원'}
            </p>

            {/* 📞 2. 주문자 연락처 (콘솔 추적 기능 및 매핑 방어 적용) */}
                                            <p className="driver-order-phone">
    <strong>연락처:</strong> <DriverPhoneCell memberId={order.memberId} />
</p>

            {/* 3. 상품명 정보 */}
            <p className="driver-order-items">
                <strong>상품명:</strong> {itemDisplay}
            </p>
            
            {/* 4. 배송지 주소 */}
            <p className="driver-order-addr">
                <strong>주소:</strong> {order.deliveryAddr} {order.deliveryAddrDetail || ''}
            </p>
        </div>
            </div>
        );
    })}
</div>
                        <div className="driver-btn-group">
                            <button className="driver-btn" onClick={handleAccept}>선택 주문 수락</button>
                            <button className="driver-btn driver-btn-danger" onClick={handleReject}>선택 주문 거절</button>
                        </div>
                    </>
                )}

                {/* 2. 수락 리스트 섹션 (정갈한 로우 스타일 적용) */}
                <h2 className="driver-headline">📦 수락된 주문 (상차 및 출발 대기)</h2>
                {acceptedOrders.length === 0 ? (
                    <p className="driver-empty-msg">수락 후 상차 대기 중인 주문이 없습니다.</p>
                ) : (
                    <div style={{marginBottom: '20px'}}>
                        {acceptedOrders.map(order => (
                            <div key={order.orderId} className="driver-list-row">
                                <span className="driver-order-id" style={{fontSize: '14px'}}>주문번호: {order.orderId}</span>
                                <span className="driver-order-addr" style={{margin: 0, minHeight: 'auto'}}>{order.deliveryAddr}</span>
                            </div>
                        ))}
                        <div style={{marginTop: '20px'}}>
                            <button className="driver-btn-primary" onClick={handleStartDelivery}>
                                🚚 선택 목록 일괄 배송 출발 (상차 완료 확인)
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. 배송 중 리스트 섹션 (4열 Grid 스타일 적용) */}
                <h2 className="driver-headline">🚚 배달중 (현재 실시간 배송 진행)</h2>
                {shippingOrders.length === 0 ? (
                    <p className="driver-empty-msg">현재 진행 중인 배송 임무가 없습니다.</p>
                ) : (
                    <>
                        <div className="driver-order-grid">
                            {shippingOrders.map(order => {
                                const isChecked = shippingCheckeds.includes(order.orderId);
                                return (
                                    <div key={order.orderId} className={`driver-order-card ${isChecked ? 'checked' : ''}`}>
                                        <div className="driver-card-header">
                                            <input
                                                type="checkbox"
                                                className="driver-checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleShippingSelect(order.orderId)}
                                            />
                                            <span className="driver-order-id">NO. {order.orderId}</span>
                                        </div>
                                        <p className="driver-order-addr">{order.deliveryAddr}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="driver-btn-primary" style={{backgroundColor: '#1A1A1A'}} onClick={handlecomplete}>
                            ✅ 선택 주문 배송 완료 처리
                        </button>
                    </>
                )}

                {/* 🔄 4. 회수 목록 섹션 추가 (조건: PICKUP 상태 && EXCHANGE 또는 CANCEL) */}
                <h2 className="driver-headline" style={{ marginTop: '40px' }}>🔄 회수 (교환 및 반품 수거 목록)</h2>
                {pickupOrders.length === 0 ? (
                    <p className="driver-empty-msg">현재 예정된 교환/반품 회수 건이 없습니다.</p>
                ) : (
                    <>
                        <div className="driver-order-grid">
                            {pickupOrders.map(order => {
                                const isChecked = pickupCheckeds.includes(order.orderId);
                                return (
                                    <div key={order.orderId} className={`driver-order-card ${isChecked ? 'checked' : ''}`}>
                                        <div className="driver-card-header" style={{ backgroundColor: '#fff3cd' }}>
                                            <input
                                                type="checkbox"
                                                className="driver-checkbox"
                                                checked={isChecked}
                                                onChange={() => togglePickupSelect(order.orderId)}
                                            />
                                            <span className="driver-order-id" style={{ color: '#856404' }}>NO. {order.orderId}</span>
                                            <span className="driver-badge" style={{ backgroundColor: '#dc3545', color: '#fff' }}>
                                                {order.orderState === 'EXCHANGE' ? '교환회수' : '반품회수'}
                                            </span>
                                        </div>
                                        <div className="driver-card-body">
                                            <p className="driver-order-name"><strong>요청자:</strong> {order.memberName || '비회원'}</p>
                                            <p className="driver-order-phone"><strong>연락처:</strong> <DriverPhoneCell memberId={order.memberId} /></p>
                                            <p className="driver-order-addr"><strong>회수지:</strong> {order.deliveryAddr} {order.deliveryAddrDetail || ''}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="driver-btn-primary" onClick={handlePickupComplete}>
                            🔄 선택 주문 회수 완료 처리
                        </button>
                    </>
                )}

                {/* 다음 배송 받기 대기 전환 상태 구역 */}
                {shippingOrders.length === 0 && acceptedOrders.length === 0 && (
                    <div className="driver-reset-box">
                        <p>
                            💡 완료되지 않은 진행 중 배송 임무가 없습니다. 다음 업무를 인계받으시겠습니까?
                        </p>
                        <button className="driver-btn-success" onClick={handleResetToWaiting}>
                            🔄 다음 배송 받기 (대기 상태 전환)
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DriverPage;