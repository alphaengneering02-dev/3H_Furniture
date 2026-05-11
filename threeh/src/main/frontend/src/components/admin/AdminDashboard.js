import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';


const AdminDashboard = () => {

    const [memo1, setMemo1] = useState('');
    const memoRef = useRef(null);

    const saveMemo = () => {
        localStorage.setItem("memo_textarea", memo1);
        localStorage.setItem("memo_editor", memoRef.current.innerHTML);
    };

    const handleBulletKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const newLine = document.createElement("div");
            newLine.innerHTML = "• ";

            memoRef.current.appendChild(newLine);

            const range = document.createRange();
            const sel = window.getSelection();

            range.setStart(newLine, 1);
            range.collapse(true);

            sel.removeAllRanges();
            sel.addRange(range);
        }
    };

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const days = ['일', '월', '화', '수', '목', '금', '토'];

        return `${month}-${day}(${days[date.getDay()]})`;
    };

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${hours}:${minutes}`;
    };

    const [orders, setOrders] = useState([
        {
            orderId: 1,
            orderitems: [
                { itemName: '의자', count: 2 },
                { itemName: '책상', count: 1 }
            ],
            deliveryAddr: '서울시 강남구',
            deliveryAddrDetail: '101호',
            orderSate: 'ORDER',
            orderDate: '2023-10-27T10:00:00',
            deliveryDate: '-'
        }
    ]);

    const [items, setItems] = useState([]);

    const fetchDeliveries = async () => {
        try {
            const response = await axios.get('/admin/list');
            setItems(response.data);
        } catch (error) {
            console.error("기사 리스트 로드 실패:", error);
        }
    };

    const handleDeleteDelivery = async (deliveryId) => {
        if (!window.confirm("정말 이 기사를 삭제하시겠습니까?")) return;

        try {
            await axios.delete(`/admin/delivery-companies/${deliveryId}`);
            alert("삭제되었습니다.");
            // 리스트 새로고침
            fetchDeliveries(); 
        } catch (error) {
            console.error("삭제 실패:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // 2. 기사 수정 페이지 이동 (또는 모달 호출)
    const handleEditDelivery = (deliveryId) => {
        // 상황에 맞게 구현: 페이지 이동 시 useNavigate() 사용
        // window.location.href = `/admin/edit-delivery/${deliveryId}`; 
        alert(`수정 페이지로 이동하거나 모달을 띄웁니다. ID: ${deliveryId}`);
    };



    useEffect(() => {
        fetchDeliveries();
    }, []);

    useEffect(() => {
        const savedTextarea = localStorage.getItem("memo_textarea");
        const savedEditor = localStorage.getItem("memo_editor");

        if (savedTextarea) setMemo1(savedTextarea);

        if (savedEditor && memoRef.current) {
            memoRef.current.innerHTML = savedEditor;
        }
    }, []);

    const renderItemName = (items) => {
        if (items.length === 0) return '';

        const firstName = items[0].itemName;
        const extraCount = items.length - 1;

        return extraCount > 0
            ? `${firstName} 외 ${extraCount}개 상품`
            : firstName;
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.orderId === orderId
                        ? { ...order, orderSate: newStatus }
                        : order
                )
            );
        } catch (error) {
            alert("상태 업데이트 실패");
        }
    };

    return (
        <div className="dashboard-container">

            {/* 왼쪽 */}
            <div className="side-box">

                <div className="date-text">
                    {formatDate(currentTime)}
                </div>

                <div className="time-text">
                    {formatTime(currentTime)}
                </div>

                <textarea
                    value={memo1}
                    onChange={(e) => setMemo1(e.target.value)}
                    placeholder="메모를 입력하세요"
                    className="memo-textarea"
                />

                <button onClick={saveMemo} className="save-btn">
                    메모 저장
                </button>

                <div
                    ref={memoRef}
                    contentEditable
                    onKeyDown={handleBulletKeyDown}
                    suppressContentEditableWarning
                    className="memo-editor"
                >
                    <div>• </div>
                </div>

            </div>

            {/* 오른쪽 */}
            <div className="main-content">

                <h1>Admin Dashboard</h1>

                <div className="button-group">
                    <button>상품 등록</button>
                    <button>상품 수정</button>
                </div>

                {/* 주문 목록 */}
                <div className="content-box">

                    <h3>주문 목록</h3>

                    <table className="table-style">

                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>상품</th>
                                <th>수량</th>
                                <th>주소</th>
                                <th>상태</th>
                                <th>주문일</th>
                            </tr>
                        </thead>

                        <tbody>

                            {orders.map((order, index) => (

                                <tr key={order.orderId}>

                                    <td>{index + 1}</td>

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
                                        <select
                                            value={order.orderSate}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    order.orderId,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="ORDER">주문완료</option>
                                            <option value="PREPARING">물품준비중</option>
                                            <option value="READY">준비완료</option>
                                        </select>
                                    </td>

                                    <td>
                                        {order.orderDate?.split('T')[0]}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

  {/* 기사 리스트 */}
                <div>
                    <h3>기사 리스트</h3>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th>기사명</th>
                                <th>연락처</th>
                                <th>상태</th>
                                <th>관리</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="3">
                                        등록된 기사가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.deliveryId}>
                                        <td>
                                            {item.deliveryName}
                                        </td>

                                        <td>
                                            {item.deliveryPhone}
                                        </td>

                                        <td>
                                            <b style={{
                                                color:
                                                    item.status === 'WAITING'
                                                        ? 'blue'
                                                        : 'black'
                                            }}>
                                                {item.status}
                                            </b>
                                        </td>

                                        <td>
                                        <button 
                                            onClick={() => handleEditDelivery(item.deliveryId)}
                                            style={{ marginRight: '5px', padding: '2px 8px', cursor: 'pointer' }}
                                        >
                                            수정
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteDelivery(item.deliveryId)}
                                            style={{ padding: '2px 8px', color: 'red', cursor: 'pointer' }}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                    
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 배송 배정 status(SHIPPING)*/}
                <div>
                    <h3>
                        배송 배정
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
                                       배송중(SHIPPING)
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


                {/* 배송 미배정 status(WAITING)*/}
                <div>
                    <h3>
                        배송 미배정
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
                                       상품준비완료 기사님 배정중(WAITING)
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

        </div>
    );
};

export default AdminDashboard;