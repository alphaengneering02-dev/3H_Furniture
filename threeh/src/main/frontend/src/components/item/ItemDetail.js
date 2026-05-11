import React, { useEffect, useState } from 'react';
import axios from 'axios';
import{useParams}from "react-router-dom";

const ItemDetail = () => {

    //URL에서 Item 가져오기
    const {itemId} = useParams();
    
    //상품 상태 저장
    const [item,setItem] = useState();

    //컴포넌트 실행시 상세조회 API 호출

    useEffect(()=>{
        axios.get(`/item/${itemId}`)
            .then((response)=>{
                console.log(response.data);
                setItem(response.data);
            })
            .catch((error) =>{
                console.error("상품 상세조회 실패",error);
            });
    },[itemId]);

    //데이터가 없을때
    if(!item){
        return <p>상품 불러오는 중...</p>;
    }

    return (
        <div>
            
            <h1>상품 상세 페이지</h1>

            <h2>{item.itemName}</h2>

            <p>카테고리: {item.itemCategory}</p>
            <p>상품 설명: {item.ItemDetail}</p>
            <p>상품 색상: {item.itemColor}</p>
            <p>상품 가격: {item.itemPrice}</p>
            <p>상품 할인가격: {item.itemDiscountPrice}</p>
            <p>상품 최종가격: {item.itemFinalPrice}</p>
            <p>상품 재고: {item.itemStock}</p>

        </div>
    );
};

export default ItemDetail;