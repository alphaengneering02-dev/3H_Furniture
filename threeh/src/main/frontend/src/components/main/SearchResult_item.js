import React from 'react';

const SearchResult_item = ({item}) => {

    // 할인율 계산 및 최종 가격
    const finalPrice = item.itemPrice - item.itemDiscountPrice;
    const discountRate = item.itemPrice > 0 ? Math.round((item.itemDiscountPrice / item.itemPrice) * 100) : 0;


    return (
        <div className="search-result-item-card">
            {/* 상품 이미지 영역 */}
            <div className="search-result-item-image">
                <img className="search-result-image" src={item.itemImgUrl} alt={item.itemName}/>
            </div>
            
            {/* 상품 정보 영역 */}
            <div className="search-result-item-info">
                <span className="search-result-item-brand">{item.itemCategory}</span> {/* 카테고리를 브랜드/분류처럼 사용 */}
                <h3 className="search-result-item-name">{item.itemName}</h3>
                
                <div className="search-result-item-price-wrap">
                    {discountRate > 0 && <span className="search-result-discount-rate">{discountRate}%</span>}
                    <span className="search-result-final-price">{finalPrice.toLocaleString()}{item.itemPriceCurrency || '원'}</span>
                </div>
            </div>
        </div>
    );
};

export default SearchResult_item;