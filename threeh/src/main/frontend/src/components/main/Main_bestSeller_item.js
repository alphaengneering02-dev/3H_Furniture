import axios from 'axios';
import React, { useState } from 'react';

const Main_bestSeller_item = ({item}) => {

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
        <div>
            {/* 상품 이미지 */}
            <div style={{border: '1px solid #000'}}>
                {
                    itemImgs && itemImgs.itemImgUrl!=null
                    ? (
                        <img src={itemImgs.itemImgUrl} alt={itemImgs.itemImgName}/>
                    )
                    : (
                        <p>No Image</p>
                    )
                }
                <button>♡</button>
            </div>
            <p>{item.itemName}</p>  {/* 상품명 */}
            <h4>{item.itemPrice}</h4>    {/* 가격 */}
            <h4>{item.itemStock}</h4>    {/* 재고 수량 */}
        </div>
    );
};

export default Main_bestSeller_item;