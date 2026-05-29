import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import axios from 'axios';
import AddCompany from './AddCompany';
import AllOrderboard from './AllOrderboard';
import Orderboard from './Orderboard';
import AdminMemoDay from './AdminMemoDay';
import Ranking from './Ranking';
import AdminSearch from './AdminSearch';
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import '../../css/adminCss/AdminDashboard.css';

const AdminDashboard = () => {

    
    const navigate = useNavigate();
    const [selectedDrivers, setSelectedDrivers] = useState({});
    const [adminId, setAdminId] = useState('관리자');

    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');          
    const [debouncedTerm, setDebouncedTerm] = useState('');   
    const [searchType, setSearchType] = useState('all');

    // 상품 번호를 입력받아 검증 후 상세 페이지로 이동하는 함수
const handleEditItemDetail = () => {
        navigate('/item'); 
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 300); 

        return () => clearTimeout(timer); 
    }, [searchTerm]);

    const handleDeleteDelivery = async (deliveryId) => {
        if (!window.confirm("정말 이 기사를 삭제하시겠습니까?")) return;

        try {
            await axios.delete(`/admin/delivery-companies/${deliveryId}`);
            toast.error("삭제되었습니다.");
            // 리스트 새로고침
            fetchDeliveries(); 
        } catch (error) {
            console.error("삭제 실패:", error);
            toast.error("삭제 중 오류가 발생했습니다.");
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
            toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
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
        toast.error("기사를 선택해주세요.");
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
        toast.error("기사 배정 완료");

    } catch (error) {
        console.error("배정 실패 상세:", error.response?.data); // 서버가 보낸 구체적 에러 확인
        toast.error(`배정 실패: ${error.response?.data || "서버 오류"}`);
    }
};

    const cleanTerm = debouncedTerm.toLowerCase().trim();
    const filteredOrders = orders.filter(order => {
        if (!cleanTerm) return true;

        // 1. ORDERS 테이블 관련 기본 조건
        const orderIdMatch = String(order.orderId).includes(cleanTerm);
        const statusMatch = order.status && order.status.toLowerCase().includes(cleanTerm);

        // 2. MEMBER 테이블 기반 검색 조건
        const nameMatch = order.memberName && order.memberName.toLowerCase().includes(cleanTerm);
        const loginIdMatch = order.memberLoginId && order.memberLoginId.toLowerCase().includes(cleanTerm);
        const cleanPhone = order.memberPhone ? order.memberPhone.replace(/-/g, '') : '';
        const phoneMatch = order.memberPhone && (order.memberPhone.includes(cleanTerm) || cleanPhone.includes(cleanTerm));
        const isMemberMatch = nameMatch || loginIdMatch || phoneMatch;

        const isItemMatch = order.items && order.items.some(item => 
            (item.itemName && item.itemName.toLowerCase().includes(cleanTerm)) ||
            (item.itemCategory && item.itemCategory.toLowerCase().includes(cleanTerm))
        );

        if (searchType === 'member') {
            return isMemberMatch;
        } else if (searchType === 'item') {
            return isItemMatch;
        } else {
            return orderIdMatch || statusMatch || isMemberMatch || isItemMatch;
        }
    });

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
            toast.error("주문 취소 및 기사 배정 해제가 완료되었습니다.");
        } else if (nextState === 'READY') {
            toast.error("상품 준비 완료 상태로 변경되었습니다.");
        } else if (nextState === 'EXCHANGEorREFUND') {
            toast.error("교환 요청으로 변경되었습니다. 기사 수거(PICKUP) 상태가 적용됩니다.");
        } else if (nextState === 'PURCHASED') {
            toast.error("구매 확정 처리가 완료되었습니다.");
        } else {
            toast.error(`주문 상태가 [${nextState}]로 변경되었습니다.`);
        }

        // 3. 목록 새로고침
        if (typeof fetchOrders === 'function') {
            fetchOrders();
        }
        
    } catch (error) {
        console.error("❌ 상태 변경 실패 상세 정보 ---");
        console.error(error.response?.data || error.message);
        toast.error(`상태 변경 중 오류가 발생했습니다: ${error.response?.data || "서버 오류"}`);
        
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

            <AdminSearch 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                searchType={searchType}
                setSearchType={setSearchType}
            />

            <hr className="admin-sidebar-divider" />

           
            {/* 4. 원스톱 관리 매니저 패널 (사이드바 내부 하단 배치 성공) */}
            <div className="admin-control-panel">
                
                {/* 4-A. 상품 관리 파트 */}
<div className="admin-panel-group">
    <div className="admin-panel-title">📦 상품 Admin 관리</div>
    
    {/* 두 버튼을 나란히 배치하는 부모 컨테이너 */}
    <div className="admin-panel-buttons">
        
        {/* 첫 번째 버튼: Link 스타일을 제거하고 안쪽 button에 집중 */}
        <Link to="/item/create">
            <button className="admin-menu-btn type-product">개별 상품 추가</button>
        </Link>
        
        {/* 두 번째 버튼: 기존 유지 */}
        <button className="admin-menu-btn type-product-edit" onClick={handleEditItemDetail}>
            상품 수정 / 삭제
        </button>                                    
    </div>
</div>

                {/* 4-B. 배송 파트너 파트 */}
                <div className="admin-panel-group">
                    <div className="admin-panel-title">🚚 배송 파트너 등록</div>
                    <div className="admin-panel-buttons">
                        {/* 개별 등록 */}
                        <Link to="/admin/delivery" className="admin-full-width-del">
                            <button className="admin-add-driver-btn type-individual">개별 기사 직접 등록</button>
                        </Link>
                        
                        {/* 단체 등록 영역 */}
                        <div className="admin-sidebar-excel-box">
                            <div className="admin-panel-title">🚚단체 엑셀 일괄 등록</div>
                            <AddCompany onSuccess={fetchDeliveries} />
                        </div>
                    </div>
                </div>

            </div>
            
        </div> 


            {/* 오른쪽 */}
            <div className="admin-main-content">

                <h1>Admin Dashboard</h1>

{orders && orders.length > 0 && items && items.length > 0 ? (
    <Ranking orders={orders} items={items} />
) : (
    <div className="admin-ranking-card-box">
        📊 실시간 대시보드 랭킹 데이터를 집계하고 있습니다...
    </div>
)}

<div className="admin-button-group">
                    <Link to="/item/create">
                    <button></button>
                    </Link>
                    <button className="admin-menu-btn type-product-edit" onClick={handleEditItemDetail}>
                                상품 수정 / 삭제
                            </button>
                </div>

                <AllOrderboard 
                    orders={filteredOrders}
                    items={items}
                    handleDriverSelect={handleDriverSelect}
                    handleAssignDriver={handleAssignDriver}
                    handleStatusChange={handleStatusChange}
                />

<div className="admin-content-box">
    <div className="admin-driver-header">
        <div className="admin-driver-left">
            <h3>배송 파트너</h3>
            <Link to="/admin/driver">
                <button className="admin-move-page-btn">
                    배송 페이지 이동
                </button>
            </Link>
        </div>

        <div className="admin-driver-right">
            <Link to="/admin/delivery">
                <button className="admin-add-driver-btn">
                    배송 파트너 추가
                </button>
            </Link>
        </div>
    </div>

    <div className="admin-driver-table-wrapper">
        <table className="admindr-table-style">
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
                               <b className={`driver-status-text ${item.status === 'WAITING' ? 'status-waiting' : ''}`}>
                                    {item.status}
                                </b>
                            </td>
                            <td>
                                <button 
                                onClick={() => handleEditDelivery(item.deliveryId)}
                                className="admin-table-action-btn btn-edit"
                                >
                                    수정
                                </button>
                                <button 
                                onClick={() => handleDeleteDelivery(item.deliveryId)}
                                className="admin-table-action-btn btn-delete"
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
        orders={filteredOrders} 
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