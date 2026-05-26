import React, { useState, useEffect } from 'react';
import { useDriverAuto } from './DriverAuto';
import axios from 'axios'; // Axios 추가
import '../../css/adminCss/AdminDashboard.css';




/* 페이지네이션 UI */
const TablePagination = ({ totalItems, itemsPerPage, currentPage, setCurrentPage }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const handlePageChange = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

    return (
        <div className="admin-pagination-container">
            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>&lt;&lt;</button>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={currentPage === pageNum ? "admin-active-page" : ""}>
                    {pageNum}
                </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>&gt;&gt;</button>
        </div>
    );
};

const AllOrderboard = ({
    orders: propOrders = [], // 부모에게 받는 orders 이름 변경
    items = [],
    handleDriverSelect,
    handleAssignDriver,
    handleStatusChange
}) => {
    // 만약 부모가 데이터를 안 주면 스스로 저장할 상태
    const [localOrders, setLocalOrders] = useState([]);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [perPage1, setPerPage1] = useState(5); 
    const [page1, setPage1] = useState(1);

    // 최종적으로 사용할 orders 결정 (부모가 준 게 없으면 백엔드에서 직접 가져온 것 사용)
    const activeOrders = propOrders && propOrders.length > 0 ? propOrders : localOrders;

    // 🔍 [디버깅] 컴포넌트가 켜질 때 부모가 준 데이터가 있는지 검사, 없으면 백엔드 강제 호출
    useEffect(() => {
        
        if (!propOrders || propOrders.length === 0) {
            console.warn("⚠️ 부모 컴포넌트에서 orders 데이터를 받지 못했습니다. 백엔드로 직접 요청합니다!");
            axios.get('/admin/orders')
                .then(res => {
                    console.log("🛰️ [백엔드 직접 조회 완료] 가져온 데이터:", res.data);
                    setLocalOrders(res.data);
                })
                .catch(err => {
                    console.error("❌ [백엔드 직접 조회 실패] URL 확인 필요 (/admin/orders):", err);
                });
        }
    }, [propOrders]);

    const { handleAutoAssign } = useDriverAuto({
        orders: activeOrders, items, selectedOrderIds, setSelectedOrderIds, handleDriverSelect, handleAssignDriver
    });

    const renderItemName = (itemsList) => {
        if (!itemsList || itemsList.length === 0) return '';
        const firstName = itemsList[0].itemName || itemsList[0].ITEMNAME;
        const extraCount = itemsList.length - 1;
        return extraCount > 0 ? `${firstName} 외 ${extraCount}개 상품` : firstName;
    };

    // 💡 [수정 포인트] masterOrders 선언부 변경
    const masterOrders = activeOrders.map(o => ({
        ...o,
        orderId: o.orderId || o.ORDER_ID,
        orderState: o.orderState || o.ORDER_STATE,
        deliveryStatus: o.deliveryStatus || o.DELIVERY_STATUS,
        orderType: o.orderType || o.ORDER_TYPE,
        orderDate: o.orderDate || o.ORDER_DATE,
        deliveryAddr: o.deliveryAddr || o.DELIVERY_ADDR,
        deliveryAddrDetail: o.deliveryAddrDetail || o.DELIVERY_ADDR_DETAIL,
        memberName: o.memberName || o.MEMBER_ID,
        orderitems: o.orderitems || o.orderItems || o.ITEMS || []
    })).sort((a, b) => {
        // 최신 주문일 순 내림차순 정렬
        return new Date(b.orderDate) - new Date(a.orderDate);
    });
    // 💡 [수정 포인트] 위에서 매핑을 끝냈으므로 소문자로 일괄 필터링 가능
    const selectableOrders = masterOrders.filter(o => o.deliveryStatus !== 'COMPLETED');
    const pagedOrders = masterOrders.slice((page1 - 1) * perPage1, page1 * perPage1);
    const handleCheckOrder = (orderId) => {
        setSelectedOrderIds(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
    };

    const handleAllCheck = (e) => {
        setSelectedOrderIds(e.target.checked ? selectableOrders.map(o => o.orderId) : []);
    };

    const handleBulkReady = () => {
        if (selectedOrderIds.length === 0) { alert('변경할 주문을 선택해주세요.'); return; }
        if (window.confirm(`선택한 ${selectedOrderIds.length}건을 '상품준비완료(READY)' 상태로 변경하시겠습니까?`)) {
            selectedOrderIds.forEach(id => handleStatusChange(id, 'READY'));
            setSelectedOrderIds([]);
        }
    };

    return (
        <div className="admin-content-box">
            <div className="admin-content-title-bar">
                <h3>주문 목록 (전체 접수 건) - 현재 화면 노출: {masterOrders.length}건</h3>
                <select value={perPage1} onChange={(e) => { setPerPage1(Number(e.target.value)); setPage1(1); }}>
                    <option value={5}>5개씩 보기</option>
                    <option value={10}>10개씩 보기</option>
                    <option value={15}>15개씩 보기</option>
                </select>
            </div>
            <div className="admin-action-button-group">
                <button onClick={handleBulkReady}>선택 상품 준비 완료 처리 ({selectedOrderIds.length}건)</button>
                <button onClick={handleAutoAssign}>선택 상품 자동 배정 ({selectedOrderIds.length}건)</button>
            </div>
            <div className="admin-table-scroll">
                <table className="admin-table-style">
                    <thead>
                        <tr>
                            <th><input type="checkbox" onChange={handleAllCheck} checked={selectableOrders.length > 0 && selectableOrders.every(o => selectedOrderIds.includes(o.orderId))}/></th>
                            <th>주문 번호</th><th>주문자</th><th>상품</th><th>수량</th><th>주문 타입</th><th>주소</th><th>주문 상태</th><th>배송 상태</th><th>주문일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedOrders.map(order => (
                            <tr key={order.orderId || order.ORDER_ID}>
                                <td><input type="checkbox" checked={selectedOrderIds.includes(order.orderId || order.ORDER_ID)} onChange={() => handleCheckOrder(order.orderId || order.ORDER_ID)}/></td>
                                <td>{order.orderId || order.ORDER_ID}</td>
                                <td><strong>{order.memberName || '비회원'}</strong></td>
                                <td>{renderItemName(order.orderitems || order.orderItems)}</td>
                                <td>{(order.orderitems || order.orderItems)?.reduce((sum, item) => sum + (item.count || 0), 0) || 0}개</td>
                                <td>{order.orderType === 'DELIVERY_WITH_INSTALLATION' ? '*설치 배송*' : '*일반 배송*'}</td>
                                <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                <td><span>{order.orderState}</span></td>
                                <td><span>{order.deliveryStatus || '-'}</span></td>
                                <td>{order.orderDate?.split('T')[0]}</td>
                            </tr>
                        ))}
                        {masterOrders.length === 0 && (
                            <tr>
                                <td colSpan="10" className="table-no-data">
                                    ⚠️ 현재 조건에 맞는 주문 데이터가 0건입니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <TablePagination totalItems={masterOrders.length} itemsPerPage={perPage1} currentPage={page1} setCurrentPage={setPage1} />
            </div>
        </div>
    );
};

export default AllOrderboard;