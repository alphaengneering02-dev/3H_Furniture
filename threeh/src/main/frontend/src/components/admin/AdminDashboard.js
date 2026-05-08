import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import axios from 'axios';

const AdminDashboard = () => {

    const [memo1, setMemo1] = useState('');
    const memoRef = useRef(null);

    const saveMemo = () => {
    localStorage.setItem("memo_textarea", memo1);
    localStorage.setItem("memo_editor", memoRef.current.innerHTML);
};
    // 공통 스타일 정의
    const boxStyle = {
        width: '800px',
        border: '2px solid black',
        marginTop: '1cm',
        padding: '16px'
    };

    const thStyle = {
        border: '1px solid #ddd',
        padding: '10px',
        backgroundColor: '#f4f4f4'
    };

    const tdStyle = {
        border: '1px solid #ddd',
        padding: '10px',
        textAlign: 'center'
    };

    // 왼쪽 사이드 스타일
    const sideBoxStyle = {
        width: '220px',
        minHeight: '900px',
        border: '2px solid black',
        padding: '20px',
        marginRight: '20px'
    };

    const smallBoxStyle = {
        border: '2px solid #555',
        height: '150px',
        marginTop: '20px',
        borderRadius: '10px'
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

    // 현재 시간 상태
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 날짜 포맷
    const formatDate = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const days = ['일', '월', '화', '수', '목', '금', '토'];

        return `${month}-${day}(${days[date.getDay()]})`;
    };

    // 시간 포맷
    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${hours}:${minutes}`;
    };

    // 테스트 데이터
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
            console.log(response.data);
            setItems(response.data);
        } catch (error) {
            console.error("기사 리스트 로드 실패:", error);
        }
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
            console.log(`${orderId}번 주문 상태 변경: ${newStatus}`);

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

        // 전체 가로 배치
        <div style={{ display: 'flex', padding: '20px' }}>

            {/* 왼쪽 긴 박스 */}
            <div style={sideBoxStyle}>

                {/* 날짜 */}
                <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                }}>
                    {formatDate(currentTime)}
                </div>

                {/* 시간 */}
                <div style={{
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: '#1a73e8'
                }}>
                    {formatTime(currentTime)}
                </div>

              
                <textarea
    value={memo1}
    onChange={(e) => setMemo1(e.target.value)}
    placeholder="메모를 입력하세요"
    style={{
        width: '100%',
        height: '150px',
        marginTop: '20px',
        border: '2px solid #555',
        borderRadius: '10px',
        padding: '10px',
        resize: 'none',
        fontSize: '14px',
        boxSizing: 'border-box'
    }}
/><button onClick={saveMemo}>메모 저장</button>

                <div
    ref={memoRef}
    contentEditable
    onKeyDown={handleBulletKeyDown}
    suppressContentEditableWarning
    style={{
        width: '100%',
        minHeight: '150px',
        marginTop: '20px',
        border: '2px solid #555',
        borderRadius: '10px',
        padding: '10px',
        fontSize: '14px',
        boxSizing: 'border-box',
        outline: 'none'
    }}
>
    <div>• </div>
    <button onClick={saveMemo}>메모 저장</button>
</div>


            </div>

            {/* 오른쪽 메인 */}
            <div>

                <h1>Admin Dashboard</h1>

                <div style={{ marginBottom: '10px' }}>
                    <button style={{ marginRight: '5px' }}>상품 등록</button>
                    <button>상품 수정</button>
                </div>

                 {/* 주문 목록 */}
                <div style={boxStyle}>
                    <h3>
                        주문 목록 
                    </h3>

                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>번호</th>
                                <th style={thStyle}>상품</th>
                                <th style={thStyle}>수량</th>
                                <th style={thStyle}>주소</th>
                                <th style={thStyle}>상태</th>
                                <th style={thStyle}>주문일</th>
                                <th style={thStyle}>배송 신청 날짜</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={order.orderId}>

                                    <td style={tdStyle}>
                                        {index + 1}
                                    </td>

                                    <td style={tdStyle}>
                                        {renderItemName(order.orderitems)}
                                    </td>

                                    <td style={tdStyle}>
                                        {
                                            order.orderitems.reduce(
                                                (sum, item) =>
                                                    sum + item.count,
                                                0
                                            )
                                        }개
                                    </td>

                                    <td style={tdStyle}>
                                        {order.deliveryAddr}
                                        {' '}
                                        {order.deliveryAddrDetail}
                                    </td>

                                    <td style={tdStyle}>
                                        <select
                                            value={order.orderSate}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    order.orderId,
                                                    e.target.value
                                                )
                                            }
                                            disabled={
                                                order.orderSate === 'READY' ||
                                                order.orderSate === 'PURCHASED' ||
                                                order.orderSate === 'CANCEL'
                                            }
                                        >
                                            <option value="ORDER">
                                                주문완료
                                            </option>

                                            <option value="PREPARING">
                                                물품준비중
                                            </option>

                                            <option value="READY">
                                                준비완료
                                            </option>
                                        </select>
                                    </td>

                                    <td style={tdStyle}>
                                        {
                                            order.orderDate?.split('T')[0]
                                        }
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>





                {/* 기사 리스트 */}
                <div style={boxStyle}>
                    <h3>기사 리스트</h3>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>기사명</th>
                                <th style={thStyle}>연락처</th>
                                <th style={thStyle}>상태</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={tdStyle}>
                                        등록된 기사가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.deliveryId}>
                                        <td style={tdStyle}>
                                            {item.deliveryName}
                                        </td>

                                        <td style={tdStyle}>
                                            {item.deliveryPhone}
                                        </td>

                                        <td style={tdStyle}>
                                            <b style={{
                                                color:
                                                    item.status === 'WAITING'
                                                        ? 'blue'
                                                        : 'black'
                                            }}>
                                                {item.status}
                                            </b>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 배송 배정 status(SHIPPING)*/}
                <div style={boxStyle}>
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
                                <th style={thStyle}>번호</th>
                                <th style={thStyle}>상품</th>
                                <th style={thStyle}>수량</th>
                                <th style={thStyle}>주소</th>
                                <th style={thStyle}>상태</th>
                                <th style={thStyle}>주문일</th>
                                <th style={thStyle}>배송 신청 날짜</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={order.orderId}>

                                    <td style={tdStyle}>
                                        {index + 1}
                                    </td>

                                    <td style={tdStyle}>
                                        {renderItemName(order.orderitems)}
                                    </td>

                                    <td style={tdStyle}>
                                        {
                                            order.orderitems.reduce(
                                                (sum, item) =>
                                                    sum + item.count,
                                                0
                                            )
                                        }개
                                    </td>

                                    <td style={tdStyle}>
                                        {order.deliveryAddr}
                                        {' '}
                                        {order.deliveryAddrDetail}
                                    </td>

                                    <td style={tdStyle}>
                                       배송중(SHIPPING)
                                    </td>

                                    <td style={tdStyle}>
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
                <div style={boxStyle}>
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
                                <th style={thStyle}>번호</th>
                                <th style={thStyle}>상품</th>
                                <th style={thStyle}>수량</th>
                                <th style={thStyle}>주소</th>
                                <th style={thStyle}>상태</th>
                                <th style={thStyle}>주문일</th>
                                <th style={thStyle}>배송 신청 날짜</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={order.orderId}>

                                    <td style={tdStyle}>
                                        {index + 1}
                                    </td>

                                    <td style={tdStyle}>
                                        {renderItemName(order.orderitems)}
                                    </td>

                                    <td style={tdStyle}>
                                        {
                                            order.orderitems.reduce(
                                                (sum, item) =>
                                                    sum + item.count,
                                                0
                                            )
                                        }개
                                    </td>

                                    <td style={tdStyle}>
                                        {order.deliveryAddr}
                                        {' '}
                                        {order.deliveryAddrDetail}
                                    </td>

                                   
                                       <td style={tdStyle}>
                                       상품준비완료 기사님 배정중(WAITING)
                                    </td>
                                 

                                    <td style={tdStyle}>
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
                <div style={boxStyle}>
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
                                <th style={thStyle}>번호</th>
                                <th style={thStyle}>상품</th>
                                <th style={thStyle}>수량</th>
                                <th style={thStyle}>주소</th>
                                <th style={thStyle}>상태</th>
                                <th style={thStyle}>주문일</th>
                                <th style={thStyle}>배송 신청 날짜</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={order.orderId}>

                                    <td style={tdStyle}>
                                        {index + 1}
                                    </td>

                                    <td style={tdStyle}>
                                        {renderItemName(order.orderitems)}
                                    </td>

                                    <td style={tdStyle}>
                                        {
                                            order.orderitems.reduce(
                                                (sum, item) =>
                                                    sum + item.count,
                                                0
                                            )
                                        }개
                                    </td>

                                    <td style={tdStyle}>
                                        {order.deliveryAddr}
                                        {' '}
                                        {order.deliveryAddrDetail}
                                    </td>

                                    <td style={tdStyle}>
                                       상품배송완료(COMPLETED)
                                    </td>

                                    <td style={tdStyle}>
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