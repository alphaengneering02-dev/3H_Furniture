import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDriverAuto } from './DriverAuto';

const getOrderStateStyle = (orderState, deliveryStatus) => {

    // 배송 상태가 WAITING이면 READY 색 제거하고 WAITING 우선
    if (deliveryStatus === 'WAITING') {
        return {
            color: '#7B1FA2',
            fontWeight: 'bold'
        };
    }

    switch(orderState) {
        case 'ORDER':
        case '주문':
            return { color: '#1976D2', fontWeight: 'bold' };
        case 'READY':
        case '배송 준비중':
            return { color: '#F57C00', fontWeight: 'bold' };
        case 'PURCHASED':
            return { color: '#2E7D32', fontWeight: 'bold' };
        case 'EXCHANGEorREFUND':
            return { color: '#E65100', fontWeight: 'bold' };
        case 'CANCEL':
            return { color: '#C62828', fontWeight: 'bold' };
        default:
            return { color: '#555' };
    }
};

const getDeliveryStatusStyle = (status) => {
    switch(status) {
        case 'WAITING':
            return { color: '#7B1FA2', fontWeight: 'bold' };
        case 'SHIPPING':
            return { color: '#009688', fontWeight: 'bold' };
        case 'COMPLETED':
            return { color: '#616161', fontWeight: 'bold' };
        case 'REJECTED':
            return { color: '#D32F2F', fontWeight: 'bold' };
        case 'PICKUP':
            return { color: '#E040FB', fontWeight: 'bold' };
        default:
            return { color: '#777' };
    }
};

const MemberNameCell = ({ memberName }) => {
    const displayName = memberName ? memberName : '비회원';  
    return <span>{displayName}</span>;
};

const OrderMemberInfoCell = ({ memberId, type }) => {
    const [info, setInfo] = useState({ phone: '조회 중...', email: '조회 중...' });

    useEffect(() => {
        if (!memberId) {
            setInfo({ phone: '비회원', email: '비회원' });
            return;
        }
        
        axios.get(`/api/member/seq/${memberId}`, { withCredentials: true })
            .then(res => {
                const rawEmail = res.data?.email || '';
                const rawPhone = res.data?.phone || '번호 없음';

                if (rawEmail.includes('kakao')) {
                    
                    setInfo({
                        phone: 'kakao',
                        email: 'kakao'
                    });
                } else {
                    // 일반 유저라면 기존 데이터 그대로 세팅
                    setInfo({
                        phone: rawPhone,
                        email: rawEmail || '이메일 없음'
                    });
                }
            })
            .catch((err) => {
                console.error(`${memberId}번 회원 조회 실패:`, err.response || err);
                setInfo({ phone: '확인 불가', email: '확인 불가' });
            });
    }, [memberId]);

    return <span>{type === 'email' ? info.email : info.phone}</span>;
};

const Orderboard = ({
    orders = [],
    items = [],
    selectedDrivers = {},
    handleDriverSelect,
    handleAssignDriver,
    handleStatusChange
}) => {


    const [selectedOrderIds, setSelectedOrderIds] = useState([]);


    const { handleAutoAssign } = useDriverAuto({
        orders,
        items,
        selectedOrderIds,
        setSelectedOrderIds,
        handleDriverSelect,
        handleAssignDriver
    });


    const renderItemName = (items) => {
        if (!items || items.length === 0) return '';

        const firstName = items[0].itemName;
        const extraCount = items.length - 1;

        return extraCount > 0
            ? `${firstName} 외 ${extraCount}개 상품`
            : firstName;
    };

        // 1. 주문 목록: 주문 취소나 구매 완료가 되지않은 모든 주문 목록
    const masterOrders = orders.filter(o => o.orderState === '주문' || o.orderState === 'ORDER');
    const selectableOrders = masterOrders.filter(o => o.deliveryStatus !== 'COMPLETED');

    // 2. 배송 미배정: 관리자가 'READY'로 바꿨지만, 아직 기사를 안 붙인 주문
   const unassignedOrders = orders.filter(o => {   
    const isReady = o.orderState === 'READY' || o.orderState === '배송 준비중';
    
    // 핵심: deliveryId가 아예 없거나, 
    // 기사 ID는 들어가있지만 아직 수락을 안 해서 deliveryStatus가 null인 경우 둘 다 미배정 탭에 노출!
    const isUnassignedOrRejected = 
        !o.deliveryId || 
        o.deliveryStatus === null || 
        o.deliveryStatus === 'REJECTED'; 
    
    return isReady && isUnassignedOrRejected;
});

        //리로드 넣고 수정
        // const orderRes = await axios.get(`/admin/driver/${res.data.deliveryId}/orders`);
        //     const dbOrders = orderRes.data;
            
        //     setOrders(dbOrders.filter(o => o.deliveryStatus === 'WAITING'));
        //     setShippingOrders(dbOrders.filter(o => o.deliveryStatus === 'SHIPPING'));
 

    // 3. 배송 배정 완료 목록: 기사가 배정되어 있고 배송 상태가 정확히 'WAITING'인 건
    const assignedOrders = orders.filter(o => o.deliveryId && o.deliveryStatus === 'WAITING');

    // 4. 배송 진행 중 목록: 배송 상태가 'SHIPPING'인 건
    const shippingOrders = orders.filter(o => o.deliveryStatus === 'SHIPPING');

    // 5. 최종 배송 완료 목록: 배송 상태가 'COMPLETED'인 건
    const completedOrders = orders.filter(o => o.deliveryStatus === 'COMPLETED');

const renderOrderType = (type) => {
        if (type === 'DELIVERY_WITH_INSTALLATION') return '*설치 배송*';
        if (type === 'DELIVERY_ONLY') return '*일반 배송*';
        return type || '-';
    };

const renderDeliveryStatus = (status) => {
        if (status === 'WAITING') return '배송 대기 (WAITING)';
        if (status === 'SHIPPING') return '배송중 (SHIPPING)';
        if (status === 'COMPLETED') return '배송 완료 (COMPLETED)';
        if (status === 'REJECTED') return '배송 거절 (REJECTED)';
        if (status === 'PICKUP') return '회수/픽업 (PICKUP)';
        return status || '-';
    };

// 개별 체크박스 변경 핸들러
    const handleCheckOrder = (orderId) => {
        setSelectedOrderIds(prev => 
            prev.includes(orderId) 
                ? prev.filter(id => id !== orderId) 
                : [...prev, orderId]
        );
    };

    // ✨ 전체 선택/해제 핸들러 수정 (ORDER 상태인 주문만 선택되도록 제한)
    const handleAllCheck = (e) => {
    if (e.target.checked) {
        const activeIds = selectableOrders.map(o => o.orderId);
        setSelectedOrderIds(activeIds);
    } else {
        setSelectedOrderIds([]);
    }
};

    // 선택된 주문들을 일괄 'READY'로 변경하는 핸들러
    const handleBulkReady = () => {
        if (selectedOrderIds.length === 0) {
            alert('변경할 주문을 선택해주세요.');
            return;
        }

        if (window.confirm(`선택한 ${selectedOrderIds.length}건의 주문을 '상품준비완료(READY)' 상태로 변경하시겠습니까?`)) {
            selectedOrderIds.forEach(orderId => {
                handleStatusChange(orderId, 'READY');
            });
            setSelectedOrderIds([]);
        }
    };


    return (
        <div>

            {/* 주문 목록 */}
                <div className="content-box">

                    <h3>주문 목록 (전체 접수 건)</h3>
                {/* 💡 일괄 변경 버튼 추가 */}
                <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                    <button 
                        onClick={handleBulkReady}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        선택 상품 준비 완료 처리 ({selectedOrderIds.length}건)
                    </button>
                </div>
                <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                    <button 
                        onClick={handleAutoAssign}
                    >
                        선택 상품 자동 배정 ({selectedOrderIds.length}건)
                    </button>
                </div>

                <table className="table-style">
                    <thead>
                        <tr>
                            <th>
                                <input 
                                type="checkbox" 
                                onChange={handleAllCheck}
                                checked={selectableOrders.length > 0 && selectableOrders.every(o => selectedOrderIds.includes(o.orderId))
                                }/>
                            </th>
                            <th>주문 번호</th>
                            <th>주문자</th>
                            <th>연락처</th>
                            <th>E-mail</th>
                            <th>상품</th>
                            <th>수량</th>                            
                            <th>주문 타입</th>
                            <th>주소</th>
                            <th>주문 상태</th>
                            <th>배송 상태</th>
                            <th>주문일/</th>
                            <th>배송 신청일</th>
                        </tr>
                    </thead>
                    <tbody>
    {orders.map((order, index) => {
        
        const exactMemberId = order.MEMBER_ID || order.memberId || order.member_id;

        return (
            <tr key={order.orderId || order.ORDER_ID}>
                <td>
                    <input 
                        type="checkbox" 
                        checked={selectedOrderIds.includes(order.orderId || order.ORDER_ID)}
                        onChange={() => handleCheckOrder(order.orderId || order.ORDER_ID)}
                    />
                </td>
                <td>{order.orderId}</td>

                <td>
                    <strong>
                        <MemberNameCell memberName={order.memberName || order.MEMBER_NAME} />
                    </strong>
                </td>

                <td>
                    <OrderMemberInfoCell memberId={exactMemberId} type="phone" />
                </td>
                <td>
                    <OrderMemberInfoCell memberId={exactMemberId} type="email" />
                </td>

                <td>{renderItemName(order.orderitems || order.orderItems || order.ORDERITEMS)}</td>
                <td>
                    {(order.orderitems || order.orderItems || order.ORDERITEMS)?.reduce((sum, item) => sum + (item.count || item.COUNT || 0), 0) || 0}개
                </td>
                <td>{renderOrderType(order.orderType || order.ORDER_TYPE)}</td>
                <td>{order.deliveryAddr || order.DELIVERY_ADDR} {order.deliveryAddrDetail || order.DELIVERY_ADDR_DETAIL}</td>
                <td>
                    <span style={getOrderStateStyle(order.orderState || order.ORDER_STATE, order.deliveryStatus || order.DELIVERY_STATUS)}>
                        {order.orderState || order.ORDER_STATE}
                    </span>
                </td>
                <td>
                    <span style={getDeliveryStatusStyle(order.deliveryStatus || order.DELIVERY_STATUS)}>
                        {renderDeliveryStatus(order.deliveryStatus || order.DELIVERY_STATUS)}
                    </span>
                </td>
                <td>{(order.orderDate || order.ORDER_DATE)?.split('T')[0]}/</td>
                <td>{order.installDate}</td>
            </tr>
        );
    })}
</tbody>
                </table>
            </div>

            {/* 배송 배정 완료 */}
            <div>
                <h3>배송 배정 완료 목록</h3>

                <table className="table-style">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>상품</th>
                            <th>주소</th>
                            <th>배정된 기사</th>
                            <th>상태</th>
                            <th>주문일</th>
                        </tr>
                    </thead>

                    <tbody>
                       {orders
                .filter(order => order.deliveryId && order.deliveryStatus === 'WAITING')
                .map((order, index) => (
                    <tr key={order.orderId}>
                        <td>{index + 1}</td>
                        <td>{renderItemName(order.orderitems)}</td>
                        <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                        <td>
                            <strong>
                                {items.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName || "지정 기사"}
                            </strong>
                        </td>
                        <td>
                            <span style={{ color: 'blue', fontWeight: 'bold' }}>배송 대기중 (수락 확인)</span>
                        </td>
                        <td>{order.orderDate?.split('T')[0]}</td>
                    </tr>
                ))}
            {orders.filter(order => order.deliveryId && order.deliveryStatus === 'WAITING').length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>배정 완료된 주문이 없습니다.</td></tr>
            )}
        </tbody>
                </table>
            </div>

            {/* 배송 미배정 */}
            <div>
                <h3>배송 미배정</h3>
                <table className="table-style">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>상품</th>
                            <th>수량</th>
                            <th>주소</th>
                            <th>기사 배정 및 상태</th>
                            <th>주문일</th>
                        </tr>
                    </thead>
                    <tbody>
                       {unassignedOrders.length > 0 ? unassignedOrders.map((order, index) => {
    const currentItems = order.orderitems || order.orderItems || [];
                            return (
                                <tr key={order.orderId}>
            <td>{index + 1}</td>
            <td>{renderItemName(currentItems)}</td>
            {/* 수량 계산 시 안전하게 구문 작성 */}
            <td>{Array.isArray(currentItems) ? currentItems.reduce((sum, i) => sum + (i.count || 0), 0) : 0}개</td>
            <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
            <td>
                {/* 기사는 지정되었으나 아직 기사가 수락/거절을 안 한 상태 (!deliveryStatus 또는 'WAITING'인데 아직 수락 전인지 확인 필요) */}
                {order.deliveryId && (!order.deliveryStatus || order.deliveryStatus === 'WAITING_FOR_ACCEPT') ? (
                    <div>
                        <strong>{items.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName} 기사님 </strong>
                        <span style={{ color: 'darkorange', fontWeight: 'bold', marginLeft: '5px' }}>
                            배송 대기중 (수락 대기중)
                        </span>
                    </div>
                ) : (
                    <>
                        <select
                            value={selectedDrivers[order.orderId] || ""}
                            onChange={(e) => handleDriverSelect(order.orderId, e.target.value)}
                        >
                            <option value="">기사 선택</option>
                            {items.map(driver => (
                                <option key={driver.deliveryId} value={driver.deliveryId}>
                                    {driver.deliveryName}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => handleAssignDriver(order.orderId)} style={{ marginLeft: '5px' }}>
                            {order.deliveryStatus === 'REJECTED' ? '재배정' : '배정'}
                        </button>
                        {order.deliveryStatus === 'REJECTED' && (
                            <span style={{ color: 'red', marginLeft: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                                (기사가 거절한 주문입니다)
                            </span>
                        )}
                    </>
                )}
            </td>
            <td>{order.orderDate?.split('T')[0]}</td>
        </tr>
    );
}) : (
    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>배정할 주문이 없습니다.</td></tr>
)}
                    </tbody>
                </table>
            </div>
             {/* 배송 완료 status(COMPLETED)*/}
                <div>
                    <h3>🚚 배송 진행 중 목록</h3>
                <table className="table-style" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>상품</th>
                            <th>수량</th>
                            <th>주소</th>
                            <th>배정 기사</th>
                            <th>상태</th>
                            <th>주문일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders
                            .filter(order => order.deliveryStatus === 'SHIPPING')
                            .map((order, index) => (
                                <tr key={order.orderId}>
                                    <td>{index + 1}</td>
                                    <td>{renderItemName(order.orderitems)}</td>
                                    <td>
                                        {order.orderitems?.reduce((sum, item) => sum + item.count, 0) || 0}개
                                    </td>
                                    <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                    <td>
                                        <strong>
                                            {items.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName || "배정 기사"}
                                        </strong>
                                    </td>
                                    <td>
                                        <span style={{ color: 'orange', fontWeight: 'bold' }}>배송중</span>
                                    </td>
                                    <td>{order.orderDate?.split('T')[0]}</td>
                                </tr>
                            ))}
                        {orders.filter(order => order.deliveryStatus === 'SHIPPING').length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
                                    현재 도로 위에서 배송 중인 주문이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 4. ✅ 배송 완료 목록 (COMPLETED) */}
            <div className="content-box" style={{ marginTop: '20px' }}>
                <h3>✅ 최종 배송 완료 목록</h3>
                <table className="table-style" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>상품</th>
                            <th>수량</th>
                            <th>주소</th>
                            <th>담당 기사</th>
                            <th>상태</th>
                            <th>주문일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders
                            .filter(order => order.deliveryStatus === 'COMPLETED')
                            .map((order, index) => (
                                <tr key={order.orderId}>
                                    <td>{index + 1}</td>
                                    <td>{renderItemName(order.orderitems)}</td>
                                    <td>
                                        {order.orderitems?.reduce((sum, item) => sum + item.count, 0) || 0}개
                                    </td>
                                    <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                    <td>
                                        <span style={{ color: '#555' }}>
                                            {items.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName || "담당 기사"}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ color: 'green', fontWeight: 'bold' }}>배송완료</span>
                                    </td>
                                    <td>{order.orderDate?.split('T')[0]}</td>
                                </tr>
                            ))}
                        {orders.filter(order => order.deliveryStatus === 'COMPLETED').length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
                                    완료된 배송 내역이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
    </table>
                </div>

        </div>
    );
};

export default Orderboard;