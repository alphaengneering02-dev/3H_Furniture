import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDriverAuto } from './DriverAuto';
import '../../css/adminCss/AdminDashboard.css';

/* 스타일 핸들러 (기존 Orderboard 기능 그대로 복구) */
const getOrderStateStyle = (orderState, deliveryStatus) => {
    if (deliveryStatus === 'WAITING') return { color: '#7B1FA2', fontWeight: 'bold' };
    switch(orderState) {
        case 'ORDER': case '주문': return { color: '#1976D2', fontWeight: 'bold' };
        case 'READY': case '배송 준비중': return { color: '#F57C00', fontWeight: 'bold' };
        case 'PURCHASED': return { color: '#2E7D32', fontWeight: 'bold' };
        case 'EXCHANGEorREFUND': return { color: '#E65100', fontWeight: 'bold' };
        case 'CANCEL': return { color: '#C62828', fontWeight: 'bold' };
        default: return { color: '#555' };
    }
};

const getDeliveryStatusStyle = (status) => {
    switch(status) {
        case 'WAITING': return { color: '#7B1FA2', fontWeight: 'bold' };
        case 'SHIPPING': return { color: '#009688', fontWeight: 'bold' };
        case 'COMPLETED': return { color: '#616161', fontWeight: 'bold' };
        case 'REJECTED': return { color: '#D32F2F', fontWeight: 'bold' };
        case 'PICKUP': return { color: '#E040FB', fontWeight: 'bold' };
        default: return { color: '#777' };
    }
};

/* 회원 정보 셀 컴포넌트 */
const MemberNameCell = ({ memberName }) => <span>{memberName || '비회원'}</span>;

const OrderMemberInfoCell = ({ memberId, type }) => {
    const [info, setInfo] = useState({ phone: '조회 중...', email: '조회 중...' });

    useEffect(() => {
        if (!memberId) {
            setInfo({ phone: '비회원', email: '비회원' });
            return;
        }
        axios.get(`/api/member/seq/${memberId}`, { withCredentials: true })
            .then(res => {
                const rawEmail = res.data?.email || '';
                const rawPhone = res.data?.phone || '번호 없음';
                if (rawEmail.includes('kakao')) {
                    setInfo({ phone: 'kakao', email: 'kakao' });
                } else {
                    setInfo({ phone: rawPhone, email: rawEmail || '이메일 없음' });
                }
            })
            .catch(err => {
                console.error(`${memberId}번 회원 조회 실패:`, err);
                setInfo({ phone: '확인 불가', email: '확인 불가' });
            });
    }, [memberId]);

    return <span>{type === 'email' ? info.email : info.phone}</span>;
};

/* 페이지네이션 컴포넌트 */
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
    items = [], // 기사 리스트
    handleDriverSelect,
    handleAssignDriver,
    handleStatusChange
}) => {
    // 1. DB 전체에서 데이터를 받아올 상태 관리
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [perPage1, setPerPage1] = useState(5); 
    const [page1, setPage1] = useState(1);

    // 2. 컴포넌트 마운트 시 전체 주문(orders) DB 호출
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/orders'); // 백엔드 엔드포인트에 맞게 수정하세요
            setOrders(response.data);
        } catch (error) {
            console.error("전체 주문 데이터 로드 실패:", error);
            alert("주문 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const { handleAutoAssign } = useDriverAuto({
        orders, items, selectedOrderIds, setSelectedOrderIds, handleDriverSelect, handleAssignDriver
    });

    const renderItemName = (itemsList) => {
        if (!itemsList || itemsList.length === 0) return '';
        const firstName = itemsList[0].itemName || itemsList[0].ITEMNAME;
        const extraCount = itemsList.length - 1;
        return extraCount > 0 ? `${firstName} 외 ${extraCount}개 상품` : firstName;
    };

    // 3. ✨ 기존 오리지널 필터 복구: 체크박스 전체 선택이 가능한 대상 정의 (COMPLETED 제외)
    const selectableOrders = orders.filter(o => {
        const status = o.deliveryStatus || o.DELIVERY_STATUS;
        return status !== 'COMPLETED';
    });

    // 4. ✨ 오리지널 복구: 첫 번째 테이블은 필터링 없이 전/체/주/문(orders) 배열을 그대로 슬라이스합니다.
    const pagedOrders = orders.slice((page1 - 1) * perPage1, page1 * perPage1);

    const renderOrderType = (type) => {
        if (type === 'DELIVERY_WITH_INSTALLATION') return '*설치 배송*';
        if (type === 'DELIVERY_ONLY') return '*일반 배송*';
        return type || '-';
    };

    const renderDeliveryStatus = (status) => {
        if (status === 'WAITING') return '배송 대기 (WAITING)';
        if (status === 'SHIPPING') return '배송중 (SHIPPING)';
        if (status === 'COMPLETED') return '배송 완료 (COMPLETED)';
        if (status === 'REJECTED') return '배송 거절 (REJECTED)';
        if (status === 'PICKUP') return '회수/픽업 (PICKUP)';
        return status || '-';
    };

    const handleCheckOrder = (orderId) => {
        setSelectedOrderIds(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
    };

    const handleAllCheck = (e) => {
        setSelectedOrderIds(e.target.checked ? selectableOrders.map(o => o.orderId || o.ORDER_ID) : []);
    };

    const handleBulkReady = async () => {
        if (selectedOrderIds.length === 0) { alert('변경할 주문을 선택해주세요.'); return; }
        if (window.confirm(`선택한 ${selectedOrderIds.length}건을 '상품준비완료(READY)' 상태로 변경하시겠습니까?`)) {
            for (const id of selectedOrderIds) {
                await handleStatusChange(id, 'READY');
            }
            setSelectedOrderIds([]);
            fetchOrders(); // 처리 후 DB 데이터 갱신
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
                            <th>
                                <input 
                                    type="checkbox" 
                                    onChange={handleAllCheck} 
                                    checked={selectableOrders.length > 0 && selectableOrders.every(o => selectedOrderIds.includes(o.orderId || o.ORDER_ID))}
                                />
                            </th>
                            <th>주문 번호</th><th>주문자</th><th>연락처</th><th>E-mail</th><th>상품</th><th>수량</th><th>주문 타입</th><th>주소</th><th>주문 상태</th><th>배송 상태</th><th>주문일</th><th>배송 신청일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="13" style={{textAlign: 'center'}}>데이터를 불러오는 중입니다...</td></tr>
                        ) : pagedOrders.length > 0 ? (
                            pagedOrders.map(order => {
                                const exactMemberId = order.MEMBER_ID || order.memberId || order.member_id;
                                const currentItems = order.orderitems || order.orderItems || order.ORDERITEMS || [];
                                return (
                                    <tr key={order.orderId || order.ORDER_ID}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedOrderIds.includes(order.orderId || order.ORDER_ID)} 
                                                onChange={() => handleCheckOrder(order.orderId || order.ORDER_ID)}
                                            />
                                        </td>
                                        <td>{order.orderId || order.ORDER_ID}</td>
                                        <td><strong><MemberNameCell memberName={order.memberName || order.MEMBER_NAME} /></strong></td>
                                        <td><OrderMemberInfoCell memberId={exactMemberId} type="phone" /></td>
                                        <td><OrderMemberInfoCell memberId={exactMemberId} type="email" /></td>
                                        <td>{renderItemName(currentItems)}</td>
                                        <td>{currentItems.reduce((sum, item) => sum + (item.count || item.COUNT || 0), 0) || 0}개</td>
                                        <td>{renderOrderType(order.orderType || order.ORDER_TYPE)}</td>
                                        <td>{order.deliveryAddr || order.DELIVERY_ADDR} {order.deliveryAddrDetail || order.DELIVERY_ADDR_DETAIL}</td>
                                        <td>
                                            <span style={getOrderStateStyle(order.orderState || order.ORDER_STATE, order.deliveryStatus || order.DELIVERY_STATUS)}>
                                                {order.orderState || order.ORDER_STATE}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={getDeliveryStatusStyle(order.deliveryStatus || order.DELIVERY_STATUS)}>
                                                {renderDeliveryStatus(order.deliveryStatus || order.DELIVERY_STATUS)}
                                            </span>
                                        </td>
                                        <td>{(order.orderDate || order.ORDER_DATE)?.split('T')[0]}</td>
                                        <td>{order.installDate || order.INSTALL_DATE || '-'}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="13" style={{textAlign: 'center'}}>접수된 주문 내역이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
                {!loading && <TablePagination totalItems={orders.length} itemsPerPage={perPage1} currentPage={page1} setCurrentPage={setPage1} />}
            </div>
        </div>
    );
};

export default AllOrderboard;