import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const Main_itemList_item = ({item, getLoginUser, isUserRole, isUser, handleToggleBookmark, isBookmarked}) => {

    //이미지 상태 객체
    const [itemImgs, setItemImgs] = useState({});
    
    //상품 최종 가격 계산
    //백엔드에서 itemFinalPrice가 오면 그 값을 사용
    //없으면 원가-할인금액으로 계산
    //천 단위 콤마 적용
    const getFinalPrice = (item) => {
        if (item.itemFinalPrice !== null && item.itemFinalPrice !== undefined) {
            return Number(item.itemFinalPrice);
        }

        return Number(item.itemPrice || 0) - Number(item.itemDiscountPrice || 0);
    };

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString();
    };



    return (
        <div className="main-item-card">
            <div className="main-image-box">
                {/* 상품 이미지 */}
                <img src={item.itemImgUrl} alt={item.itemName} />
                {/* 북마크 버튼 */}
                {isUser && (
                    <button
                        type="button"
                        onClick={() => handleToggleBookmark(item.itemId)}
                        className={`main-bookmark-button ${
                            isBookmarked(item.itemId) ? "main-bookmark-active" : ""
                        }`}
                    >
                        {isBookmarked(item.itemId) ? "♥" : "♡"}
                    </button>
                )}

            </div>
            <p className="main-item-name">{item.itemName || "상품명"}</p>
            <h4 className="main-item-price">{formatPrice(getFinalPrice(item))}원</h4>
        </div>
    );
};

export default Main_itemList_item;