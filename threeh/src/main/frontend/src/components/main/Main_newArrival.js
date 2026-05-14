import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Main_newArrival_item from './Main_newArrival_item';

const Main_newArrival = () => {

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




    return (
        <section className="newArrival">
            <h2>NEW ARRIVAL</h2>

            <article className="items">
                {
                    item && item.map(prod =>
                        <Main_newArrival_item key={prod.itemId} prod={prod} prodImgs={itemImgs}/>
                    )
                }

                <div>
                    <div>
                        상품 이미지
                        <button>♡</button>
                    </div>
                    <p>상품명</p>
                    <h4>가격</h4>
                </div>

                <div>
                    <div>
                        상품 이미지
                        <button>♡</button>
                    </div>
                    <p>상품명</p>
                    <h4>가격</h4>
                </div>

                <div>
                    <div>
                        상품 이미지
                        <button>♡</button>
                    </div>
                    <p>상품명</p>
                    <h4>가격</h4>
                </div>
            </article>
        </section>
    );
};

export default Main_newArrival;