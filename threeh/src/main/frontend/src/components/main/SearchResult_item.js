import React from 'react';
import { Link } from 'react-router-dom';

const SearchResult_item = ({item, getFinalPrice, formatPrice}) => {

    // 할인율 계산
    const discountRate = item.itemPrice > 0 ? Math.round((item.itemDiscountPrice / item.itemPrice) * 100) : 0;


    return (
        <div className="search-result-item-card">
            {/* 상품카드 클릭 시 상품 상세페이지로 이동 */}
            <Link
                className='search-result-item-link'
                to={`/item/${item.itemId}`}
            >
                {/* 상품 이미지 영역 */}
                <div className="search-result-item-image">
                    <img className="search-result-image" src={`http://localhost:8080${item.itemImgUrl}`} alt={item.itemName}/>
                </div>
                
                {/* 상품 정보 영역 */}
                <div className="search-result-item-info">
                    <span className="search-result-item-brand">{item.itemCategory}</span>  {/* 상품 카데고리 */}
                    <h3 className="search-result-item-name">{item.itemName}</h3>  {/* 상품명 */}
                    
                    <div className="search-result-item-price-wrap">
                        {
                            discountRate > 0 && 
                            <span className="search-result-discount-rate">{discountRate}%</span>  //할인율 (0% 이상일때만 보여짐)
                        }  
                        <span className="search-result-final-price">{formatPrice(getFinalPrice(item))}원</span>  {/* 최종가격 */}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default SearchResult_item;


{/* 상품명 클릭 시 상품 상세페이지로 이동 */}
{/* <Link
    className="main-item-name-link"
    to={`/item/${item.itemId}`}
>
    <p className="main-item-name">
        {item.itemName || "상품명"}
    </p>
</Link>

<h4 className="main-item-price">
    {formatPrice(getFinalPrice(item))}원
</h4> */}