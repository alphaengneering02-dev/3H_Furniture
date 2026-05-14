import React from "react";
import {useEffect,useState} from "react";
import { Link } from "react-router-dom";
import axios from "axios";


function Item(){

    
    const [items, setItem] = useState([]);

    useEffect(()=> {
        axios.get("api/item")
            .then((response) => {
                console.log(response.data);
                setItem(response.data);
            })
            .catch((error)=>{
                console.error("뭐 잘못했나봐..",error);
            });
    },[]);

    return (
            <div>
            <h1>상품 목록</h1>

            {items.length === 0 ? (
                <p>상품이 없습니다.</p>
            ) : (
                items.map((item) => (
                <div key={item.itemId}>
                    {item.itemImgUrl ? (
                    <img
                        src={`http://localhost:8080${item.itemImgUrl}`}
                        alt={item.itemName}
                        width="200"
                    />
                    ) : (
                    <p>이미지 없음</p>
                    )}

                    <Link to={`/item/${item.itemId}`}>
                    <h2>{item.itemName}</h2>
                    </Link>

                    <p>카테고리: {item.itemCategory}</p>
                    <p>상품 설명: {item.itemDetail}</p>
                    <p>상품 색상: {item.itemColor}</p>
                    <p>상품 가격: {item.itemPrice}</p>
                    <p>상품 할인가격: {item.itemDiscountPrice}</p>
                    <p>상품 최종가격: {item.itemFinalPrice}</p>
                    <p>상품 재고: {item.itemStock}</p>
                </div>
                ))
            )}
            </div>
        );
        }

export default Item;