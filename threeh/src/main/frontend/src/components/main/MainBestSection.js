import React from 'react';
import { getUrl } from '../../utils/BackendPath';
//import '../../css/mainPageCss/mainBestSection.css';

function MainBestSection({ bestItems }) {
    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div className="best-section">
            <div className="best-section-header">
                <h2 className="best-section-title">이번 달 베스트 상품</h2>
                <p className="best-section-sub">가장 많이 선택받은 인기 상품을 만나보세요</p>
            </div>

            <div className="best-card-list">
                {bestItems.length === 0 ? (
                    <p className="best-empty">베스트 상품 데이터를 불러오는 중입니다...</p>
                ) : (
                    bestItems.map((item) => (
                        <div className="best-card" key={item.rank}>
                            <div className="best-medal">{medals[item.rank - 1]}</div>
                            <div className="best-img-box">
                                {item.image
                                    ? <img src={getUrl(item.image)} alt={item.name} className="best-img"/>
                                    : <div className="best-img-placeholder">No Image</div>
                                }
                            </div>
                            <div className="best-info">
                                <p className="best-name" title={item.name}>{item.name}</p>
                                <p className="best-sales">판매 <strong>{item.sales}개</strong></p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default MainBestSection;