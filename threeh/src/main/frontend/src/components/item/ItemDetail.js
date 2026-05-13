import React, { useEffect, useState } from 'react';
import axios from 'axios';
import{useParams}from "react-router-dom";

const ItemDetail = () => {

    //URL에서 Item 가져오기
    const {itemId} = useParams();
    
    //상품 상태 관리
    const [item,setItem] = useState(null);
    //이미지 상태 관리
    const [itemImgs,setItemImgs] = useState([]);

    useEffect(()=>{
        getItem();
        getItemImgs();
    },[itemId]);

    //상품정보 동기화
    const getItem = async() =>{
        try{
            const response = await axios.get(
                `http://localhost:8080/item/${itemId}`
            );
            console.log("상품 상세:", response.data);
            setItem(response.data);
        }catch(error){
            console.error("상품 상세조회 실패", error);
        }
    };

    //상품이미지 정보 동기화

    const getItemImgs = async() =>{
        try{
            const response = await axios.get(
                `http://localhost:8080/itemImgs/${itemId}`
            );
            console.log("상품 이미지: ", response.data);
            setItemImgs(response.data);
        }catch(error){
            console.error("상품 이미지 조회 실패", error);
        }
    };

    if(!item){
        return <p>상품 불러오는 중....</p>;
    }

    const mainImg = itemImgs.find((img)=> img.thumbnailYn === "Y");
    const subImgs = itemImgs.filter((img)=> img.thumbnailYn === "N");

   
    return (
        <div>
            
            <h1>상품 상세 페이지</h1>

            <h2>{item.itemName}</h2>

            {mainImg ? (
                <div>
                    <h3>대표 이미지</h3>
                    <img src={`http://localhost:8080${mainImg.itemImgUrl}`} alt={mainImg.itemImgName} width="300"/>
                </div>
            ) : (
                <p>대표 이미지가 없습니다.</p>
            )}

            {subImgs.length>0 &&(
                <div>
                    <h3>서브 이미지</h3>

                    {subImgs.map((img)=>(
                        <img key={img.itemImgId}src={`http://localhost:8080${img.itemImgUrl}`}alt={img.itemImgName} width="150" style={{marginRight: "10px", marginBottom:"10px",}}/>
                    ))}
                </div>
            )}
            <hr/>

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