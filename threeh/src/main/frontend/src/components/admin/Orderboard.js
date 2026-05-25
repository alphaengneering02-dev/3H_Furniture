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

    // 💡 픽업 목록 전용 체크박스 상태 추가
    const [selectedPickupIds, setSelectedPickupIds] = useState([]);
    const [pickupFilter, setPickupFilter] = useState('ALL');

    const renderItemName = (itemsList) => {
        if (!itemsList || itemsList.length === 0) return '';
        const firstName = itemsList[0].itemName;
        const extraCount = itemsList.length - 1;
        return extraCount > 0 ? `${firstName} 외 ${extraCount}개 상품` : firstName;
    };

    const normalizedOrders = orders.map(o => ({
        ...o,
        orderId: o.orderId || o.ORDER_ID,
        orderState: o.orderState || o.ORDER_STATE,
        deliveryStatus: o.deliveryStatus || o.DELIVERY_STATUS,
        deliveryId: o.deliveryId || o.DELIVERY_ID,
        deliveryAddr: o.deliveryAddr || o.DELIVERY_ADDR,
        deliveryAddrDetail: o.deliveryAddrDetail || o.DELIVERY_ADDR_DETAIL,
        orderDate: o.orderDate || o.ORDER_DATE,
        orderitems: o.orderitems || o.orderItems || o.ITEMS || []
    }));

    // 💡 [수정 포인트] 필터 대상 대상을 원본(orders)에서 규격화된 데이터(normalizedOrders)로 교체
    const assignedOrders = normalizedOrders.filter(o => o.deliveryId && o.deliveryStatus === 'WAITING');
    const unassignedOrders = normalizedOrders.filter(o => {   
        const isReady = o.orderState === 'READY' || o.orderState === '배송 준비중' || o.orderState === 'ORDER'; // 'ORDER' 상태도 미배정에 포함되도록 보완
        const isUnassignedOrRejected = !o.deliveryId || o.deliveryStatus === null || o.deliveryStatus === 'REJECTED'; 
        return isReady && isUnassignedOrRejected;
    });

    const shippingOrders = normalizedOrders.filter(o => o.deliveryStatus === 'SHIPPING');
    
    const pickupOrders = normalizedOrders.filter(o => {
        const isTargetState = o.orderState === 'EXCHANGEorREFUND' || o.orderState === 'CANCEL';
        // SQL 결과 PICKUP 상태인 데이터를 인지하도록 보완
        const isPickupStatus = o.deliveryStatus === 'COMPLETED' || o.deliveryStatus === 'PICKUP' || !o.deliveryStatus; 

        if (!isTargetState) return false;
        if (pickupFilter === 'ALL') return true;
        return o.orderState === pickupFilter;
    });
    
    const completedOrders = normalizedOrders.filter(o => o.deliveryStatus === 'COMPLETED' && o.orderState !== 'EXCHANGEorREFUND' && o.orderState !== 'CANCEL');

    // Slice 작업
    const pagedAssigned = assignedOrders.slice((page2 - 1) * perPage2, page2 * perPage2);
    const pagedUnassigned = unassignedOrders.slice((page3 - 1) * perPage3, page3 * perPage3);
    const pagedShipping = shippingOrders.slice((page4 - 1) * perPage4, page4 * perPage4);
    const pagedPickup = pickupOrders.slice((page5 - 1) * perPage5, page5 * perPage5);
    const pagedCompleted = completedOrders.slice((page6 - 1) * perPage6, page6 * perPage6);

    // 💡 1️⃣ 픽업 개별 체크 핸들러
    const handleCheckPickup = (orderId) => {
        setSelectedPickupIds(prev => 
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    // 💡 2️⃣ 픽업 현재 페이지 전체 체크 핸들러
    const handleAllCheckPickup = (e) => {
        const isChecked = e.target.checked;
        const currentPageIds = pagedPickup.map(o => o.orderId);

        if (isChecked) {
            // 현재 페이지의 모든 ID를 기존 선택 목록과 병합 (중복 제거)
            setSelectedPickupIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
        } else {
            // 현재 페이지의 ID들만 선택 목록에서 해제
            setSelectedPickupIds(prev => prev.filter(id => !currentPageIds.includes(id)));
        }
    };

    // 💡 3️⃣ 현재 페이지의 모든 항목이 체크되어 있는지 확인하는 상태 변수
    const isAllPickupCheckedOnCurrentPage = 
        pagedPickup.length > 0 && 
        pagedPickup.every(o => selectedPickupIds.includes(o.orderId));

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

                <div className="admin-tab-filter-group">
                    <button onClick={() => setPickupFilter('ALL')}>전체</button>
                    <button onClick={() => setPickupFilter('EXCHANGEorREFUND')}>교환/반품</button>
                    <button onClick={() => setPickupFilter('CANCEL')}>취소</button>
                </div>

                {/* 💡 상단에 다중 처리가 필요할 경우 표시할 선택 건수 안내 (선택 사항) */}
                {selectedPickupIds.length > 0 && (
                    <div style={{ marginBottom: '10px', color: '#007bff', fontWeight: 'bold' }}>
                        선택된 반품/교환 건: {selectedPickupIds.length}건
                    </div>
                )}

                <table className="admin-table-style">
                    <thead>
                        <tr>
                            {/* 💡 제목줄 한꺼번에 체크박스 추가 */}
                            <th>
                                <input 
                                    type="checkbox" 
                                    onChange={handleAllCheckPickup} 
                                    checked={isAllPickupCheckedOnCurrentPage} 
                                />
                            </th>
                            <th>번호</th><th>상품</th><th>수량</th><th>회수 주소</th><th>주문 상태</th><th>기사 배정 및 픽업 신청</th><th>주문일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedPickup.length > 0 ? pagedPickup.map((order, index) => {
                            const currentItems = order.orderitems || order.orderItems || [];
                            return (
                                <tr key={order.orderId}>
                                    {/* 💡 데이터 행 개별 체크박스 추가 */}
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedPickupIds.includes(order.orderId)} 
                                            onChange={() => handleCheckPickup(order.orderId)} 
                                        />
                                    </td>
                                    <td>{(page5 - 1) * perPage5 + index + 1}</td>
                                    <td>{renderItemName(currentItems)}</td>
                                    <td>{currentItems.reduce((sum, i) => sum + (i.count || 0), 0)}개</td>
                                    <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                    {/* 기존 코드의 오타 매핑('EXCHANGEorREFUND') 대응 보완 */}
                                    <td><span>{order.orderState === 'EXCHANGEorREFUND' ? '교환/반품 접수' : '취소 접수'}</span></td>
                                    <td>
                                        <select value={selectedDrivers[order.orderId] || ""} onChange={(e) => handleDriverSelect(order.orderId, e.target.value)}>
                                            <option value="">픽업 기사 선택</option>
                                            {items.map(driver => <option key={driver.deliveryId} value={driver.deliveryId}>{driver.deliveryName}</option>)}
                                        </select>
                                        <button onClick={() => handleAssignDriver(order.orderId, true)}>픽업 배정</button>
                                    </td>
                                    <td>{order.orderDate?.split('T')[0]}</td>
                                </tr>
                            );
                        }) : <tr><td colSpan="8">현재 반품/교환 회수 대상 주문이 없습니다.</td></tr>}
                    </tbody>
                </table>
            </div>        
        </div>
    );
};

export default Orderboard;