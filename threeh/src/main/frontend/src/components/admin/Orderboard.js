import React, { useState } from 'react';
import '../../css/adminCss/AdminDashboard.css';

const Orderboard = ({
    orders = [],
    items = [],
    selectedDrivers = {},
    handleDriverSelect,
    handleAssignDriver
}) => {
    /* 각 테이블별 페이지 기본값 */
    const [perPage2, setPerPage2] = useState(5); const [page2, setPage2] = useState(1);
    const [perPage3, setPerPage3] = useState(5); const [page3, setPage3] = useState(1);
    const [perPage4, setPerPage4] = useState(5); const [page4, setPage4] = useState(1);
    const [perPage5, setPerPage5] = useState(5); const [page5, setPage5] = useState(1);
    const [perPage6, setPerPage6] = useState(5); const [page6, setPage6] = useState(1);

    const renderItemName = (itemsList) => {
        if (!itemsList || itemsList.length === 0) return '';
        const firstName = itemsList[0].itemName;
        const extraCount = itemsList.length - 1;
        return extraCount > 0 ? `${firstName} 외 ${extraCount}개 상품` : firstName;
    };

    // 배송 프로세스별 필터링 정의
    const assignedOrders = orders.filter(o => o.deliveryId && o.deliveryStatus === 'WAITING');
    const unassignedOrders = orders.filter(o => {   
        const isReady = o.orderState === 'READY' || o.orderState === '배송 준비중';
        const isUnassignedOrRejected = !o.deliveryId || o.deliveryStatus === null || o.deliveryStatus === 'REJECTED'; 
        return isReady && isUnassignedOrRejected;
    });
    const shippingOrders = orders.filter(o => o.deliveryStatus === 'SHIPPING');
    const pickupOrders = orders.filter(o => o.deliveryStatus === 'COMPLETED' && (o.orderState === 'EXCHANGE' || o.orderState === 'CANCEL'));
    const completedOrders = orders.filter(o => o.deliveryStatus === 'COMPLETED' && o.orderState !== 'EXCHANGE' && o.orderState !== 'CANCEL');

    // Slice 작업
    const pagedAssigned = assignedOrders.slice((page2 - 1) * perPage2, page2 * perPage2);
    const pagedUnassigned = unassignedOrders.slice((page3 - 1) * perPage3, page3 * perPage3);
    const pagedShipping = shippingOrders.slice((page4 - 1) * perPage4, page4 * perPage4);
    const pagedPickup = pickupOrders.slice((page5 - 1) * perPage5, page5 * perPage5);
    const pagedCompleted = completedOrders.slice((page6 - 1) * perPage6, page6 * perPage6);

    return (
        <div>
            {/* [배송 미배정] */}
            <div className="admin-content-box">
                <h3>배송 미배정[O.S=READY,D.S=NULL인 ordersDB]</h3>
                <table className="admin-table-style">
                    <thead><tr><th>번호</th><th>상품</th><th>수량</th><th>주소</th><th>기사 배정 및 상태</th><th>주문일</th></tr></thead>
                    <tbody>
                        {pagedUnassigned.length > 0 ? pagedUnassigned.map((order, index) => {
                            const currentItems = order.orderitems || order.orderItems || [];
                            return (
                                <tr key={order.orderId}>
                                    <td>{(page3 - 1) * perPage3 + index + 1}</td>
                                    <td>{renderItemName(currentItems)}</td>
                                    <td>{currentItems.reduce((sum, i) => sum + (i.count || 0), 0)}개</td>
                                    <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                    <td>
                                        {order.deliveryId && (!order.deliveryStatus || order.deliveryStatus === 'WAITING_FOR_ACCEPT') ? (
                                            <div>
                                                <strong>{items.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName} 기사님 </strong>
                                                <span>수락 대기중</span>
                                            </div>
                                        ) : (
                                            <>
                                                <select value={selectedDrivers[order.orderId] || ""} onChange={(e) => handleDriverSelect(order.orderId, e.target.value)}>
                                                    <option value="">기사 선택</option>
                                                    {items.map(driver => <option key={driver.deliveryId} value={driver.deliveryId}>{driver.deliveryName}</option>)}
                                                </select>
                                                <button onClick={() => handleAssignDriver(order.orderId)}>{order.deliveryStatus === 'REJECTED' ? '재배정' : '배정'}</button>
                                            </>
                                        )}
                                    </td>
                                    <td>{order.orderDate?.split('T')[0]}</td>
                                </tr>
                            );
                        }) : <tr><td colSpan="6">배정할 주문이 없습니다.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* [배송 배정 완료 목록] */}
            <div className="admin-content-box">
                <h3>배송 배정 완료 목록[O.S=READY,D.S=WAITING인 ordersDB]</h3>
                <table className="admin-table-style">
                    <thead><tr><th>번호</th><th>상품</th><th>주소</th><th>배정된 기사</th><th>상태</th><th>주문일</th></tr></thead>
                    <tbody>
                        {pagedAssigned.map((order, index) => (
                            <tr key={order.orderId}>
                                <td>{(page2 - 1) * perPage2 + index + 1}</td>
                                <td>{renderItemName(order.orderitems)}</td>
                                <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                <td><strong>{items.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName || "지정 기사"}</strong></td>
                                <td><span>배송 대기중</span></td>
                                <td>{order.orderDate?.split('T')[0]}</td>
                            </tr>
                        ))}
                        {assignedOrders.length === 0 && <tr><td colSpan="6">배정 완료된 주문이 없습니다.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* [배송 진행 중 목록] */}
            <div className="admin-content-box">
                <h3>🚚 배송 진행 중 목록[O.S=READY,D.S=SHIPPING인 ordersDB]</h3>
                <table className="admin-table-style">
                    <thead><tr><th>번호</th><th>상품</th><th>수량</th><th>주소</th><th>배정 기사</th><th>상태</th><th>주문일</th></tr></thead>
                    <tbody>
                        {pagedShipping.map((order, index) => (
                            <tr key={order.orderId}>
                                <td>{(page4 - 1) * perPage4 + index + 1}</td>
                                <td>{renderItemName(order.orderitems)}</td>
                                <td>{order.orderitems?.reduce((sum, item) => sum + item.count, 0) || 0}개</td>
                                <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                <td><strong>{items.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName || "배정 기사"}</strong></td>
                                <td><span>배송중</span></td>
                                <td>{order.orderDate?.split('T')[0]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* [최종 배송 완료 목록] */}
            <div className="admin-content-box">
                <h3>✅ 최종 배송 완료 목록[O.S=PURCHASED,D.S=COMPLETED인 ordersDB]</h3>
                <table className="admin-table-style">
                    <thead><tr><th>번호</th><th>상품</th><th>수량</th><th>주소</th><th>담당 기사</th><th>상태</th><th>주문일</th></tr></thead>
                    <tbody>
                        {pagedCompleted.map((order, index) => (
                            <tr key={order.orderId}>
                                <td>{(page6 - 1) * perPage6 + index + 1}</td>
                                <td>{renderItemName(order.orderitems)}</td>
                                <td>{order.orderitems?.reduce((sum, item) => sum + item.count, 0) || 0}개</td>
                                <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                <td><span>{items.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName || "담당 기사"}</span></td>
                                <td><span>배송완료</span></td>
                                <td>{order.orderDate?.split('T')[0]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* [반품/교환 픽업 신청 목록] */}
            <div className="admin-content-box">
                <h3>🔄 반품/교환 픽업 신청 목록[O.S=EXCHANGEorREFUND/CANCEL,D.S=COMPLETED/PICKUP인 ordersDB]</h3>
                <table className="admin-table-style">
                    <thead><tr><th>번호</th><th>상품</th><th>수량</th><th>회수 주소</th><th>주문 상태</th><th>기사 배정 및 픽업 신청</th><th>주문일</th></tr></thead>
                    <tbody>
                        {pagedPickup.length > 0 ? pagedPickup.map((order, index) => {
                            const currentItems = order.orderitems || order.orderItems || [];
                            return (
                                <tr key={order.orderId}>
                                    <td>{(page5 - 1) * perPage5 + index + 1}</td>
                                    <td>{renderItemName(currentItems)}</td>
                                    <td>{currentItems.reduce((sum, i) => sum + (i.count || 0), 0)}개</td>
                                    <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                    <td><span>{order.orderState === 'EXCHANGE' ? '교환 접수' : '취소 접수'}</span></td>
                                    <td>
                                        <select value={selectedDrivers[order.orderId] || ""} onChange={(e) => handleDriverSelect(order.orderId, e.target.value)}>
                                            <option value="">픽업 기사 선택</option>
                                            {items.map(driver => <option key={driver.deliveryId} value={driver.deliveryId}>{driver.deliveryName}</option>)}
                                        </select>
                                        <button onClick={() => handleAssignDriver(order.orderId)}>픽업 배정</button>
                                    </td>
                                    <td>{order.orderDate?.split('T')[0]}</td>
                                </tr>
                            );
                        }) : <tr><td colSpan="7">현재 반품/교환 회수 대상 주문이 없습니다.</td></tr>}
                    </tbody>
                </table>
            </div>        
        </div>
    );
};

export default Orderboard;