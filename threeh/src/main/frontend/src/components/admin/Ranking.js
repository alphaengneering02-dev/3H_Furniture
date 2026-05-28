import React, { useMemo } from 'react';
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
        const vipStatsMap = {};

        finalOrders.forEach((order, idx) => {
            if (idx === 0) {
            }

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
                    totalSpent: 0, // 💡 누적 금액 필드 추가
                    region: regionShort 
                };
            }
            vipStatsMap[memberId].count += 1;
            vipStatsMap[memberId].totalSpent += orderTotalPrice; // 💡 금액 누적
        });

        const result = Object.values(vipStatsMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map((vip, idx) => ({
                rank: idx + 1,
                ...vip,
                status: vip.count >= 5 ? '최우수 VIP' : '일반'
            }));
        return result;
    }, [finalOrders]);

    // ==========================================
    // 🔥 2. 인기 아이템 랭킹 연산 및 추적
    // ==========================================
    const itemRanking = useMemo(() => {
        const itemStatsMap = {};

        finalOrders.forEach((order, idx) => {
            const orderItemsArray = order.orderItems || order.orderitems;

            if (!orderItemsArray || !Array.isArray(orderItemsArray)) {
                console.warn(`⚠️ [경고] ${idx}번째 주문에 orderItems 배열이 없거나 형식이 잘못되었습니다.`);
                return;
            }
            
            orderItemsArray.forEach(item => {
                const itemName = item.itemName;
                const count = Number(item.count || 0);
                if (!itemName) return;

                if (!itemStatsMap[itemName]) {
                    itemStatsMap[itemName] = { name: itemName, sales: 0 };
                }
                itemStatsMap[itemName].sales += count;
            });
        });

        const result = Object.values(itemStatsMap)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 3)
            .map((item, idx) => ({
                rank: idx + 1,
                ...item
            }));
        return result;
    }, [finalOrders]);

    // ==========================================
    // 🚚 3. 우수 배송 기사 랭킹 계산 및 추적
    // ==========================================
    const driverRanking = useMemo(() => {
        const completedOrders = finalOrders.filter(o => {
            const deliveryStatus = String(o.deliveryStatus || '').toUpperCase();
            const orderState = String(o.orderState || '');
            return deliveryStatus === 'COMPLETED' && orderState !== '주문취소';
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

        const result = finalItems.map(driver => {
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
        return result;
    }, [finalOrders, finalItems]);


    return (
        <div className="admin-ranking-container">
            
            {/* 👑 VIP 고객 랭킹 카드 */}
            <div className="admin-ranking-card-box">
                <div className="admin-ranking-card-header">
                    <h3>👑 실시간 VIP 고객 랭킹</h3>
                </div>
                <table className="admin-ranking-table">
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>회원(ID)</th>
                            <th>누적 주문</th>
                            <th>누적 금액</th>
                            <th>등급</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vipRanking.map((vip) => (
                            <tr key={vip.memberId}>
                                <td className="admin-rank-display admin-vip-emoji">{vip.rank}</td>
                                <td className="admin-text-bold">{vip.name} ({vip.memberId})</td>
                                <td className="admin-text-count-blue">{vip.count}건</td>
                                <td className="admin-text-bold">{vip.totalSpent.toLocaleString()}원</td>
                                <td>
                                    <span className={`admin-badge ${vip.status === '최우수 VIP' ? 'admin-badge-vip' : 'admin-badge-normal'}`}>
                                        {vip.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {vipRanking.length === 0 && (
                            <tr>
                                <td colSpan="5" className="admin-ranking-empty-row">⚠️ 누적된 회원 주문이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                                <td className="admin-text-bold admin-item-name-ellipsis" title={item.name}>{item.name}</td>
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
    );
};

export default Ranking;