import React from "react";
import {useEffect,useState} from "react";
import axios from "axios";

function Item(){

    
    const [item, setItem] = useState([]);

    useEffect(()=> {
        axios.get("http://localhost:8080/item")
            .then((response) => {
                console.log(response.data);
                setItem(response.data);
            })
            .catch((error)=>{
                console.error("뭐 잘못했나봐..",error);
            });
    },[]);

    return(

        <div>
            
            <h1>상품 목록</h1>
            {item.length === 0 ? (
                <p>상품이 없습니다.</p>
            ):(
                item.map((item) => (
                    <div key={item.itemId}>
                        
                        <h2>{item.itemName}</h2>

                        <p>카테고리: {item.itemCategory}</p>
                        <p>상품 설명: {item.itemDetail}</p>
                        <p>상품 색상: {item.itemColor}</p>
                        <p>상품 가격: {item.itemPrice}</p>
                        <p>상품 할인가격: {item.itemDiscountPrice}</p>
                        <p>상품 최종가격: {item.itemDiscountPrice}</p>
                        <p>상품 재고: {item.itemDiscountPrice}</p>

                    </div>
                ))
            )}

        </div>
    );
    
}

export default Item;