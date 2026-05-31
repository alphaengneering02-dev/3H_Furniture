import React, { useState, useEffect } from 'react';
import { useDriverAuto } from './DriverAuto';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
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
    const [buyerSearchTerm, setBuyerSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const activeOrders = Array.isArray(propOrders) ? propOrders : localOrders;

    useEffect(() => {
        if (propOrders === undefined || propOrders === null) {
            console.warn("⚠️ 부모 컴포넌트에서 orders 데이터를 받지 못했습니다. 백엔드로 직접 요청합니다!");
            axios.get('/admin/orders')
                .then(res => {
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

    // 조건 필터 함수 선언 ('ORDER' 및 '주문' 지원)
    const isSelectable = (o) => {
        if (!o || !o.orderState) return false;
        const state = o.orderState.toString().trim().toUpperCase();
        return state === 'ORDER' || state === '주문';
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

    // 전체 필터링된 데이터 중 체크박스 선택 가능한 목록
    const selectableOrders = filteredByBuyerOrders.filter(isSelectable);

    // 3. 현재 페이지에 노출될 주문 정의 (pagedOrders 선언)
    const pagedOrders = filteredByBuyerOrders.slice((page1 - 1) * perPage1, page1 * perPage1);

    // 4. 선언된 pagedOrders를 바탕으로 현재 페이지의 선택 가능 주문 필터링
    const currentSelectableOrders = pagedOrders.filter(isSelectable);

    const handleCheckOrder = (orderId) => {
        setSelectedOrderIds(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
    };

    const handleAllCheck = (e) => {
        const currentIds = currentSelectableOrders.map(o => o.orderId);
        if (e.target.checked) {
            setSelectedOrderIds(prev => Array.from(new Set([...prev, ...currentIds])));
        } else {       
            setSelectedOrderIds(prev => prev.filter(id => !currentIds.includes(id)));
        }
    };

    const handleBulkReady = () => {
        if (selectedOrderIds.length === 0) { toast.error('변경할 주문을 선택해주세요.'); return; }
        if (window.confirm(`선택한 ${selectedOrderIds.length}건을 '상품준비완료(READY)' 상태로 변경하시겠습니까?`)) {
            selectedOrderIds.forEach(id => handleStatusChange(id, 'READY'));
            setSelectedOrderIds([]);
        }
    };

    const handleManualAssign = () => {
        let targetIds = [...selectedOrderIds];
        
        // 💡 [콘솔 추가] 버튼을 눌렀을 때의 현재 상태 점검
        console.log("=== 🚚 선택 배정 버튼 클릭됨 ===");
        console.log("1. 현재 체크박스로 선택된 주문 번호들:", targetIds);
        console.log("2. 부모 컴포넌트에게 전달받은 기사(items) 전체 데이터:", items);
        console.log("3. 현재 화면에 필터링되어 보이는 전체 주문 데이터:", filteredByBuyerOrders);

        if (targetIds.length === 0) {
            console.log("👉 체크된 주문이 없으므로 자동 전체 배정을 시도합니다.");
            const selectable = filteredByBuyerOrders.filter(isSelectable);
            
            // 💡 [콘솔 추가] '주문/ORDER' 상태인 건이 몇 개나 있는지 확인
            console.log("4. 화면에 보이는 주문 중 배정 가능한(ORDER/주문 상태) 주문들:", selectable);
            
            targetIds = selectable.map(o => o.orderId);
        }

        console.log("5. 최종 배정 대상 주문 IDs:", targetIds);

        if (targetIds.length === 0) { 
            console.warn("❌ 배정할 수 있는 '주문' 상태의 건이 0건입니다.");
            toast.error('배정할 주문이 없습니다. 주문 상태가 [주문(ORDER)]인 건만 배정할 수 있습니다.'); 
            return; 
        }
        if (!items || items.length === 0) { 
            console.warn("❌ 기사(items) 배열이 비어있거나 undefined입니다.");
            toast.error('등록된 기사 정보가 없습니다.'); 
            return; 
        }
        
        console.log("✅ 모든 조건 통과! 모달창을 엽니다. (setIsModalOpen(true))");
        setSelectedOrderIds(targetIds); 
        setIsModalOpen(true);            
    };

   const handleModalDriverClick = async (driverId, driverName) => {
        const targetIds = selectedOrderIds;

        if (window.confirm(`검색된 주문 ${targetIds.length}건을 모두 [${driverName}] 기사님께 한 번에 배정하시겠습니까?`)) {
            try {
                await axios.post('/admin/orders/select-delivery', {
                    deliveryId: driverId,
                    orderIds: targetIds
                });

                toast.success(`🎉 주문 총 ${targetIds.length}건이 ${driverName} 기사님께 묶음 배정되었습니다.`);

                

            } catch (error) {
                console.error("❌ 다중 배정 통신 실패:", error);
                toast.error("배정 처리 중 서버 오류가 발생했습니다.");
            } finally {
                // 어떤 경우든 작업이 끝나면 체크박스와 모달창 상태 초기화
                setSelectedOrderIds([]); 
                setIsModalOpen(false);   
            }
        }
    };

    const handleRoundRobinAssign = () => {
        if (selectedOrderIds.length === 0) { toast.error('자동 배정할 주문을 선택해주세요.'); return; }
        if (!items || items.length === 0) { toast.error('배정할 수 있는 대기 기사님이 없습니다.'); return; }

        if (window.confirm(`선택한 ${selectedOrderIds.length}건의 주문을 현재 등록된 ${items.length}명의 기사님께 공평하게 자동 분배하시겠습니까?`)) {
            selectedOrderIds.forEach((orderId, index) => {
                const driverIndex = index % items.length; 
                const targetDriver = items[driverIndex];
                const driverId = targetDriver.driverId || targetDriver.DRIVER_ID || targetDriver.deliveryId;

                handleAssignDriver(orderId, driverId);
            });

            toast.error(`🎉 자동 배정이 완료되었습니다! 기사당 약 ${Math.ceil(selectedOrderIds.length / items.length)}건씩 분배되었습니다.`);
            setSelectedOrderIds([]);
        }
    };

    return (
       <div className="admin-content-box">
            <div className="admin-order-header">
                <div className="admin-order-top-row">
                    <h3>주문 목록 (전체 접수 건) - 현재 화면 노출: {filteredByBuyerOrders.length}건</h3>
                    <div className="admin-buyer-search-wrapper">
                        <label htmlFor="buyerInput">👤 주문자 검색:</label>
                        <div className="admin-buyer-search-input-container">
                            <input
                                id="buyerInput"
                                type="text"
                                placeholder="주문자 이름을 입력하세요..."
                                value={buyerSearchTerm}
                                onChange={(e) => {
                                    setBuyerSearchTerm(e.target.value);
                                    setPage1(1);
                                }}
                            />
                            {buyerSearchTerm && (
                                <button
                                    className="admin-buyer-clear-btn"
                                    onClick={() => {
                                        setBuyerSearchTerm('');
                                        setPage1(1);
                                    }}
                                >✕</button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="admin-order-bottom-row">
                     <div className="admin-action-button-group">
                        <button onClick={handleBulkReady}>선택 주문 준비 완료 처리 ({selectedOrderIds.length}건)</button>
                        <button onClick={handleManualAssign} className="admin-btn-manual">선택 주문 선택 배정 ({selectedOrderIds.length}건)</button>
                        <button onClick={handleRoundRobinAssign} className="admin-btn-auto">선택 주문 자동 배정 ({selectedOrderIds.length}건)</button>
                    </div>

                    <select
                        value={perPage1}
                        onChange={(e) => {
                            setPerPage1(Number(e.target.value));
                            setPage1(1);
                        }}
                    >
                        <option value={5}>5개씩 보기</option>
                        <option value={10}>10개씩 보기</option>
                        <option value={15}>15개씩 보기</option>
                    </select>
                </div>
            </div>
            
            <div className="admin-table-scroll">
                <table className="admin-table-style">
                    <thead>
                        <tr>
                            <th>
                                {/* 💡 상단 전체 선택 제어 고도화 */}
                                <input 
                                    type="checkbox" 
                                    onChange={handleAllCheck} 
                                    disabled={currentSelectableOrders.length === 0}
                                    checked={currentSelectableOrders.length > 0 && currentSelectableOrders.every(o => selectedOrderIds.includes(o.orderId))}
                                />
                            </th>
                            <th>주문 번호</th><th>주문자</th><th>상품</th><th>수량</th><th>주문 타입</th><th>주소</th><th>주문 상태</th><th>배송 상태</th><th>주문일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedOrders.map(order => {
                            // 💡 여기서 selectable 여부를 판단합니다.
                            const selectable = isSelectable(order);

                            return (
                                <tr key={order.orderId} style={!selectable ? { opacity: 0.6 } : {}}>
                                    <td>
                                        {/* 💡 핵심: ORDER나 주문이 아니면 무조건 비활성화 처리 */}
                                        <input 
                                            type="checkbox" 
                                            disabled={!selectable}
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
                            );
                        })}
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

            {isModalOpen && (
                <div className="admin-custom-modal-overlay">
                    <div className="admin-custom-modal-content">
                        <h4>🚚 배정할 기사님을 선택해주세요</h4>
                        <p>대상 주문 건수: <span>{selectedOrderIds.length}건</span></p>
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