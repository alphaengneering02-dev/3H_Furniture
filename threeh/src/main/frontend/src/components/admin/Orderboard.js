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

    return (
        <div>

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
                            .filter(order => order.deliveryId)
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
                                        {order.orderSate === 'SHIPPING' ? '배송중' : order.orderSate}
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
                        {orders
                            .filter(order => !order.deliveryId)
                            .map((order, index) => (
                                <tr key={order.orderId}>
                                    <td>{index + 1}</td>
                                    <td>{renderItemName(order.orderitems)}</td>
                                    <td>
                                        {order.orderitems.reduce((sum, item) => sum + item.count, 0)}개
                                    </td>
                                    <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                    <td>
                                        <select
                                            value={selectedDrivers[order.orderId] || ""}
                                            onChange={(e) =>
                                                handleDriverSelect(order.orderId, e.target.value)
                                            }
                                        >
                                            <option value="">기사 선택</option>
                                            {items
                                                .filter(d => d.status === 'WAITING')
                                                .map(driver => (
                                                    <option
                                                        key={driver.deliveryId}
                                                        value={driver.deliveryId}
                                                    >
                                                        {driver.deliveryName}
                                                    </option>
                                                ))}
                                        </select>

                                        <button
                                            onClick={() => handleAssignDriver(order.orderId)}
                                        >
                                            배정하기
                                        </button>
                                    </td>
                                    <td>{order.orderDate?.split('T')[0]}</td>
                                </tr>
                            ))}
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
                            {orders.map((order, index) => (
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
                                       상품배송완료(COMPLETED)
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