import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
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

    const [selectedPickupIds, setSelectedPickupIds] = useState([]);
    const [pickupFilter, setPickupFilter] = useState('ALL');

    // 💡 수량 필터링 모달/토글 상태 추가
    const [showSpecialList, setShowSpecialList] = useState(false);

    const renderItemName = (itemsList) => {
        if (!itemsList || itemsList.length === 0) return '';
        const firstName = itemsList[0].itemName;
        const extraCount = itemsList.length - 1;
        return extraCount > 0 ? `${firstName} 외 ${extraCount}개 상품` : firstName;
    };

    const normalizedOrders = orders.map(o => {
        let state = o.orderState || o.ORDER_STATE;
        if (state === '교환또는환불') state = 'EXCHANGEorREFUND';
        if (state === '주문취소') state = 'CANCEL';
        if (state === '주문') state = 'ORDER';
        if (state === '배송 준비중') state = 'READY';

        return {
            ...o,
            orderId: o.orderId || o.ORDER_ID,
            orderState: state,
            deliveryStatus: o.deliveryStatus || o.DELIVERY_STATUS,
            deliveryId: o.deliveryId || o.DELIVERY_ID,
            deliveryAddr: o.deliveryAddr || o.DELIVERY_ADDR,
            deliveryAddrDetail: o.deliveryAddrDetail || o.DELIVERY_ADDR_DETAIL,
            orderDate: o.orderDate || o.ORDER_DATE,
            orderitems: o.orderitems || o.orderItems || o.ITEMS || []
        };
    }).sort((a, b) => {
        // 날짜 객체 또는 문자열 비교를 통해 최신순 정렬
        return new Date(b.orderDate) - new Date(a.orderDate);
    });
    // 💡 엑셀 다운로드 함수 추가
    const downloadCompletedOrdersExcel = () => {
        if (completedOrders.length === 0) {
            toast.error("다운로드할 배송 완료 주문이 없습니다.");
            return;
        }

        // 엑셀에 들어갈 데이터 포맷 가공 (화면의 테이블 구조와 매칭)
        const excelData = completedOrders.map((order, index) => {
            const totalOrderPrice = order.orderitems?.reduce((sum, item) => {
                return sum + ((item.orderPrice || 0) * (item.count || 0));
            }, 0) || 0;

            const driverName = items.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName || "담당 기사";

            return {
                "번호": index + 1,
                "주문ID": order.orderId,
                "상품명": renderItemName(order.orderitems),
                "총 수량": (order.orderitems?.reduce((sum, item) => sum + item.count, 0) || 0) + "개",
                "판매 금액": totalOrderPrice.toLocaleString() + "원",
                "담당 기사": driverName,
                "배송 상태": "배송완료",
                "주문일": order.orderDate?.split('T')[0] || ""
            };
        });

        // 엑셀 워크시트 생성
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "배송완료목록");

        // 열 너비 자동 조절 (옵션 - 깔끔하게 보이게 함)
        const maxLen = excelData.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => v.toString().length)), 10);
        worksheet["!cols"] = Array(Object.keys(excelData[0]).length).fill({ wch: maxLen + 2 });

        // 파일 다운로드 실행
        XLSX.writeFile(workbook, `최종_배송_완료_목록_${new Date().toISOString().split('T')[0]}.xlsx`);
    };


    // 💡 [핵심 추가] 총 수량이 6개 또는 8개인 주문 필터링 로직
    const specialOrders = normalizedOrders.filter(o => {
        const totalCount = o.orderitems?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
        return totalCount === 6 || totalCount === 8;
    });

    // 💡 [핵심 추가] 엑셀(CSV) 다운로드 함수
    const downloadCSV = () => {
    if (specialOrders.length === 0) {
        toast.error("다운로드할 데이터가 없습니다.");
        return;
    }

    // 엑셀 한글 깨짐 방지 BOM 추가
    let csvContent = "\uFEFF"; 
    csvContent += "주문번호,주문자,총수량,상품상세(셀내 줄바꿈),판매금액,배송상태,주문일\n";

    specialOrders.forEach(o => {
        const totalCount = o.orderitems?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
        const totalPrice = o.orderitems?.reduce((sum, item) => sum + ((item.orderPrice || 0) * (item.count || 0)), 0) || 0;
        
        // 💡 핵심 수정: 각 상품 항목을 줄바꿈(\n)으로 연결합니다.
        // CSV 문법 에러를 막기 위해 내부 데이터의 따옴표나 쉼표는 가볍게 정리해 줍니다.
        const itemDetails = o.orderitems
            .map(i => `• ${i.itemName.replace(/"/g, ' ')} (${i.count}개)`)
            .join('\n'); // 👈 슬래시(/) 대신 엔터(\n)로 변경

        // 💡 중요: ${itemDetails}를 감싸고 있는 큰따옴표("")가 있어야 한 셀 내부에서 엔터로 인식됩니다.
        csvContent += `${o.orderId},${o.memberName || '미상'},${totalCount},"${itemDetails}",${totalPrice},${o.deliveryStatus || '미정'},${o.orderDate?.split('T')[0]}\n`;
    });

    // 다운로드 트리거
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `특수주문목록_6개_8개_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

    // 기존 필터링 변수들
    const assignedOrders = normalizedOrders.filter(o => o.deliveryId && o.deliveryStatus === 'WAITING');
    const unassignedOrders = normalizedOrders.filter(o => { 
        const isReady = o.orderState === 'READY' || o.orderState === 'ORDER';
        const isUnassignedOrRejected = !o.deliveryId || o.deliveryStatus === null || o.deliveryStatus === 'REJECTED'; 
        return isReady && isUnassignedOrRejected;
    });
    const shippingOrders = normalizedOrders.filter(o => o.deliveryStatus === 'SHIPPING');
    const pickupOrders = normalizedOrders.filter(o => {
        const isTargetState = o.orderState === 'EXCHANGEorREFUND' || o.orderState === 'CANCEL';
        const currentStatus = o.deliveryStatus ? o.deliveryStatus.toUpperCase() : '';
        const isPickupStatus = currentStatus === 'COMPLETED' || currentStatus === 'PICKUP'; 
        if (!isTargetState || !isPickupStatus) return false;
        if (pickupFilter === 'ALL') return true;
        return o.orderState === pickupFilter;
    });
    const completedOrders = normalizedOrders.filter(o => o.deliveryStatus === 'COMPLETED' && o.orderState !== 'EXCHANGEorREFUND' && o.orderState !== 'CANCEL');

    const pagedAssigned = assignedOrders.slice((page2 - 1) * perPage2, page2 * perPage2);
    const pagedUnassigned = unassignedOrders.slice((page3 - 1) * perPage3, page3 * perPage3);
    const pagedShipping = shippingOrders.slice((page4 - 1) * perPage4, page4 * perPage4);
    const pagedPickup = pickupOrders.slice((page5 - 1) * perPage5, page5 * perPage5);
    const pagedCompleted = completedOrders.slice((page6 - 1) * perPage6, page6 * perPage6);

    const handleCheckPickup = (orderId) => {
        setSelectedPickupIds(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
    };

    const handleAllCheckPickup = (e) => {
        const isChecked = e.target.checked;
        const currentPageIds = pagedPickup.map(o => o.orderId);
        if (isChecked) {
            setSelectedPickupIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
        } else {
            setSelectedPickupIds(prev => prev.filter(id => !currentPageIds.includes(id)));
        }
    };

    const isAllPickupCheckedOnCurrentPage = pagedPickup.length > 0 && pagedPickup.every(o => selectedPickupIds.includes(o.orderId));

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
                    <thead><tr><th>번호</th><th>상품</th><th>판매 금액</th><th>배정된 기사</th><th>상태</th><th>주문일</th></tr></thead>
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

            {/* 💡 대량 주문*/}
            <div className="admin-content-box">
                <div className="admin-action-row">
                    <div>
                        <h4>📦 대량 주문 조회</h4>
                        <p>
                            현재 대상 건수: <strong>{specialOrders.length}건</strong>
                        </p>
                    </div>
                    <div className="admin-btn-right">
                        <button
                            className="admin-move-page-btn"
                            onClick={() => setShowSpecialList(!showSpecialList)} >
                            {showSpecialList ? "목록 닫기" : "상세 목록 보기"}
                        </button>
                        <button
                            className="admin-move-page-btn"
                            onClick={downloadCSV}>
                                Excel(CSV) 다운로드
                        </button>
                    </div>
                </div>

                {/* 💡 토글 시 노출되는 상세 리스트 */}
                {showSpecialList && (
                    <div>
                        <table className="admin-table-style">
                            <thead>
                                <tr>
                                    <th>주문ID</th><th>주문자</th><th>상품 상세 내역</th><th>총 수량</th><th>총 금액</th><th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {specialOrders.length > 0 ? specialOrders.map(o => {
                                    const tCount = o.orderitems?.reduce((sum, i) => sum + i.count, 0) || 0;
                                    const tPrice = o.orderitems?.reduce((sum, i) => sum + (i.orderPrice * i.count), 0) || 0;
                                    return (
                                        <tr key={o.orderId}>
                                            <td>{o.orderId}</td>
                                            <td>{o.memberName}</td>
                                            <td>
                                                {o.orderitems.map((i, idx) => (
                                                    <div key={idx}>• {i.itemName} ({i.count}개) - {(i.orderPrice).toLocaleString()}원</div>
                                                ))}
                                            </td>
                                            <td><strong>{tCount}개</strong></td>
                                            <td>{tPrice.toLocaleString()}원</td>
                                            <td>{o.deliveryStatus || '공급대기'}</td>
                                        </tr>
                                    );
                                }) : <tr><td colSpan="6">조건에 맞는 주문이 없습니다.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* [최종 배송 완료 목록] */}
             {/* [최종 배송 완료 목록] */}
            <div className="admin-content-box">
                <div className="admin-action-row">
                <h3>✅ 최종 배송 완료 목록[O.S=PURCHASED,D.S=COMPLETED인 ordersDB]</h3>
                
                 <div className="admin-btn-right">
                    <button
                        className="admin-move-page-btn"
                        onClick={downloadCompletedOrdersExcel}
                    >엑셀 다운로드</button>
                </div>
                </div>
                
                <table className="admin-table-style">
                    <thead><tr>
                <th>번호</th>
                <th>상품</th>
                <th>수량</th>
                <th>판매 금액</th>
                <th>담당 기사</th>
                <th>상태</th>
                <th>주문일</th>
            </tr></thead>
                    <tbody>
            {pagedCompleted.map((order, index) => {
                const totalOrderPrice = order.orderitems?.reduce((sum, item) => {
                    return sum + ((item.orderPrice || 0) * (item.count || 0));
                }, 0) || 0;

                return (
                    <tr key={order.orderId}>
                        <td>{(page6 - 1) * perPage6 + index + 1}</td>
                        <td>{renderItemName(order.orderitems)}</td>
                        <td>{order.orderitems?.reduce((sum, item) => sum + item.count, 0) || 0}개</td>
                        <td><strong>{totalOrderPrice.toLocaleString()}원</strong></td>
                        <td><span>{items.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName || "담당 기사"}</span></td>
                        <td><span>배송완료</span></td>
                        <td>{order.orderDate?.split('T')[0]}</td>
                    </tr>
                );
            })}
            {pagedCompleted.length === 0 && <tr><td colSpan="7">배송 완료된 주문이 없습니다.</td></tr>}
        </tbody>
    </table>

    {/* 💡 테이블 바로 밑(주문일 라인 아래)에 전체 판매 금액 토탈 바 추가 */}
    {completedOrders.length > 0 && (
        <div>
            <span>📈 배송 완료 총 판매 금액 (Total)</span>
            <span>
                {completedOrders.reduce((grandTotal, order) => {
                    const orderSum = order.orderitems?.reduce((sum, item) => sum + ((item.orderPrice || 0) * (item.count || 0)), 0) || 0;
                    return grandTotal + orderSum;
                }, 0).toLocaleString()}원
            </span>
        </div>
    )}
</div>

            {/* [반품/교환 픽업 신청 목록] */}
            <div className="admin-content-box">
                <div className="admin-action-row">
                <h3>🔄 반품/교환 픽업 신청 목록[O.S=EXCHANGEorREFUND/CANCEL,D.S=COMPLETED/PICKUP인 ordersDB]</h3>

                <div className="admin-btn-right">
                    <button 
                    className="admin-move-page-btn"
                    onClick={() => setPickupFilter('ALL')}>전체</button>
                    <button 
                    className="admin-move-page-btn"
                    onClick={() => setPickupFilter('EXCHANGEorREFUND')}>교환/반품</button>
                    <button 
                    className="admin-move-page-btn"
                    onClick={() => setPickupFilter('CANCEL')}>취소</button>
                </div>
                </div>

                {selectedPickupIds.length > 0 && (
                    <div>
                        선택된 반품/교환 건: {selectedPickupIds.length}건
                    </div>
                )}

                <table className="admin-table-style">
                    <thead>
                        <tr>
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
                                    <td><span>{order.orderState === 'EXCHANGEorREFUND' ? '교환/반품 접수' : '취소 접수'}</span></td>
                                    <td>
                                        {order.deliveryId && order.deliveryStatus === 'PICKUP' ? (
                                            <div>
                                                <strong>{items.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName} 기사님 </strong>
                                                <span>(픽업 배정 완료)</span>
                                            </div>
                                        ) : (
                                            <>
                                                <select value={selectedDrivers[order.orderId] || ""} onChange={(e) => handleDriverSelect(order.orderId, e.target.value)}>
                                                    <option value="">픽업 기사 선택</option>
                                                    {items.map(driver => <option key={driver.deliveryId} value={driver.deliveryId}>{driver.deliveryName}</option>)}
                                                </select>
                                                <button onClick={() => handleAssignDriver(order.orderId, 'PICKUP')}>픽업 배정</button>
                                            </>
                                        )}
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