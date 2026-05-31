import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../../css/adminCss/AdminRanking.css';

const SAMPLE_ORDERS = [];
const SAMPLE_DRIVERS = [];

const Ranking = ({ orders = [], items = [] }) => {

    const finalOrders = orders && orders.length > 0 ? orders : SAMPLE_ORDERS;
    const finalItems = items && items.length > 0 ? items : SAMPLE_DRIVERS;

    // ==========================================
    // 👑 1. VIP 고객 랭킹 연산 및 추적
    // ==========================================
    const vipRanking = useMemo(() => {
        const validVipOrders = finalOrders.filter(order => {
            const orderState = String(order.orderState || order.status || '').trim();
            const deliveryStatus = String(order.deliveryStatus || '').trim();
            const isCompleted = deliveryStatus === 'COMPLETED' || deliveryStatus === '배송완료';
            const isValidState = 
                orderState === 'PURCHASED' || orderState === '구매확정' || 
                orderState === 'EXCHANGEorREFUND' || orderState === '교환또는환불';

            return isCompleted && isValidState;
        });

        const vipStatsMap = {};

        validVipOrders.forEach((order, idx) => {
            const memberId = order.memberId;
            if (!memberId) {
                console.warn(`⚠️ [경고] ${idx}번째 주문에 memberId가 없습니다!`);
                return;
            }
            
            const memberName = order.memberName || "미상 회원";
            const addr = order.deliveryAddr || "지역 정보 없음";
            const regionShort = addr.split(' ').slice(0, 2).join(' ');

            const orderItemsArray = order.orderitems || order.orderItems || [];
            const orderTotalPrice = orderItemsArray.reduce((sum, item) => {
                return sum + (Number(item.orderPrice || 0) * Number(item.count || 0));
            }, 0);

            if (!vipStatsMap[memberId]) {
                vipStatsMap[memberId] = { 
                    memberId, 
                    name: memberName, 
                    count: 0, 
                    totalSpent: 0,
                    region: regionShort 
                };
            }
            vipStatsMap[memberId].count += 1;
            vipStatsMap[memberId].totalSpent += orderTotalPrice;
        });

        return Object.values(vipStatsMap)
            .sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count;
                return b.totalSpent - a.totalSpent;
            })
            .slice(0, 3)
            .map((vip, idx) => ({
                rank: idx + 1,
                ...vip,
                status: vip.count >= 5 ? '최우수 VIP' : '일반'
            }));
    }, [finalOrders]);

    // ==========================================
    // 🔥 2. 인기 아이템 랭킹 연산 및 추적 (⭐️ ID 추출 로직 전면 수정!)
    // ==========================================
    const itemRanking = useMemo(() => {
        const validItemOrders = finalOrders.filter(order => {
            const orderState = String(order.orderState || order.status || '').trim();
            const deliveryStatus = String(order.deliveryStatus || '').trim();
            const isCompleted = deliveryStatus === 'COMPLETED' || deliveryStatus === '배송완료';
            const isValidState = 
                orderState === 'PURCHASED' || orderState === '구매확정' || 
                orderState === 'EXCHANGEorREFUND' || orderState === '교환또는환불';

            return isCompleted && isValidState;
        });

        const itemStatsMap = {};

        validItemOrders.forEach((order) => {
            const orderItemsArray = order.orderItems || order.orderitems;
            if (!orderItemsArray || !Array.isArray(orderItemsArray)) return;
            
            orderItemsArray.forEach(item => {
                const itemName = item.itemName;
                const count = Number(item.count || 0);
                // 💡 백엔드 데이터에 맞게 item.itemId, item.productId, item.id 중 하나를 매핑합니다.
                const itemId = item.itemId || item.productId || item.id || item.itemNo; 
                
                if (!itemName) return;

                // ID가 있으면 ID를 Key로 삼고, 없으면 이름으로 삼아 중복 방지
                const mapKey = itemId || itemName;

                if (!itemStatsMap[mapKey]) {
                    itemStatsMap[mapKey] = { 
                        id: itemId, // ⭐️ 이 id 데이터가 넘어가야 Link가 활성화됩니다!
                        name: itemName, 
                        sales: 0 
                    };
                }
                itemStatsMap[mapKey].sales += count;
            });
        });

        return Object.values(itemStatsMap)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 3)
            .map((item, idx) => ({
                rank: idx + 1,
                ...item
            }));
    }, [finalOrders]);

    // ==========================================
    // 🚚 3. 우수 배송 기사 랭킹 계산 및 추적
    // ==========================================
    const driverRanking = useMemo(() => {
        const completedOrders = finalOrders.filter(o => {
            const deliveryStatus = String(o.deliveryStatus || '').trim();
            const orderState = String(o.orderState || o.status || '').trim();
            const isCompleted = deliveryStatus === 'COMPLETED' || deliveryStatus === '배송완료';
            const isNotCanceled = orderState !== 'CANCEL' && orderState !== '주문취소';

            return isCompleted && isNotCanceled;
        });

        const driverStatsMap = {};
        completedOrders.forEach(order => {
            const dId = order.deliveryId ? String(order.deliveryId) : null;
            if (!dId) return;

            const orderItemsArray = order.orderItems || order.orderitems || [];
            const orderPrice = orderItemsArray.reduce((sum, item) => {
                return sum + (Number(item.orderPrice || 0) * Number(item.count || 1));
            }, 0);

            if (!driverStatsMap[dId]) {
                driverStatsMap[dId] = { count: 0, sales: 0 };
            }
            driverStatsMap[dId].count += 1;
            driverStatsMap[dId].sales += orderPrice;
        });

        return finalItems.map(driver => {
            const dId = String(driver.deliveryId || driver.DRIVER_ID || '');
            const stats = driverStatsMap[dId] || { count: 0, sales: 0 };
            const driverName = driver.deliveryName || driver.name || '이름없음';

            return {
                driverId: dId,
                name: driverName,
                count: stats.count,
                sales: stats.sales
            };
        })
        .sort((a, b) => {
            if (b.count === a.count) return b.sales - a.sales;
            return b.count - a.count;
        })
        .slice(0, 3);
    }, [finalOrders, finalItems]);

    return (
        <div className="admin-ranking-container">

            {/* 👑 VIP 고객 랭킹 */}
            <div className="vip-ranking-visual">
                {vipRanking[1] ? (
                    <div className="vip-side-card left">
                        <div className="vip-rank">2위 우수 VIP</div>
                        <div className="vip-name">
                            {vipRanking[1].name} <span className="vip-id">({vipRanking[1].memberId})</span>
                        </div>
                        <div className="vip-info-row">               
                            <strong>{vipRanking[1].count}건</strong>
                        </div>
                        <div className="vip-info-row">
                            <strong>{vipRanking[1].totalSpent.toLocaleString()}원</strong>
                        </div>
                    </div>
                ) : <div className="vip-side-card empty">2위 데이터 없음</div>}

                {vipRanking[0] ? (
                    <div className="vip-center-card">
                        <div className="vip-rank first">👑 1위 최우수 VIP</div>
                        <div className="vip-name big">
                            {vipRanking[0].name} <span className="vip-id">({vipRanking[0].memberId})</span>
                        </div>
                        <div className="vip-order-count">
                            {vipRanking[0].count}건
                        </div>
                        <div className="vip-total-price">
                            {vipRanking[0].totalSpent.toLocaleString()}원
                        </div>
                    </div>
                ) : <div className="vip-center-card empty">1위 데이터 없음</div>}

                {vipRanking[2] ? (
                    <div className="vip-side-card right">
                        <div className="vip-rank">3위 우수 VIP</div>
                        <div className="vip-name">
                            {vipRanking[2].name} <span className="vip-id">({vipRanking[2].memberId})</span>
                        </div>
                        <div className="vip-info-row">
                            <strong>{vipRanking[2].count}건</strong>
                        </div>
                        <div className="vip-info-row">
                            <strong>{vipRanking[2].totalSpent.toLocaleString()}원</strong>
                        </div>
                    </div>
                ) : <div className="vip-side-card empty">3위 데이터 없음</div>}
            </div>

            <div className="admin-tables-row">

                {/* 🔥 인기 아이템 랭킹 카드 */}
                <div className="admin-ranking-card-box">
                    <div className="admin-ranking-card-header">
                        <h3>🔥 이번 달 인기 아이템 TOP 3</h3>
                    </div>
                    <table className="admin-ranking-table">
                        <thead>
                            <tr>
                                <th>순위</th>
                                <th>아이템명</th>
                                <th>판매 수량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemRanking.map((item) => (
                                <tr key={item.rank}>
                                    <td className="admin-rank-display admin-item-number">{item.rank}</td>
                                    <td className="admin-text-bold admin-item-name-ellipsis" title={item.name}>
                                        {item.id ? (
                                            <Link to={`/item/${item.id}`} className="admin-item-link">
                                                {item.name}
                                            </Link>
                                        ) : (
                                            <span className="admin-item-link-fallback">{item.name}</span>
                                        )}
                                    </td>
                                    <td className="admin-text-count-red">{item.sales}개</td>
                                </tr>
                            ))}
                            {itemRanking.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="admin-ranking-empty-row">⚠️ 판매된 상품 내역이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 🚚 우수 배송 기사 랭킹 카드 */}
                <div className="admin-ranking-card-box">
                    <div className="admin-ranking-card-header">
                        <h3>🚚 우수 배송 기사 랭킹 (완료 기준)</h3>
                    </div>
                    <table className="admin-ranking-table">
                        <thead>
                            <tr>
                                <th>순위</th>
                                <th>기사명</th>
                                <th>완료 건수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {driverRanking.map((driver, index) => (
                                <tr key={driver.driverId}>
                                    <td className="admin-rank-display admin-driver-number">{index + 1}</td>
                                    <td className="admin-text-bold">{driver.name} 기사님</td>
                                    <td className="admin-text-count-blue">{driver.count}건</td>
                                </tr>
                            ))}
                            {driverRanking.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="admin-ranking-empty-row">⚠️ 조건에 맞는 배송 데이터가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Ranking;