import React from 'react';

const Ranking = () => {
   
    const vipRanking = [
        { rank: 1, memberId: "186", count: "7건", status: "최우수 VIP", region: "경기 안산시" },
        { rank: 2, memberId: "187", count: "2건", status: "우수", region: "경기 가평군" },
        { rank: 3, memberId: "184", count: "1건", status: "일반", region: "강원 춘천시" },
    ];

    const itemRanking = [
        { rank: 1, name: "Premium 3인용 가죽 소파", category: "가구", sales: "42개" },
        { rank: 2, name: "내추럴 원목 거실장", category: "가구", sales: "28개" },
        { rank: 3, name: "모던 LED 침대 프레임", category: "침구", sales: "19개" },
    ];

    return (
        <div className="admin-ranking-container">
            {/* ⬅️ 왼쪽 네모칸: VIP 고객 랭킹 */}
            <div className="admin-ranking-card-box">
                <div className="admin-ranking-card-header">
                    <h3>👑 실시간 VIP 고객 랭킹</h3>
                </div>
                <table className="admin-ranking-table">
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>회원 ID</th>
                            <th>누적 주문</th>
                            <th>주요 지역</th>
                            <th>등급</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vipRanking.map((vip) => (
                            <tr key={vip.memberId}>
                                <td className="admin-rank-display vip-emoji">{vip.rank}</td>
                                <td className="admin-text-bold">{vip.memberId}번 회원</td>
                                <td className="admin-text-count-blue">{vip.count}</td>
                                <td>{vip.region}</td>
                                <td>
                                    <span className={`badge ${vip.status === '최우수 VIP' ? 'badge-vip' : 'admin-badge-normal'}`}>
                                        {vip.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ➡️ 오른쪽 네모칸: 인기 아이템 랭킹 */}
            <div className="admin-ranking-card-box">
                <div className="admin-ranking-card-header">
                    <h3>🔥 이번 달 인기 아이템 TOP 3</h3>
                </div>
                <table className="admin-ranking-table">
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>아이템명</th>
                            <th>카테고리</th>
                            <th>판매 수량</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemRanking.map((item) => (
                            <tr key={item.rank}>
                                <td className="admin-rank-display item-number">{item.rank}</td>
                                <td className="admin-text-bold item-name-ellipsis">{item.name}</td>
                                <td>{item.category}</td>
                                <td className="admin-text-count-red">{item.sales}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Ranking;