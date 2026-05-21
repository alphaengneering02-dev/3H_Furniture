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
    }
    
    fetchDeliveries();
    fetchOrders();
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
    const deliveryIdRaw = selectedDrivers[orderId];

    // 미배정 확인 로그
    console.log(`[기사배정 시도] 주문ID: ${orderId} ➡️ 선택된 기사 ID: ${deliveryIdRaw}`);

    if (!deliveryIdRaw) {
        alert("기사를 선택해주세요.");
        return;
    }

    try {
        // deliveryId를 확실하게 숫자(Number) 타입으로 변환
        const deliveryId = Number(deliveryIdRaw);

        // 백엔드 API 명세에 맞춰 데이터 전송
        await axios.post(`/admin/orders/${orderId}/assign`, {
            deliveryId: deliveryId
        });

        // UI 즉시 업데이트 로직 (기존 유지)
        setOrders(prev =>
            prev.map(order =>
                order.orderId === orderId
                    ? {
                        ...order,
                        deliveryId: deliveryId,
                        deliveryStatus: 'WAITING'
                    }
                    : order
            )
        );

        setSelectedDrivers(prev => ({ ...prev, [orderId]: "" }));
        alert("기사 배정 완료");

    } catch (error) {
        console.error("배정 실패 상세:", error.response?.data); // 서버가 보낸 구체적 에러 확인
        alert(`배정 실패: ${error.response?.data || "서버 오류"}`);
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
//미배정 콘솔 확인용
    const fetchOrders = async () => {
    try {
        const response = await axios.get('/admin/orders');
        
        setOrders(response.data);
    } catch(err) {
        console.error("어드민 데이터 로드 에러:", err);
    }
};

const handleStatusChange = async (orderId, nextState) => {
    try {
        // 1. 백엔드 API 명세에 맞춰 PUT 요청 전송
        const payload = { status: nextState };
        await axios.put(`/admin/orders/${orderId}/status`, payload);
        
        // 2. 상태별 알림 메시지 분기 (EXCHANGEorREFUND 상태 추가)
        if (nextState === 'CANCEL') {
            alert("주문 취소 및 기사 배정 해제가 완료되었습니다.");
        } else if (nextState === 'READY') {
            alert("상품 준비 완료 상태로 변경되었습니다.");
        } else if (nextState === 'EXCHANGEorREFUND') {
            alert("교환 요청으로 변경되었습니다. 기사 수거(PICKUP) 상태가 적용됩니다.");
        } else if (nextState === 'PURCHASED') {
            alert("구매 확정 처리가 완료되었습니다.");
        } else {
            alert(`주문 상태가 [${nextState}]로 변경되었습니다.`);
        }

        // 3. 목록 새로고침
        if (typeof fetchOrders === 'function') {
            fetchOrders();
        }
        
    } catch (error) {
        console.error("❌ 상태 변경 실패 상세 정보 ---");
        console.error(error.response?.data || error.message);
        alert(`상태 변경 중 오류가 발생했습니다: ${error.response?.data || "서버 오류"}`);
        
        if (typeof fetchOrders === 'function') {
            fetchOrders();
        }
    }
};

const fetchDeliveries = async () => {
    try {
        const response = await axios.get('/admin/list');
        setItems(response.data);
    } catch (error) {
        console.error("❌ 기사 리스트 로드 실패 상세 원인:");
        if (error.response && error.response.data) {
            console.error(error.response.data); 
            alert("서버 에러: " + error.response.data); 
        } else {
            console.error(error.message);
        }
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
                                <th>회사</th>
                                <th>기사명</th>
                                <th>연락처</th>
                                <th>상태</th>
                                <th>관리</th>
                            </tr>
                        </thead>

                        <tbody>
                            

                            {items.length === 0 ? (
                                
                                <tr>
                                    <td colSpan="5">
                                        등록된 기사가 없습니다.
                    </td>
                </tr>
            ) : (
                items.map((item) => (
                    <tr key={item.deliveryId}>
                        <td>
                            {item.companyName || item.businessName || "회사 정보 없음"}
                        </td>

                        <td>
                            {item.deliveryName}
                        </td>

            
                        <td>
                            {item.deliveryPhone}
                        </td>

                        <td>
                            <b style={{
                                color: item.status === 'WAITING' ? 'blue' : 'black'
                            }}>
                                {item.status}
                            </b>
                        </td>

                        {/* 5. 관리 버튼 */}
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