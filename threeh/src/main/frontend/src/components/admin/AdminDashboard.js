import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import axios from 'axios';
import AddCompany from './AddCompany';
import AllOrderboard from './AllOrderboard';
import Orderboard from './Orderboard';
import AdminMemoDay from './AdminMemoDay';
import Ranking from './Ranking';
import '../../css/adminCss/AdminDashboard.css';

const AdminDashboard = () => {

    
    const navigate = useNavigate();
    const [selectedDrivers, setSelectedDrivers] = useState({});
    const [adminId, setAdminId] = useState('관리자');

    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);

    // 상품 번호를 입력받아 검증 후 상세 페이지로 이동하는 함수
const handleEditItemDetail = () => {
        navigate('/item'); 
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
    }
    
    fetchDeliveries();
    fetchOrders();
}, [navigate]);

   

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
            console.error("❌ 기사 리스트 로드 실패 상세 원인:", error);
        }
    };

    return (
    <div className="admin-dashboard-container">
        <div className="admin-side-box">            
            <div className="admin-welcome-message">
                <span>👤 {adminId}님 접속을 환영합니다.</span>
            </div>

            <AdminMemoDay/>

             {/* 내부 구분선 */}
            <hr className="admin-sidebar-divider" />

           
            {/* 4. 원스톱 관리 매니저 패널 (사이드바 내부 하단 배치 성공) */}
            <div className="admin-control-panel">
                
                {/* 4-A. 상품 관리 파트 */}
                    <div className="admin-panel-group">
                        <div className="admin-panel-title">📦 상품 마스터 관리</div>
                        <div className="panel-buttons">
                            <Link to="/item/create" className="full-width-link">
                                <button className="admin-menu-btn type-product">개별 상품 추가</button>
                            </Link>
                            {/* 💡 수정 1: 사이드바 내부의 수정 버튼에 onClick 추가 */}
                            <button className="admin-menu-btn type-product-edit" onClick={handleEditItemDetail}>
                                상품 수정 / 삭제
                            </button>                          
                        </div>
                    </div>

                {/* 4-B. 배송 파트너 파트 */}
                <div className="admin-panel-group">
                    <div className="admin-panel-title">🚚 배송 파트너 등록</div>
                    <div className="panel-buttons">
                        {/* 개별 등록 */}
                        <Link to="/admin/delivery" className="full-width-link">
                            <button className="admin-menu-btn type-individual">개별 기사 직접 등록</button>
                        </Link>
                        
                        {/* 단체 등록 영역 */}
                        <div className="sidebar-excel-box">
                            <div className="excel-micro-label">단체 엑셀 일괄 등록</div>
                            <AddCompany onSuccess={fetchDeliveries} />
                        </div>
                    </div>
                </div>

            </div>
            
        </div> 


            {/* 오른쪽 */}
            <div className="admin-main-content">

                <h1>Admin Dashboard</h1>

                <Ranking />

                <div className="admin-button-group">
                    <Link to="/item/create">
                    <button>상품 추가</button>
                    </Link>
                    <button className="admin-menu-btn type-product-edit" onClick={handleEditItemDetail}>
                                상품 수정 / 삭제
                            </button>
                </div>

                <AllOrderboard 
                    orders={orders}
                    items={items}
                    handleDriverSelect={handleDriverSelect}
                    handleAssignDriver={handleAssignDriver}
                    handleStatusChange={handleStatusChange}
                />

<div className="admin-content-box">
    
    <div className="admin-content-title-bar">
        {/* h3 태그와 버튼이 가로로 배치되도록 구성 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <h3>배송 파트너</h3>         
            <Link to="/admin/driver" style={{ marginLeft: '12px' }}>
                <button className="admin-add-driver-btn" style={{ padding: '4px 10px', fontSize: '14px' }}>
                    기사 페이지 이동
                </button>
            </Link>
        </div>

        <div className="admin-header-actions">          
            <div className="admin-excel-upload-wrapper">
                <span className="excel-label">엑셀 등록:</span>
                <AddCompany onSuccess={fetchDeliveries} />
            </div>
            
            <Link to="/admin/delivery">
                <button className="admin-add-driver-btn">기사 추가</button>
            </Link>
        </div>
    </div>

    <div className="driver-table-wrapper">
        <table className="admin-table-style">
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
                        <td colSpan="5">등록된 기사가 없습니다.</td>
                    </tr>
                ) : (
                    items.map((item) => (
                        <tr key={item.deliveryId}>
                            <td>
                                {item.companyName || item.businessName || "회사 정보 없음"}
                            </td>
                            <td>{item.deliveryName}</td>
                            <td>{item.deliveryPhone}</td>
                            <td>
                                <b style={{ color: item.status === 'WAITING' ? 'blue' : 'black' }}>
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