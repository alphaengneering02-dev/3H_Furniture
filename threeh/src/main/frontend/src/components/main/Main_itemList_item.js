import axios from 'axios';
import React, { useState } from 'react';

const Main_itemList_item = ({item}) => {

    //이미지 상태 객체
    const [itemImgs, setItemImgs] = useState({});
    

    //DB에서 각 상품의 이미지를 가져오는 함수
    const getItemImg = async() =>{
        try{
            //상품 이미지 가져오기
            const res = await axios.get(
                `http://localhost:8080/api/${item.itemId}`
            );
            setItemImgs(res.data)

            //콘솔 출력
            console.log(`[${item.itemName} 상품의 이미지 가져오기 완료]\n`, res.data)

        } catch(error){
            console.error(`[${item.itemName} 상품의 이미지 가져오기 실패]\n`, error);
        }
    };


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
            <div className="image-box">
                {/* 상품 이미지 */}
                <img src={item.imgUrl || "placeholder.png"} alt={item.itemName} />
                {/* 찜하기 버튼 */}
                <button className="wish-btn">♡</button>
            </div>
            <p className="item-name">{item.itemName || "상품명"}</p>
            <h4 className="item-price">{formatPrice(getFinalPrice(item))}원</h4>
        </div>
    );
};

export default Main_itemList_item;