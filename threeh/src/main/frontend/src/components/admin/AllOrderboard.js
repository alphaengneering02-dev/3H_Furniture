import React, { useState } from 'react';
import { useDriverAuto } from './DriverAuto';
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
    orders = [],
    items = [],
    handleDriverSelect,
    handleAssignDriver,
    handleStatusChange
}) => {
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [perPage1, setPerPage1] = useState(5); 
    const [page1, setPage1] = useState(1);

    const { handleAutoAssign } = useDriverAuto({
        orders, items, selectedOrderIds, setSelectedOrderIds, handleDriverSelect, handleAssignDriver
    });

    const renderItemName = (itemsList) => {
        if (!itemsList || itemsList.length === 0) return '';
        const firstName = itemsList[0].itemName;
        const extraCount = itemsList.length - 1;
        return extraCount > 0 ? `${firstName} 외 ${extraCount}개 상품` : firstName;
    };

    // '주문' 상태이면서 최종 완료 건은 제외하는 필터링
    const masterOrders = orders.filter(o => {
        const isOrderState = o.orderState === '주문' || o.orderState === 'ORDER';
        const isFinalCompleted = (o.deliveryStatus === 'COMPLETED' && o.orderState === 'PURCHASED');
        return isOrderState && !isFinalCompleted;
    });

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
                <h3>주문 목록 (전체 접수 건)</h3>
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
                            <tr key={order.orderId}>
                                <td><input type="checkbox" checked={selectedOrderIds.includes(order.orderId)} onChange={() => handleCheckOrder(order.orderId)}/></td>
                                <td>{order.orderId}</td>
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
                        {masterOrders.length === 0 && <tr><td colSpan="10" style={{textAlign: 'center'}}>접수된 주문 내역이 없습니다.</td></tr>}
                    </tbody>
                </table>
                <TablePagination totalItems={masterOrders.length} itemsPerPage={perPage1} currentPage={page1} setCurrentPage={setPage1} />
            </div>
        </div>
    );
};

export default AllOrderboard;