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
    // 💡 원래 items였던 기사 리스트 상태명을 'drivers'로 명확하게 변경합니다.
    const [drivers, setDrivers] = useState([]); 

    // 상품 번호를 입력받아 검증 후 상세 페이지로 이동하는 함수
    const handleEditItemDetail = () => {
        navigate('/item'); 
    };

    const handleDeleteDelivery = async (deliveryId) => {
        if (!window.confirm("정말 이 기사를 삭제하시겠습니까?")) return;

        try {
            await axios.delete(`/admin/delivery-companies/${deliveryId}`);
            toast.error("삭제되었습니다.");
            fetchDeliveries(); // 리스트 새로고침
        } catch (error) {
            console.error("삭제 실패:", error);
            toast.error("삭제 중 오류가 발생했습니다.");
        }
    };

    const handleEditDelivery = (deliveryId) => {
        navigate(`/admin/delivery/${deliveryId}`);
    };

    useEffect(() => {
        const savedUser = sessionStorage.getItem("user");
    
        if (savedUser) {
            const userObj = JSON.parse(savedUser);
            const now = new Date().getTime();
            if (userObj.expiry && now > userObj.expiry) {
                toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
                sessionStorage.removeItem("user");
                navigate("/login");
                return;
            }
            setAdminId(userObj.adminName || userObj.adLoginId || '관리자');
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
        const deliveryIdRaw = selectedDrivers?.[orderId];

        if (!deliveryIdRaw) {
            toast.error("기사를 선택해주세요.");
            return;
        }

        try {
            const deliveryId = Number(deliveryIdRaw);
            await axios.post(`/admin/orders/${orderId}/assign`, { deliveryId });

            setOrders(prev =>
                prev.map(order =>
                    order.orderId === orderId
                        ? { ...order, deliveryId: deliveryId, deliveryStatus: 'WAITING' }
                        : order
                )
            );

            setSelectedDrivers(prev => ({ ...prev, [orderId]: "" }));
            toast.error("기사 배정 완료");
        } catch (error) {
            console.error("배정 실패 상세:", error.response?.data);
            toast.error(`배정 실패: ${error.response?.data || "서버 오류"}`);
        }
    };

    const renderItemName = (items) => {
        if (!items || items.length === 0) return '';
        const firstName = items[0].itemName;
        const extraCount = items.length - 1;
        return extraCount > 0 ? `${firstName} 외 ${extraCount}개 상품` : firstName;
    };

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
            const payload = { status: nextState };
            await axios.put(`/admin/orders/${orderId}/status`, payload);
            
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

            if (typeof fetchOrders === 'function') fetchOrders();
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error(`상태 변경 중 오류가 발생했습니다: ${error.response?.data || "서버 오류"}`);
            if (typeof fetchOrders === 'function') fetchOrders();
        }
    };

    const fetchDeliveries = async () => {
        try {
            const response = await axios.get('/admin/list');
            // 💡 데이터가 기사 리스트이므로 setDrivers에 채워넣습니다.
            setDrivers(response.data); 
        } catch (error) {
            console.error("❌ 기사 리스트 로드 실패 상세 원인:", error);
        }
    };

    return (
        <div className="admin-dashboard-container">
            <ToastContainer />
            <div className="admin-side-box">
                <div className="admin-welcome-message">
                    <span>☕ {adminId}님 접속을<br/>환영합니다.</span>
                </div>
                
                <AdminMemoDay/>           
                <hr className="admin-sidebar-divider" />

                {/* 전체 검색 컴포넌트에도 드라이버 데이터를 바인딩 */}
                <AdminSearch items={drivers} />
                <hr className="admin-sidebar-divider" />

                <div className="admin-control-panel">  
                    <div className="admin-panel-group">
                        <div className="admin-panel-title">📦 상품 Admin 관리</div>
                        <div className="admin-panel-buttons">
                            <Link to="/item/create">
                                <button className="admin-menu-btn type-product">개별 상품 추가</button>
                            </Link>
                            <button className="admin-menu-btn type-product-edit" onClick={handleEditItemDetail}>
                                상품 수정 / 삭제
                            </button>                                                    
                        </div>
                    </div>

                    <div className="admin-panel-group">
                        <div className="admin-panel-title">🚚 배송 파트너 등록</div>
                        <div className="admin-panel-buttons">
                            <Link to="/admin/delivery" className="admin-full-width-del">
                                <button className="admin-add-driver-btn type-individual">개별 기사 직접 등록</button>
                            </Link>
                            <div className="admin-sidebar-excel-box">
                                <div className="admin-panel-title">🚚단체 엑셀 일괄 등록</div>
                                <AddCompany onSuccess={fetchDeliveries} />
                            </div>
                        </div>
                    </div>
                </div>            
            </div> 

            <div className="admin-main-content">
                <h1>Admin Dashboard</h1>

                {orders && orders.length > 0 && drivers && drivers.length > 0 ? (
                    <Ranking orders={orders} items={drivers} />
                ) : (
                    <div className="admin-ranking-card-box">
                        📊 실시간 대시보드 랭킹 데이터를 집계하고 있습니다...
                    </div>
                )}

                <div className="admin-button-group">
                    <button className="admin-menu-btn type-product-edit" onClick={handleEditItemDetail}>
                        상품 수정 / 삭제
                    </button>
                </div>

                {/* AllOrderboard 컴포넌트 */}
                <AllOrderboard 
                    items={drivers}
                    handleDriverSelect={handleDriverSelect}
                    handleAssignDriver={handleAssignDriver}
                    handleStatusChange={handleStatusChange}
                />

                {/* 배송 파트너 테이블 관리 영역 */}
                <div className="admin-content-box">
                    <div className="admin-driver-header">
                        <div className="admin-driver-left">
                            <h3>배송 파트너</h3>
                            <Link to="/admin/driver">
                                <button className="admin-move-page-btn">배송 페이지 이동</button>
                            </Link>
                        </div>
                        <div className="admin-driver-right">
                            <Link to="/admin/delivery">
                                <button className="admin-add-driver-btn">배송 파트너 추가</button>
                            </Link>
                        </div>
                    </div>

                    <div className="admin-driver-table-wrapper">
                        <table className="admindr-table-style">
                            <thead>
                                <tr>
                                    <th>회사</th><th>기사명</th><th>기사 ID</th><th>연락처</th><th>상태</th><th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drivers.length === 0 ? (
                                    <tr><td colSpan="6">등록된 기사가 없습니다.</td></tr>
                                ) : (
                                    drivers.map((driver) => (
                                        <tr key={driver.deliveryId}>
                                            <td>{driver.companyName || driver.businessName || "회사 정보 없음"}</td>
                                            <td>{driver.deliveryName}</td>
                                            <td>{driver.deliveryId}</td>
                                            <td>{driver.deliveryPhone}</td>
                                            <td>
                                                <b className={`driver-status-text ${driver.status === 'WAITING' ? 'status-waiting' : ''}`}>
                                                    {driver.status}
                                                </b>
                                            </td>
                                            <td>
                                                <button onClick={() => handleEditDelivery(driver.deliveryId)} className="admin-table-action-btn btn-edit">수정</button>
                                                <button onClick={() => handleDeleteDelivery(driver.deliveryId)} className="admin-table-action-btn btn-delete">삭제</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 💡 꼬여있던 Props 전달 수정: orders 배열과 drivers 배열을 명확하게 분리해서 전달합니다. */}
                <Orderboard  
                    orders={orders}
                    drivers={drivers} 
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