import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import axios from 'axios';
import AddCompany from './AddCompany';
import Orderboard from './Orderboard';

const AdminDashboard = () => {

    const [memo1, setMemo1] = useState('');
    const memoRef = useRef(null);
    const navigate = useNavigate();
    const [selectedDrivers, setSelectedDrivers] = useState({});
    const [adminId, setAdminId] = useState('관리자');

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

    const [orders, setOrders] = useState([]);
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
        navigate(`/admin/delivery/${deliveryId}`);
    };


    useEffect(() => {
        const savedUser = sessionStorage.getItem("user");
    
    if (savedUser) {
        const userObj = JSON.parse(savedUser);
        
        // 2. 만료 시간 체크 (선택 사항이지만 안전함)
        const now = new Date().getTime();
        if (userObj.expiry && now > userObj.expiry) {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            sessionStorage.removeItem("user");
            navigate("/login");
            return;
        }

        // 3. 관리자 이름 또는 ID 설정
        setAdminId(userObj.adminName || userObj.adLoginId || '관리자');
        
        console.log("=== AdminDashboard 진입 ===");
        console.log("접속자 정보:", userObj);
    } else {
        console.log("로그인 정보가 없습니다. 로그인 페이지로 이동합니다.");
        // navigate("/login"); // 로그인 안 되어있으면 튕겨내기
    }
    
    fetchDeliveries();
}, [navigate]);

    useEffect(() => {
        const savedTextarea = localStorage.getItem("memo_textarea");
        const savedEditor = localStorage.getItem("memo_editor");

        if (savedTextarea) setMemo1(savedTextarea);

        if (savedEditor && memoRef.current) {
            memoRef.current.innerHTML = savedEditor;
        }
    }, []);

    const handleDriverSelect = (orderId, deliveryId) => {
    setSelectedDrivers(prev => ({
        ...prev,
        [orderId]: deliveryId
    }));
};


const handleAssignDriver = async (orderId) => {
    const deliveryId = selectedDrivers[orderId];
    if (!deliveryId) {
        alert("기사를 선택해주세요.");
        return;
    }

    try {
        await axios.post(`/admin/orders/${orderId}/assign`, {
            deliveryId: deliveryId,
            status: 'SHIPPING' // 배정 시 상태 변경
        });
        
        alert("배송 배정이 완료되었습니다.");
        fetchDeliveries(); // 기사 상태 갱신
    } catch (error) {
        console.error("배정 실패:", error);
        alert("배정 중 오류가 발생했습니다.");
    }
};

    const renderItemName = (items) => {
        if (items.length === 0) return '';

        const firstName = items[0].itemName;
        const extraCount = items.length - 1;

        return extraCount > 0
            ? `${firstName} 외 ${extraCount}개 상품`
            : firstName;
    };

    const fetchOrders = async () => {
    try {
        const response = await axios.get('/admin/orders'); 
        setOrders(response.data);
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }
};

useEffect(() => {
    fetchDeliveries();
    fetchOrders(); // 주문 목록도 함께 호출
}, []);

    const handleStatusChange = async (orderId, newStatus) => {
    try {
        // 1. 백엔드에 상태 업데이트 요청
        await axios.put(`/admin/orders/${orderId}/status`, { status: newStatus });

        // 2. 클라이언트 상태 반영 (기존 코드 유지 또는 새로고침)
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.orderId === orderId
                    ? { ...order, orderState: newStatus }
                    : order
            )
        );
        
        alert(`상태가 ${newStatus}로 변경되었습니다.`);
    } catch (error) {
        console.error("상태 업데이트 실패:", error);
        alert("상태 업데이트 중 오류가 발생했습니다.");
    }
};

    return (
        <div className="dashboard-container">

            {/* 왼쪽 */}
            <div className="side-box">

                <div className="welcome-message">
                    <span>👤 {adminId}님 접속을 환영합니다.</span>
                </div>

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
                    <Link to="/item/create">
                    <button>상품 추가</button>
                    </Link>
                    <button>상품 수정/삭제</button>
                    <p>수정 삭제는 어드민만 볼 수 있는 상품리스트를 만들어서로 이동?</p>
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
                                            value={order.orderState}
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
                    <Link to="/admin/delivery">
                        <button>기사 추가</button>
                    </Link>
                   <div>
    <h3>회사 기사 엑셀 등록</h3>

   <AddCompany onSuccess={fetchDeliveries} />
</div>

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

                    <Orderboard 
        orders={orders} 
        items={items} 
        selectedDrivers={selectedDrivers}
        handleDriverSelect={handleDriverSelect}
        handleAssignDriver={handleAssignDriver}
        handleStatusChange={handleStatusChange}
    />

            </div>

        </div>
    );
};

export default AdminDashboard;