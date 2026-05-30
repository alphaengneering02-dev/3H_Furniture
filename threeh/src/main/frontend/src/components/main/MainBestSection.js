import React from 'react';
import { getUrl } from '../../utils/BackendPath';
import { Link } from 'react-router-dom';
//import '../../css/mainPageCss/mainBestSection.css';

function MainBestSection({ bestItems }) {
    
    console.log(bestItems);

    return (
        <div className="best-section">
            <div className="best-section-header">
                <h2 className="best-section-title">베스트 상품</h2>
                <p className="best-section-sub">가장 많이 선택받은 인기 상품을 만나보세요</p>
            </div>

            <div className="best-card-list">
                {bestItems.length === 0 ? (
                    <p className="best-empty">베스트 상품 데이터를 불러오는 중입니다...</p>
                ) : (
                    bestItems.map((item) => (
                        <div className="best-card" key={item.rank}>
                            <Link
                                className='best-card-item-link'
                                to={`/item/${item.itemId}`}
                            >
                                {/* <div className="best-medal">{item.rank}</div> */}  {/* 임시 주석처리 유소은 */}
                                {/*코딩 수정 오현옥 */}
                                <div className="best-img-box">
                                    {item.image || item.itemImgUrl ?(
                                        <img src={getUrl(item.image || item.itemImgUrl)}
                                        alt={item.itemName || item.name} className='best-img'/>
                                    ):(
                                        <div className="best-img-placeholder">^___^</div>
                                    )}
                                </div>
                                <div className="best-info">
                                    <p className="best-name" title={item.name}>{item.name}</p>
                                    <p className="best-sales">판매 <strong>{item.sales}개</strong></p>
                                </div>
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default MainBestSection;