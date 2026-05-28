import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
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
        
        // 1. 신규 배정
        const newOrders = dbOrders.filter(o => 
            (!o.deliveryStatus || o.deliveryStatus === 'WAITING') && o.orderState !== 'CANCEL'
        );
        
        // 2. 수락된 주문
        const accepted = dbOrders.filter(o => 
            o.deliveryStatus === 'ACCEPTED' && o.orderState !== 'CANCEL'
        );

        // 3. 배송중 필터링
        const shipping = dbOrders.filter(o => 
            o.deliveryStatus === 'SHIPPING' && o.orderState !== 'CANCEL'
        );

        // 4. 교환/반품 필터링
        const pickups = dbOrders.filter(o => 
            o.deliveryStatus === 'PICKUP' && (o.orderState === 'EXCHANGEorREFUND' || o.orderState === 'CANCEL')
        );

        setOrders(newOrders);
        setAcceptedOrders(accepted); 
        setShippingOrders(shipping);
        setPickupOrders(pickups);

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

                if (/[a-zA-Z]/.test(phone) || !phone) {
                    return setDisplayValue(email ? email : '연락처 없음');
                }

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

    // 로그인 핸들러
const handleLogin = async () => {
    try {
        const res = await axios.post('/admin/driver/login', loginInfo);
        
        setDriver(res.data);
        setIsLoggedIn(true);
        localStorage.setItem('driverInfo', JSON.stringify(res.data)); 

        await fetchDriverOrders(res.data.deliveryId);

    } catch (err) {
        console.error(err);
        toast.error("로그인 실패");
    }
};

    //로그아웃
    const handleLogout = () => {
        localStorage.removeItem('driverInfo');
        
        setDriver(null);
        setIsLoggedIn(false);
        setLoginInfo({ phone: '', carSuffix: '' });

        setOrders([]);
        setSelectedOrders([]);
        setAcceptedOrders([]);
        setShippingOrders([]);
        setShippingCheckeds([]);
        setPickupOrders([]);
        setPickupCheckeds([]);

        toast.error("로그아웃 되었습니다.");
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
            toast.error("수락 실패");
        }
    };

    // 선택 거절
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

            fetchDriverOrders(driver.deliveryId);
            setSelectedOrders([]);
            toast.error("선택한 주문을 거절했습니다. (어드민 미배정으로 복구)");

        } catch (err) {
            toast.error("거절 실패");
        }
    };

    // 배송 시작
    const handleStartDelivery = async () => {
    try {
        if (orders.length > 0) {
            const rejectConfirm = window.confirm("수락하지 않은 신규 배정 주문들이 있습니다. 모두 거절 처리하고 배송을 출발하시겠습니까?");
            
            if (rejectConfirm) {
                await Promise.all(
                    orders.map(o =>
                        axios.patch(`/admin/driver/orders/${o.orderId}/response`, {
                            action: 'REJECT'
                        })
                    )
                );
            }
        }

        await Promise.all(
            acceptedOrders.map(o =>
                axios.post(`/admin/orders/${o.orderId}/start`) 
            )
        );

        toast.error("배송 출발 처리가 완료되었습니다!");

        if (driver && driver.deliveryId) {
            await fetchDriverOrders(driver.deliveryId);
        }
        setAcceptedOrders([]);
        setSelectedOrders([]); 

    } catch (err) {
        console.error("배송 출발 처리 중 에러 발생:", err);
        toast.error("배송 출발 처리 중 오류가 발생했습니다.");
    }
};


// 대기 상태 전환
const handleResetToWaiting = async () => {
    try {
        await axios.put(`/admin/driver/${driver.deliveryId}/reset-status`);
        
        setAcceptedOrders([]);    
        setShippingOrders([]);    
        setShippingCheckeds([]);
        setPickupOrders([]);
        setPickupCheckeds([]);
        
        toast.error("대기 상태로 전환되었습니다. 새로운 배정을 받을 수 있습니다!");
        
        if (typeof fetchDriverOrders === 'function') {
            fetchDriverOrders(driver.deliveryId);
        }
    } catch (err) {
        console.error(err);
        toast.error("대기 전환 실패: 서버 에러가 발생했습니다.");
    }
};

    // 선택 배송 완료 
    const handlecomplete = async () => {
        if (shippingCheckeds.length === 0) {
            toast.error("완료 처리할 주문을 선택해 주세요.");
            return;
        }

        try {
            await Promise.all(
                shippingCheckeds.map(id =>
                    axios.post(`/admin/orders/${id}/complete`)
                )
            );

            setShippingOrders(prev => 
                prev.filter(o => !shippingCheckeds.includes(o.orderId))
            );
        
            setShippingCheckeds([]);
            toast.error("선택하신 주문의 배송 완료 처리가 되었습니다.");

        } catch (err) {
            toast.error("배송 완료 처리 실패");
        }
    };

    const handlePickupComplete = async () => {
        if (pickupCheckeds.length === 0) {
            toast.error("회수 완료 처리할 주문을 선택해 주세요.");
            return;
        }

        try {
            await Promise.all(
                pickupCheckeds.map(id =>
                    axios.post(`/admin/orders/${id}/complete`) 
                )
            );

            setPickupOrders(prev => 
                prev.filter(o => !pickupCheckeds.includes(o.orderId))
            );

            setPickupCheckeds([]);
            toast.error("선택하신 주문의 회수(물건 수거) 완료 처리가 되었습니다.");

        } catch (err) {
            toast.error("회수 완료 처리 실패");
        }
    };

    // 1️⃣ 로그인 전 화면 (비로그인 상태)
    // 1️⃣ 비로그인 상태 화면
    if (!isLoggedIn) {
        return (
            <div className="driver-body-wrapper">
                <ToastContainer position="top-right" autoClose={2000} />
                <div className="driver-login-section"> 
                    <h2 className="driver-login-title">기사 로그인</h2>
                    <input className="driver-login-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={11}
                        placeholder="전화번호(01000000000)"
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
                        placeholder="차량번호 뒤 4자리"
                        value={loginInfo.carSuffix}
                        onChange={e => {
                            const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                            setLoginInfo({ ...loginInfo, carSuffix: onlyNums });
                        }} 
                    />
                    <div className="driver-login-btn-row">
                    <button className="driver-btn driver-btn-primary driver-login-submit" onClick={handleLogin}>
                        로그인
                    </button>
                    <Link to="/admin" className="driver-link-flex">
                        <button className="driver-btn driver-btn-gray driver-login-admin">
                            관리자 메인 페이지
                        </button>
                    </Link>
                </div>
                </div>
            </div> 
        );
    }

    // 2️⃣ 로그인 완료 후 화면
    return (
        <div className="driver-body-wrapper">
            <ToastContainer position="top-right" autoClose={2000} />
            
            {/* 기사 상단 헤더 정보 바 */}
            <div className="driver-top-info-bar">
                <div className="driver-top-info-list">
                    <p className="driver-info-text">
                        배송 파트너: <strong>{driver.deliveryName}</strong> 기사님 ({driver.deliveryCarNo})
                    </p>
                    <div className="driver-top-btn-group">
                        <Link to="/admin">
                            <button className="driver-btn driver-btn-gray-sm">
                                관리자 메인
                            </button>
                        </Link>
                        <button className="driver-btn driver-btn-sm" onClick={handleLogout}>
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>

            <div className="driver-container">
                {/* 1. 신규 배정 섹션 */}
                <h2 className="driver-headline">📌 신규 배정 (수락 대기 목록)</h2>
                {orders.length === 0 ? (
                    <p className="driver-empty-msg">새로운 배정 요청이 없습니다.</p>
                ) : (
                    <>
                        <div className="driver-order-grid">
                            {orders.map(order => {
                                const isChecked = selectedOrders.includes(order.orderId);
                                const currentItems = order.orderitems || order.orderItems || [];
                                let itemDisplay = "상품 정보 없음";
                                
                                if (currentItems && currentItems.length > 0) {
                                    const firstItemName = currentItems[0].itemName || currentItems[0].ItemName || "이름 없는 상품";
                                    const firstItemCount = currentItems[0].count || 0;

                                    if (currentItems.length === 1) {
                                        itemDisplay = `${firstItemName} (${firstItemCount}개)`;
                                    } else {
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
                                            <p className="driver-order-name"><strong>주문자:</strong> {order.memberName || '비회원'}</p>
                                            <p className="driver-order-phone"><strong>연락처:</strong> <DriverPhoneCell memberId={order.memberId} /></p>
                                            <p className="driver-order-items"><strong>상품명:</strong> {itemDisplay}</p>
                                            <p className="driver-order-addr"><strong>주소:</strong> {order.deliveryAddr} {order.deliveryAddrDetail || ''}</p>
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

                {/* 2. 수락 리스트 섹션 */}
                <h2 className="driver-headline">📦 수락된 주문 (상차 및 출발 대기)</h2>
                {acceptedOrders.length === 0 ? (
                    <p className="driver-empty-msg">수락 후 상차 대기 중인 주문이 없습니다.</p>
                ) : (
                    <div className="driver-accepted-wrapper">
                        {acceptedOrders.map(order => (
                            <div key={order.orderId} className="driver-list-row">
                                <span className="driver-row-id">주문번호: {order.orderId}</span>
                                <span className="driver-row-addr">{order.deliveryAddr}</span>
                            </div>
                        ))}
                        <div className="driver-action-area">
                            <button className="driver-btn-primary" onClick={handleStartDelivery}>
                                🚚 선택 목록 일괄 배송 출발 (상차 완료 확인)
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. 배송 중 리스트 섹션 */}
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
                                        <div className="driver-card-body">
                                            <p className="driver-order-addr-only">{order.deliveryAddr}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="driver-btn-primary driver-btn-dark-complete" onClick={handlecomplete}>
                            ✅ 선택 주문 배송 완료 처리
                        </button>
                    </>
                )}

                {/* 4. 회수 목록 섹션 */}
                <h2 className="driver-headline driver-headline-pickup">🔄 회수 (교환 및 반품 수거 목록)</h2>
                {pickupOrders.length === 0 ? (
                    <p className="driver-empty-msg">현재 예정된 교환/반품 회수 건이 없습니다.</p>
                ) : (
                    <>
                        <div className="driver-order-grid">
                            {pickupOrders.map(order => {
                                const isChecked = pickupCheckeds.includes(order.orderId);
                                return (
                                    <div key={order.orderId} className={`driver-order-card ${isChecked ? 'checked' : ''}`}>
                                        <div className="driver-card-header driver-header-pickup">
                                            <input
                                                type="checkbox"
                                                className="driver-checkbox"
                                                checked={isChecked}
                                                onChange={() => togglePickupSelect(order.orderId)}
                                            />
                                            <span className="driver-order-id driver-id-pickup">NO. {order.orderId}</span>
                                            <span className="driver-badge driver-badge-pickup">
                                                {order.orderState === 'EXCHANGEorREFUND' ? '교환회수' : '반품회수'}
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
                        <p className="driver-reset-text">💡 완료되지 않은 진행 중 배송 임무가 없습니다. 다음 업무를 인계받으시겠습니까?</p>
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