import React, { useState } from 'react';

const Orderboard = ({
    orders = [],
    items = [],
    selectedDrivers = {},
    handleDriverSelect,
    handleAssignDriver,
    handleStatusChange
}) => {

    const [selectedOrderIds, setSelectedOrderIds] = useState([]);

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
    // 2. 배송 미배정: 관리자가 'READY'로 바꿨지만, 아직 기사를 안 붙인 주문
   const unassignedOrders = orders.filter(o => {  
        const isReady = o.orderState === 'READY' || o.orderState === '배송 준비중';
        const isUnassignedOrRejected = !o.deliveryStatus || o.deliveryStatus === 'REJECTED'; 
        return isReady && isUnassignedOrRejected;
        //리로드 넣고 수정
        // const orderRes = await axios.get(`/admin/driver/${res.data.deliveryId}/orders`);
        //     const dbOrders = orderRes.data;
            
        //     setOrders(dbOrders.filter(o => o.deliveryStatus === 'WAITING'));
        //     setShippingOrders(dbOrders.filter(o => o.deliveryStatus === 'SHIPPING'));
    });

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
        if (status === 'WAITING') return '대기 (WAITING)';
        if (status === 'SHIPPING') return '배송중 (SHIPPING)';
        if (status === 'COMPLETED') return '완료 (COMPLETED)';
        if (status === 'REJECTED') return '거절 (REJECTED)';
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
            // masterOrders(주문/ORDER 상태)의 ID만 추출해서 세팅
            const activeIds = masterOrders.map(o => o.orderId);
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

                <table className="table-style">
                    <thead>
                        <tr>
                            {/* 💡 전체 선택 체크박스 열 추가 */}
                            <th>
                                <input 
                                    type="checkbox" 
                                    onChange={handleAllCheck}
                                    checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                                />
                            </th>
                            <th>번호</th>
                            <th>상품</th>
                            <th>수량</th>
                            <th>주문 타입</th>
                            <th>주소</th>
                            <th>상태 변경</th>
                            <th>주문 상태</th>
                            <th>배송 상태</th>
                            <th>주문일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={order.orderId}>
                                {/* 💡 개별 체크박스 열 추가 */}
                                <td>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedOrderIds.includes(order.orderId)}
                                        onChange={() => handleCheckOrder(order.orderId)}
                                    />
                                </td>
                                <td>{index + 1}</td>
                                <td>{renderItemName(order.orderitems || order.orderItems)}</td>
                                <td>
                                    {(order.orderitems || order.orderItems)?.reduce((sum, item) => sum + (item.count || 0), 0) || 0}개
                                </td>
                                <td>{renderOrderType(order.orderType)}</td>
                                <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                <td>
                                    <select
                                        value={
                                            order.orderState === '주문' || order.orderState === 'ORDER' ? 'ORDER' : 
                                            order.orderState === '배송 준비중' || order.orderState === 'READY' ? 'READY' : 
                                            order.orderState || 'ORDER'
                                        }
                                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                    >
                                        <option value="ORDER">결제완료(ORDER)</option>
                                        <option value="READY">상품준비완료(READY)</option>
                                    </select>
                                </td>
                                <td>{order.orderState}</td>
                                <td>{renderDeliveryStatus(order.deliveryStatus)}</td>
                                <td>{order.orderDate?.split('T')[0]}</td>
                            </tr>
                        ))}
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
                                    <td>{currentItems.reduce((sum, i) => sum + (i.count || 0), 0)}개</td>
                                    <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                    <td>
                                        {/* 요구사항반영: 기사는 지정되었으나 상태가 아직 null일 때 수락대기중 처리 */}
                                        {order.deliveryId && !order.deliveryStatus ? (
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