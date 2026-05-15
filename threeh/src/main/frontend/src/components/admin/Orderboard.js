import React from 'react';

const Orderboard = ({
    orders = [],
    items = [],
    selectedDrivers = {},
    handleDriverSelect,
    handleAssignDriver,
    handleStatusChange
}) => {

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
   const unassignedOrders = orders.filter(o => 
        (o.orderState === '배송 준비중' || o.orderState === 'READY') && 
        (!o.deliveryId || Number(o.deliveryId) === 0)
    );
    // 3. 배송 배정 완료: 'READY' 상태이면서 기사가 배정된 주문
    const assignedOrders = orders.filter(o => 
    o.orderState === 'READY' && o.deliveryId > 0
);
    // 4. 배송 완료: 최종 구매완료/배송완료
    const completedOrders = orders.filter(o => o.orderState === 'PURCHASED');

    return (
        <div>

            {/* 주문 목록 */}
                <div className="content-box">

                    <h3>주문 목록</h3>

                    <table className="table-style">

                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>상품</th>
                                <th>수량</th>
                                <th>주소</th>
                                <th>상태 변경</th>
                                <th>상태</th>
                                <th>주문일</th>
                            </tr>
                        </thead>

                        <tbody>

                            {orders.map((order, index) => (

                                <tr key={order.orderId}>

                                    <td>{index + 1}</td>

                                    <td>
                                        {renderItemName(order.orderitems)}
                                    </td>

                                    <td>
                                        {
                                            order.orderitems.reduce(
                                                (sum, item) =>
                                                    sum + item.count,
                                                0
                                            )
                                        }개
                                    </td>

                                    <td>
                                        {order.deliveryAddr}
                                        {' '}
                                        {order.deliveryAddrDetail}
                                    </td>

                                    <td>
                                        <select
    value={order.orderState === '주문' ? 'ORDER' : order.orderState}
    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
>
                                    <option value="ORDER">결제완료(order)주문</option>
                                    <option value="READY">상품준비완료(ready)배송준비중</option>
                                            </select>
                                    </td>
                                    <td>
                                        {order.orderState}
                                    </td>

                                    <td>
                                        {order.orderDate?.split('T')[0]}
                                    </td>

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
    .filter(order => order.deliveryStatus === 'WAITING' || order.deliveryStatus === 'SHIPPING' || order.deliveryStatus === 'COMPLETED')
    .map((order, index) => (
                                <tr key={order.orderId}>
                                    <td>{index + 1}</td>
                                    <td>{renderItemName(order.orderitems)}</td>
                                    <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                    <td>
                                        <strong>
                                            {items.find(d => d.deliveryId === order.deliveryId)?.deliveryName || "정보 없음"}
                                        </strong>
                                    </td>
                                    <td>
                                        {order.deliveryStatus === 'WAITING' && '배정됨'}
                                    </td>
                                    <td>{order.orderDate?.split('T')[0]}</td>
                                </tr>
                            ))}
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
                            <th>기사 배정</th>
                            <th>주문일</th>
                        </tr>
                    </thead>

                    <tbody>
                        {unassignedOrders.length > 0 ? unassignedOrders.map((order, index) => (
                            <tr key={order.orderId}>
                                   <td>{index + 1}</td>
                                <td>{renderItemName(order.orderitems)}</td>
                                <td>{order.orderitems?.reduce((sum, i) => sum + i.count, 0)}개</td>
                                <td>{order.deliveryAddr}</td>
                                <td>
                                    <select
                                        value={selectedDrivers[order.orderId] || ""}
                                        onChange={(e) => handleDriverSelect(order.orderId, e.target.value)}
                                    >
                                        <option value="">기사 선택</option>
                                        {items.filter(d => d.status === 'WAITING' || d.status === 'READY').map(driver => (
                                            <option key={driver.deliveryId} value={driver.deliveryId}>
                                                {driver.deliveryName}
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={() => handleAssignDriver(order.orderId)}>배정</button>
                                </td>
                                <td>{order.orderDate?.split('T')[0]}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>배정할 주문이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

             {/* 배송 완료 status(COMPLETED)*/}
                <div>
                    <h3>
                        배송 완료 
                        <button size="small">
                            배송 업체 관리
                        </button>
                    </h3>

                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>상품</th>
                                <th>수량</th>
                                <th>주소</th>
                                <th>상태</th>
                                <th>주문일</th>
                                <th>배송 신청 날짜</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders
    .filter(order => order.deliveryStatus === 'COMPLETED')
    .map((order, index) => (
                                <tr key={order.orderId}>

                                    <td>
                                        {index + 1}
                                    </td>

                                    <td>
                                        {renderItemName(order.orderitems)}
                                    </td>

                                    <td>
                                        {
                                            order.orderitems.reduce(
                                                (sum, item) =>
                                                    sum + item.count,
                                                0
                                            )
                                        }개
                                    </td>

                                    <td>
                                        {order.deliveryAddr}
                                        {' '}
                                        {order.deliveryAddrDetail}
                                    </td>

                                    <td>
                                       {order.deliveryStatus}
                                    </td>

                                    <td>
                                        {
                                            order.orderDate?.split('T')[0]
                                        }
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

        </div>
    );
};

export default Orderboard;