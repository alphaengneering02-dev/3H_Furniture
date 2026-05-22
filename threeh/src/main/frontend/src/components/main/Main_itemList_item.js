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



    return (
        <div className="item-card">
            <div className="image-box">
                {/* 상품 이미지 */}
                <img src={item.imgUrl || "placeholder.png"} alt={item.itemName} />
                {/* 찜하기 버튼 */}
                <button className="wish-btn">♡</button>
            </div>
            <p className="item-name">{item.itemName || "상품명"}</p>
            <h4 className="item-price">{item.itemPrice || "가격"}</h4>
        </div>
    );
};

export default Main_itemList_item;