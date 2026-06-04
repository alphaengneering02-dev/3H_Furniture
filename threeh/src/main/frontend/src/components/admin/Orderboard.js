import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import '../../css/adminCss/AdminDashboard.css';

const Orderboard = ({
    orders = [],
    drivers = [], 
    selectedDrivers = {},
    handleDriverSelect,
    handleAssignDriver,
    handleStatusChange
}) => {
    /* 각 테이블별 페이지 기본값 */
    const [perPage2, setPerPage2] = useState(5); const [page2, setPage2] = useState(1);
    const [perPage3, setPerPage3] = useState(5); const [page3, setPage3] = useState(1);
    const [perPage4, setPerPage4] = useState(5); const [page4, setPage4] = useState(1);
    const [perPage5, setPerPage5] = useState(5); const [page5, setPage5] = useState(1);
    const [perPage6, setPerPage6] = useState(5); const [page6, setPage6] = useState(1);

    const [selectedPickupIds, setSelectedPickupIds] = useState([]);
    const [pickupFilter, setPickupFilter] = useState('ALL');
    const [showSpecialList, setShowSpecialList] = useState(false);
    const [selectedPickupDrivers, setSelectedPickupDrivers] = useState({});
    const handlePickupDriverSelect = (orderId, driverId) => {
        setSelectedPickupDrivers(prev => ({
            ...prev,
            [orderId]: driverId
        }));
    };

    const handleAssignPickup = async (orderId) => {
        const deliveryId = selectedPickupDrivers[orderId];
        if (!deliveryId) {
            toast.warn("배정할 픽업 기사님을 선택해주세요.");
            return;
        }

        try {
            // 프로젝트 설정에 따라 필요시 URL 앞에 '/admin' 이나 '/api'를 붙이세요.
            const response = await fetch(`/admin/orders/${orderId}/assign-pickup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deliveryId: deliveryId.toString() }),
            });

            const resultText = await response.text();

            if (response.ok) {
                toast.success("🚚 픽업 기사 배정 및 PICKUP 전환 완료!");
                // 데이터 갱신을 위해 브라우저 새로고침 (또는 부모 갱신 함수 호출 권장)
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error(`배정 실패: ${resultText}`);
            }
        } catch (error) {
            console.error("픽업 배정 중 오류 발생:", error);
            toast.error("서ver 통신 중 오류가 발생했습니다.");
        }
    };

    const renderItemName = (itemsList) => {
        if (!itemsList || itemsList.length === 0) return '';
        const firstName = itemsList[0].itemName;
        const extraCount = itemsList.length - 1;
        return extraCount > 0 ? `${firstName} 외 ${extraCount}개 상품` : firstName;
    };

    const normalizedOrders = [...orders].map(o => {
    let rawState = o.orderState || o.ORDER_STATE || '';
    let state = rawState.toString().trim(); 

    let dStatus = o.deliveryStatus || o.DELIVERY_STATUS || '';
    const trimmedStatus = dStatus.toString().trim();
    
    if (
        trimmedStatus === '배송중' || 
        trimmedStatus === '배송 진행중' || 
        trimmedStatus.toUpperCase() === 'SHIPPING'
    ) {
        dStatus = 'SHIPPING';
    }

    return {
        ...o,
        orderId: o.orderId || o.ORDER_ID,
        orderState: state,
        deliveryStatus: dStatus,
        deliveryId: o.deliveryId || o.DELIVERY_ID,
        deliveryAddr: o.deliveryAddr || o.DELIVERY_ADDR,
        deliveryAddrDetail: o.deliveryAddrDetail || o.DELIVERY_ADDR_DETAIL,
        orderDate: o.orderDate || o.ORDER_DATE,
        orderitems: o.orderitems || o.orderItems || o.ITEMS || [],
        memberName: o.memberName || o.MEMBER_NAME
    };
}).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    // 💡 엑셀 다운로드 함수
    const downloadCompletedOrdersExcel = () => {
        if (completedOrders.length === 0) {
            toast.error("다운로드할 배송 완료 주문이 없습니다.");
            return;
        }

        const excelData = completedOrders.map((order, index) => {
            const totalOrderPrice = order.orderitems?.reduce((sum, item) => {
                return sum + ((item.orderPrice || 0) * (item.count || 0));
            }, 0) || 0;

            const driverName = drivers.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName || "담당 기사";

            return {
                "번호": index + 1,
                "주문ID": order.orderId,
                "구매자": order.memberName,
                "상품명": renderItemName(order.orderitems),
                "총 수량": (order.orderitems?.reduce((sum, item) => sum + item.count, 0) || 0) + "개",
                "판매 금액": totalOrderPrice.toLocaleString() + "원",
                "담당 기사": driverName,
                "배송 상태": "배송완료",
                "주문일": order.orderDate?.split('T')[0] || ""
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "배송완료목록");

        const maxLen = excelData.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => v.toString().length)), 10);
        worksheet["!cols"] = Array(Object.keys(excelData[0]).length).fill({ wch: maxLen + 2 });

        XLSX.writeFile(workbook, `최종_배송_완료_목록_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const specialOrders = normalizedOrders.filter(o => {
        const totalCount = o.orderitems?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
        return totalCount >= 2;
    });

    const downloadCSV = () => {
        if (specialOrders.length === 0) {
            toast.error("다운로드할 데이터가 없습니다.");
            return;
        }

        let csvContent = "\uFEFF"; 
        csvContent += "주문번호,주문자,총수량,상품상세(셀내 줄바꿈),판매금액,배송상태,주문일\n";

        specialOrders.forEach(o => {
            const totalCount = o.orderitems?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
            const totalPrice = o.orderitems?.reduce((sum, item) => sum + ((item.orderPrice || 0) * (item.count || 0)), 0) || 0;
            
            const itemDetails = o.orderitems
                .map(i => `• ${i.itemName.replace(/"/g, ' ')} (${i.count}개)`)
                .join('\n');

            csvContent += `${o.orderId},${o.memberName || '미상'},${totalCount},"${itemDetails}",${totalPrice},${o.deliveryStatus || '미정'},${o.orderDate?.split('T')[0]}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `대량주문목록${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const assignedOrders = normalizedOrders.filter(o => o.deliveryId && o.deliveryStatus === 'WAITING');

const unassignedOrders = normalizedOrders.filter(o => { 
    const isReady = o.orderState === 'READY' || o.orderState === '배송 준비중'; 
    const currentStatus = o.deliveryStatus;
    return isReady && (!currentStatus || currentStatus === '수락' || currentStatus === 'ACCEPTED');
});

const shippingOrders = normalizedOrders.filter(o => o.deliveryStatus === 'SHIPPING');

// ✨ 픽업 필터
const pickupOrders = normalizedOrders.filter(o => {
    const currentState = String(o.orderState).trim().toUpperCase();
    return currentState === 'EXCHANGEORREFUND' || currentState === '교환또는환불';
});

// 최종 배송 완료 필터
const completedOrders = normalizedOrders.filter(o => {
    const currentState = String(o.orderState).trim().toUpperCase();
    const currentDeliveryStatus = String(o.deliveryStatus).trim().toUpperCase();

    // 조건 1: 일반 구매확정 건 (PURCHASED + COMPLETED)
    const isNormalSuccess = 
        (currentState === 'PURCHASED' || currentState === '구매확정') && 
        (currentDeliveryStatus === 'COMPLETED' || currentDeliveryStatus === '배송완료');

    // 조건 2: 교환/환불 수거완료 건 (EXCHANGEorREFUND + RECOVERED)
    const isRefundRecovered = 
        (currentState === 'EXCHANGEORREFUND' || currentState === '교환또는환불') && 
        (currentDeliveryStatus === 'RECOVERED' || currentDeliveryStatus === '수거완료');

    // 조건 3: 교환/환불 완료 후 최종 구매확정 건 (PURCHASED + RECOVERED) ✨새로 추가!
    const isRefundPurchased = 
        (currentState === 'PURCHASED' || currentState === '구매확정') && 
        (currentDeliveryStatus === 'RECOVERED' || currentDeliveryStatus === '수거완료');

    // 세 조건 중 하나라도 만족하면 목록에 포함시킵니다.
    return isNormalSuccess || isRefundRecovered || isRefundPurchased;
});

// 3. 페이지네이션 슬라이스 구간 (변동되는 데이터 개수에 즉각 유기적으로 대응)
const pagedAssigned = assignedOrders.slice((page2 - 1) * perPage2, page2 * perPage2);
const pagedUnassigned = unassignedOrders.slice((page3 - 1) * perPage3, page3 * perPage3);
const pagedShipping = shippingOrders.slice((page4 - 1) * perPage4, page4 * perPage4);
const pagedPickup = pickupOrders.slice((page5 - 1) * perPage5, page5 * perPage5);
const pagedCompleted = completedOrders.slice((page6 - 1) * perPage6, page6 * perPage6);

    React.useEffect(() => {
    console.log("================ [주문 데이터 디버깅] ================");
    console.log("1. 전체 orders 원본 개수:", orders?.length);
    
    if (orders && orders.length > 0) {
        console.log("2. 현재 들어온 모든 주문들의 실제 orderState 목록:");
        orders.forEach((o, i) => {
            console.log(`   [주문 ${i+1}] ID: ${o.orderId || o.ORDER_ID} | 상태값(원본): "${o.orderState || o.ORDER_STATE}"`);
        });
        
        console.log("3. normalizedOrders 변환 후 상태값 목록:");
        normalizedOrders.forEach((o, i) => {
            console.log(`   [변환 후 ${i+1}] ID: ${o.orderId} | 상태값: "${o.orderState}"`);
        });
    } else {
        console.warn("⚠️ 부모 컴포넌트로부터 orders 배열이 빈 값([])으로 넘어왔습니다.");
    }
    
    console.log("4. 필터링된 pickupOrders 결과:", pickupOrders);
    console.log("=====================================================");
}, [orders]);

    return (
        <div>
            {/* [배송 미배정 목록] */}
            <div className="admin-content-box">
                <div className="admin-order-headerM">
                    <h3>배송 미배정 목록</h3>
                </div>
                <div className="admin-table-scroll">
                    <table className="admin-table-style">
                        <thead>
                            <tr><th>번호</th><th>상품</th><th>수량</th><th>주소</th><th>기사 배정 및 상태</th><th>주문일</th></tr>
                        </thead>
                        <tbody>
                            {pagedUnassigned.length > 0 ? pagedUnassigned.map((order, index) => {
                                const currentItems = order.orderitems || [];
                                const assignedDriver = drivers.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName;
                                return (
                                    <tr key={order.orderId}>
                                        <td>{(page3 - 1) * perPage3 + index + 1}</td>
                                        <td>{renderItemName(currentItems)}</td>
                                        <td>{currentItems.reduce((sum, i) => sum + (i.count || 0), 0)}개</td>
                                        <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                        <td>
                                            {order.deliveryId && (!order.deliveryStatus || order.deliveryStatus === 'WAITING_FOR_ACCEPT') ? (
                                                <div className="status-waiting-box"><strong>{assignedDriver} 기사님 </strong><span>수락 대기중</span></div>
                                            ) : (
                                                <div className="driver-select-box">
                                                    <select value={selectedDrivers[order.orderId] || ""} onChange={(e) => handleDriverSelect(order.orderId, e.target.value)}>
                                                        <option value="">기사 선택</option>
                                                        {drivers.map(driver => <option key={driver.deliveryId} value={driver.deliveryId}>{driver.deliveryName}</option>)}
                                                    </select>
                                                    <button type='button' onClick={() => handleAssignDriver(order.orderId)}>배정</button>
                                                </div>
                                            )}
                                        </td>
                                        <td>{order.orderDate?.split('T')[0]}</td>
                                    </tr>
                                );
                            }) : <tr><td colSpan="6">배정할 주문이 없습니다.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* [배송 배정 완료 목록] */}
            <div className="admin-content-box">
                <div className="admin-table-scroll">          
                    <div className="admin-order-headerM">
                        <h3>배송 배정 완료 목록</h3>
                    </div>
                    <table className="admin-table-style">
                        <thead>
                            <tr><th>번호</th><th>상품</th><th>배송지</th><th>배정된 기사</th><th>상태</th><th>주문일</th></tr>
                        </thead>
                        <tbody>
                            {pagedAssigned.map((order, index) => (
                                <tr key={order.orderId}>
                                    <td>{(page2 - 1) * perPage2 + index + 1}</td>
                                    <td>{renderItemName(order.orderitems)}</td>
                                    <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                    <td><strong>{drivers.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName || "지정 기사"}</strong></td>
                                    <td><span>배송 대기중</span></td>
                                    <td>{order.orderDate?.split('T')[0]}</td>
                                </tr>
                            ))}
                            {assignedOrders.length === 0 && <tr><td colSpan="6">배정 완료된 주문이 없습니다.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* [배송 진행 중 목록] */}
            <div className="admin-content-box">
                <div className="admin-table-scroll">          
                    <div className="admin-order-headerM">
                        <h3>🚚 배송 진행 중 목록</h3>
                    </div>
                    <table className="admin-table-style">
                        <thead>
                            <tr><th>번호</th><th>상품</th><th>수량</th><th>주소</th><th>배정 기사</th><th>상태</th><th>주문일</th></tr>
                        </thead>
                        <tbody>
                            {pagedShipping.map((order, index) => (
                                <tr key={order.orderId}>
                                    <td>{(page4 - 1) * perPage4 + index + 1}</td>
                                    <td>{renderItemName(order.orderitems)}</td>
                                    <td>{order.orderitems?.reduce((sum, item) => sum + item.count, 0) || 0}개</td>
                                    <td>{order.deliveryAddr} {order.deliveryAddrDetail}</td>
                                    <td><strong>{drivers.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName || "배정 기사"}</strong></td>
                                    <td><span>배송중</span></td>
                                    <td>{order.orderDate?.split('T')[0]}</td>
                                </tr>
                            ))}
                            {shippingOrders.length === 0 && <tr><td colSpan="7">배송 진행 중인 주문이 없습니다.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* [대량 주문 조회] */}
            <div className="admin-content-box">
                <div className="admin-table-scroll">
                    <div className="admin-order-header">
                        <div className="admin-order-top-row">
                            <div>
                                <h4>📦 대량 주문 조회</h4>
                                <p>현재 대상 건수: <strong>{specialOrders.length}건</strong></p>
                            </div>
                            <div className="admin-action-button-group admin-order-bottom-row">
                                <button className="admin-move-page-btn" onClick={() => setShowSpecialList(!showSpecialList)}>
                                    {showSpecialList ? "목록 닫기" : "상세 목록 보기"}
                                </button>
                                <button className="admin-move-page-btn" onClick={downloadCSV}>
                                    Excel(CSV) 다운로드
                                </button>
                            </div>
                        </div>
                    </div>

                    {showSpecialList && (
                        <table className="admin-table-style">
                            <thead>
                                <tr><th>주문ID</th><th>주문자</th><th>상품 상세 내역</th><th>총 수량</th><th>총 금액</th><th>상태</th></tr>
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
                                                    <div key={idx}>• {i.itemName} ({i.count}개)</div>
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
                    )}
                </div>
            </div>

            {/* [최종 배송 완료 목록] */}
            <div className="admin-content-box">
                <div className="admin-order-header">
                    <div className="admin-order-top-row">
                        <h3>✅ 최종 배송 완료 목록</h3>
                        <div className="admin-action-button-group">
                            <button className="admin-move-page-btn" onClick={downloadCompletedOrdersExcel}>엑셀 다운로드</button>
                        </div>
                    </div>
                </div>

                <div className="admin-table-scroll">
                    <table className="admin-table-style">
                        <thead>
                            <tr><th>번호</th><th>상품</th><th>수량</th><th>판매 금액</th><th>주문자</th><th>상태</th><th>주문일</th></tr>
                        </thead>
                        <tbody>
                            {pagedCompleted.map((order, index) => {
                                const totalOrderPrice = order.orderitems?.reduce((sum, item) => sum + ((item.orderPrice || 0) * (item.count || 0)), 0) || 0;
                                return (
                                    <tr key={order.orderId}>
                                        <td>{(page6 - 1) * perPage6 + index + 1}</td>
                                        <td>{renderItemName(order.orderitems)}</td>
                                        <td>{order.orderitems?.reduce((sum, item) => sum + item.count, 0) || 0}개</td>
                                        <td><strong>{totalOrderPrice.toLocaleString()}원</strong></td>
                                        <td><span>{order.memberName}</span></td>
                                        <td>
    {(() => {
        const dStatus = String(order.deliveryStatus).toUpperCase();
        const oState = String(order.orderState).toUpperCase();

        if (dStatus === 'RECOVERED' || dStatus === '수거완료') {
            if (oState === 'EXCHANGEORREFUND' || oState === '교환또는환불') {
                return <span style={{ color: '#e67e22', fontWeight: 'bold' }}>🔄 수거완료</span>;
            }
            // 수거 완료 후 최종 구매확정까지 끝난 상태
            return <span style={{ color: '#9b59b6', fontWeight: 'bold' }}>🎉 환불/교환확정</span>;
        } 
        
        // 일반 배송 완료 및 구매 확정
        return <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>✅ 배송완료</span>;
    })()}
</td>
                                        <td>{order.orderDate?.split('T')[0]}</td>
                                    </tr>
                                );
                            })}
                            {pagedCompleted.length === 0 && <tr><td colSpan="7">배송 완료된 주문이 없습니다.</td></tr>}
                        </tbody>
                    </table>

                    {completedOrders.length > 0 && (
                        <div style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', display: 'flex', justifyContent: 'space-between' }}>
                            <span>grandTotal 📈 배송 완료 총 판매 금액 (Total)</span>
                            <strong>
                                {completedOrders.reduce((grandTotal, order) => {
                                    const orderSum = order.orderitems?.reduce((sum, item) => sum + ((item.orderPrice || 0) * (item.count || 0)), 0) || 0;
                                    return grandTotal + orderSum;
                                }, 0).toLocaleString()}원
                            </strong>
                        </div>
                    )}
                </div>
            </div>

            {/* [반품/교환 픽업 신청 목록] */}
<div className="admin-content-box">
    <div className="admin-order-top-row">
        <h3>🔄 반품/교환 픽업 신청 목록</h3>
                </div>
                <div className="admin-action-button-group" style={{ marginBottom: '10px' }}>
                    <button className="admin-move-page-btn" onClick={() => setPickupFilter('ALL')}>전체 보기</button>
                </div>
                <div className="admin-table-scroll">
                    <table className="admin-table-style">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>주문ID</th>
                                <th>상품</th>
                                <th>주문 상태</th>
                                <th>현재 배송 상태</th>
                                <th>픽업 기사 배정</th> {/* 💡 버튼 배정을 위한 헤더 추가 */}
                            </tr>
                        </thead>
                        <tbody>
                            {pagedPickup.length > 0 ? (
                                pagedPickup.map((order, index) => {
                                    // 이 주문에 지정된 기사명이 있는지 확인
                                    const currentDriver = drivers.find(d => d.deliveryId === Number(order.deliveryId))?.deliveryName;

                                    return (
                                        <tr key={order.orderId}>
                                            <td>{(page5 - 1) * perPage5 + index + 1}</td>
                                            <td>{order.orderId}</td>
                                            <td>{renderItemName(order.orderitems)}</td>
                                            <td><span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{order.orderState}</span></td>
                                            <td>
                                                {order.deliveryStatus === 'PICKUP' ? (
                                                    <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>🔄 기사 수거중</span>
                                                ) : (
                                                    <span>{order.deliveryStatus || 'COMPLETED (배송완료)'}</span>
                                                )}
                                            </td>
                                            <td>
                                                {/* 💡 deliveryStatus가 아직 PICKUP이 아니라면 배정 선택창과 버튼을 보여줍니다. */}
                                                {order.deliveryStatus !== 'PICKUP' ? (
        <div className="driver-select-box" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            
            {/* ✨ [추가] 배송 완료했던 기사 정보 안내 (ID와 이름 함께 표시) */}
            <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '2px' }}>
                📦 기존 배송 기사: {order.deliveryId ? `[ID: ${order.deliveryId}] ${currentDriver || '확인 불가'}` : '기록 없음'}
            </div>

            <div style={{ display: 'flex', gap: '5px' }}>
                <select 
                    value={selectedPickupDrivers[order.orderId] || ""} 
                    onChange={(e) => handlePickupDriverSelect(order.orderId, e.target.value)}
                    style={{ padding: '4px', fontSize: '13px' }}
                >
                    <option value="">픽업 기사 선택</option>
                    {drivers.map(driver => (
                        <option key={driver.deliveryId} value={driver.deliveryId}>
                            [{driver.deliveryId}] {driver.deliveryName}
                        </option>
                    ))}
                </select>
                <button 
                    type='button' 
                    style={{ backgroundColor: '#e67e22', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }} 
                    onClick={() => handleAssignPickup(order.orderId)}
                >
                    픽업 배정
                </button>
            </div>
        </div>
    ) : (
        <div className="status-waiting-box">
            <strong>{currentDriver || "담당 기사"} {order.deliveryId && `(ID: ${order.deliveryId})`} </strong>
            <span style={{ color: '#e67e22', marginLeft: '4px' }}>수거 진행 중</span>
        </div> 
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6">반품/교환 신청 목록이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Orderboard;