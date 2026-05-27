import React, { useState, useEffect } from 'react';
import { useDriverAuto } from './DriverAuto';
import axios from 'axios';
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
    orders: propOrders,
    items = [],
    handleDriverSelect,
    handleAssignDriver,
    handleStatusChange
}) => {
    const [localOrders, setLocalOrders] = useState([]);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [perPage1, setPerPage1] = useState(5); 
    const [page1, setPage1] = useState(1);

    // 주문자 검색창 상태
    const [buyerSearchTerm, setBuyerSearchTerm] = useState('');

    // 💡 [추가] 커스텀 모달창 제어를 위한 열림/닫힘 상태 값
    const [isModalOpen, setIsModalOpen] = useState(false);

    const activeOrders = Array.isArray(propOrders) ? propOrders : localOrders;

    useEffect(() => {
        if (propOrders && propOrders.length > 0) {  
        }
        
        if (propOrders === undefined || propOrders === null) {
            console.warn("⚠️ 부모 컴포넌트에서 orders 데이터를 받지 못했습니다. 백엔드로 직접 요청합니다!");
            axios.get('/admin/orders')
                .then(res => {
                    console.table(res.data);
                    setLocalOrders(res.data);
                })
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

    // 1. 데이터 표준화 및 정렬
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
        deliveryName: o.deliveryName || o.DELIVERY_NAME || o.driverName || '이름없음',
        orderitems: o.orderitems || o.orderItems || o.ITEMS || []
    })).sort((a, b) => {
        return new Date(b.orderDate) - new Date(a.orderDate);
    });

    // 2. 주문자 이름 필터링 거치기
    const filteredByBuyerOrders = masterOrders.filter(o => {
        if (!buyerSearchTerm.trim()) return true; 
        const name = o.memberName || '비회원';
        return name.toLowerCase().includes(buyerSearchTerm.toLowerCase().trim());
    });

    // 3. 체크박스 및 페이지네이션의 기준을 모두 filteredByBuyerOrders로 변경!
    const selectableOrders = filteredByBuyerOrders.filter(o => 
        o.orderState !== 'CANCEL' && 
        o.orderState !== '주문취소' && 
        o.orderState !== 'EXCHANGEorREFUND' && 
        o.orderState !== '교환또는환불' && 
        o.deliveryStatus !== 'COMPLETED'
    );

    const pagedOrders = filteredByBuyerOrders.slice((page1 - 1) * perPage1, page1 * perPage1);

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

    // 💡 [깔끔하게 수정] 선택 주문 선택 배정 클릭 시 모달창을 띄우는 함수
    const handleManualAssign = () => {
        let targetIds = [...selectedOrderIds];
        
        // 체크박스 선택 안 했으면 현재 검색창 결과 전체를 타겟으로 지정
        if (targetIds.length === 0) {
            targetIds = filteredByBuyerOrders.map(o => o.orderId);
        }

        if (targetIds.length === 0) { 
            alert('배정할 주문이 없습니다. 주문자 이름을 검색하거나 주문을 선택해주세요.'); 
            return; 
        }
        if (!items || items.length === 0) { 
            alert('등록된 기사 정보가 없습니다.'); 
            return; 
        }
        
        setSelectedOrderIds(targetIds); // 대상 주문 동기화
        setIsModalOpen(true);            // 모달 팝업 오픈
    };

    // 💡 [깔끔하게 수정] 모달 내부에서 특정 기사 이름을 마우스로 클릭했을 때 처리되는 일괄 배정 함수
    const handleModalDriverClick = (driverId, driverName) => {
        const targetIds = selectedOrderIds;

        if (window.confirm(`검색된 주문 ${targetIds.length}건을 모두 [${driverName}] 기사님께 한 번에 배정하시겠습니까?`)) {
            
            // 배열을 돌며 부모에게 전달받은 배정 메소드 연동
            targetIds.forEach(orderId => {
                handleAssignDriver(orderId, driverId); 
            });
            
            alert(`🎉 ${buyerSearchTerm ? '[' + buyerSearchTerm + '] 고객님의 ' : ''}주문 총 ${targetIds.length}건이 ${driverName} 기사님께 묶음 배정되었습니다.`);
            
            setSelectedOrderIds([]); // 체크박스 초기화
            setIsModalOpen(false);   // 모달창 닫기
        }
    };

    const handleRoundRobinAssign = () => {
        if (selectedOrderIds.length === 0) { alert('자동 배정할 주문을 선택해주세요.'); return; }
        if (!items || items.length === 0) { alert('배정할 수 있는 대기 기사님이 없습니다.'); return; }

        if (window.confirm(`선택한 ${selectedOrderIds.length}건의 주문을 현재 등록된 ${items.length}명의 기사님께 공평하게 자동 분배하시겠습니까?`)) {
            selectedOrderIds.forEach((orderId, index) => {
                const driverIndex = index % items.length; 
                const targetDriver = items[driverIndex];
                const driverId = targetDriver.driverId || targetDriver.DRIVER_ID || targetDriver.deliveryId;

                handleAssignDriver(orderId, driverId);
            });

            alert(`🎉 자동 배정이 완료되었습니다! 기사당 약 ${Math.ceil(selectedOrderIds.length / items.length)}건씩 분배되었습니다.`);
            setSelectedOrderIds([]);
        }
    };

    return (
       <div className="admin-content-box">
            <div className="admin-content-title-bar">
                <h3>주문 목록 (전체 접수 건) - 현재 화면 노출: {filteredByBuyerOrders.length}건</h3>

                {/* 📋 주문자 전용 검색 UI 영역 */}
                <div className="admin-buyer-search-wrapper">
                    <label htmlFor="buyerInput">👤 주문자 검색:</label>
                    <div className="admin-buyer-search-input-container">
                        <input
                            id="buyerInput"
                            type="text"
                            placeholder="주문자 이름을 입력하세요..."
                            value={buyerSearchTerm}
                            onChange={(e) => { setBuyerSearchTerm(e.target.value); setPage1(1); }}
                        />
                        {buyerSearchTerm && (
                            <button 
                                className="admin-buyer-clear-btn"
                                onClick={() => { setBuyerSearchTerm(''); setPage1(1); }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <select value={perPage1} onChange={(e) => { setPerPage1(Number(e.target.value)); setPage1(1); }}>
                    <option value={5}>5개씩 보기</option>
                    <option value={10}>10개씩 보기</option>
                    <option value={15}>15개씩 보기</option>
                </select>
            </div>
            
            <div className="admin-action-button-group">
                <button onClick={handleBulkReady}>선택 주문 준비 완료 처리 ({selectedOrderIds.length}건)</button>
                <button onClick={handleManualAssign} className="admin-btn-manual">선택 주문 선택 배정 ({selectedOrderIds.length}건)</button>
                <button onClick={handleRoundRobinAssign} className="admin-btn-auto">선택 주문 자동 배정 ({selectedOrderIds.length}건)</button>
            </div>

            <div className="admin-table-scroll">
                <table className="admin-table-style">
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox" 
                                    onChange={handleAllCheck} 
                                    checked={selectableOrders.length > 0 && selectableOrders.every(o => selectedOrderIds.includes(o.orderId))}
                                />
                            </th>
                            <th>주문 번호</th><th>주문자</th><th>상품</th><th>수량</th><th>주문 타입</th><th>주소</th><th>주문 상태</th><th>배송 상태</th><th>주문일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedOrders.map(order => (
                            <tr key={order.orderId}>
                                <td>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedOrderIds.includes(order.orderId)} 
                                        onChange={() => handleCheckOrder(order.orderId)}
                                    />
                                </td>
                                <td>{order.orderId}</td>
                                <td><strong>{order.memberName || '비회원'}</strong></td>
                                <td>{renderItemName(order.orderitems)}</td>
                                <td>{order.orderitems?.reduce((sum, item) => sum + (item.count || 0), 0) || 0}개</td>
                                <td>{order.orderType === 'DELIVERY_WITH_INSTALLATION' ? '*설치 배송*' : '*일반 배송*'}</td>
                                <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                <td><span>{order.orderState}</span></td>
                                <td><span>{order.deliveryStatus || '-'}</span></td>
                                <td>{order.orderDate?.split('T')[0]}</td>
                            </tr>
                        ))}
                        {filteredByBuyerOrders.length === 0 && (
                            <tr>
                                <td colSpan="10" className="admin-table-no-data">
                                    ⚠️ 현재 조건에 맞는 주문 데이터가 0건입니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <TablePagination totalItems={filteredByBuyerOrders.length} itemsPerPage={perPage1} currentPage={page1} setCurrentPage={setPage1} />
            </div>

            {/* 💡 [수정완료] 모달 내부 태그들에 박혀있던 인라인 스타일(style={{...}})을 싹 다 제거했습니다. */}
            {isModalOpen && (
                <div className="admin-custom-modal-overlay">
                    <div className="admin-custom-modal-content">
                        <h4>🚚 배정할 기사님을 선택해주세요</h4>
                        <p>
                            대상 주문 건수: <span>{selectedOrderIds.length}건</span>
                        </p>
                        <hr />
                        
                        <div className="admin-modal-driver-list">
                            {items.map((driver) => {
                                const driverId = driver.driverId || driver.DRIVER_ID || driver.deliveryId;
                                const driverName = driver.deliveryName || driver.name || driver.NAME || '이름없음';
                                
                                return (
                                    <button
                                        key={driverId}
                                        className="admin-modal-driver-btn"
                                        onClick={() => handleModalDriverClick(driverId, driverName)}
                                    >
                                        👤 {driverName} 기사님
                                    </button>
                                );
                            })}
                        </div>
                        
                        <hr />
                        <button className="admin-modal-close-btn" onClick={() => setIsModalOpen(false)}>
                            창 닫기 (취소)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllOrderboard;