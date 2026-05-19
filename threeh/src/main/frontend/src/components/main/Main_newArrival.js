import React, { useEffect, useState } from 'react';
import Main_newArrival_item from './Main_newArrival_item';

const Main_newArrival = ({itemList}) => {

    //NEW ARRIVAL 데이터 객체
    const [newArrivalList, setNewArrivalList] = useState([])

    useEffect(() => {  // itemList 상태가 변경될 때마다 setNewArrival이 실행됨.
        if (itemList.length > 0) {
            setNewArrival();
        }
    }, [itemList]);



    //NEW ARRIVAL 데이터 세팅함수 (최신순 - 상품리스트 배열을 뒤집어서 한 번에 저장)
    const setNewArrival = () => {
        try {
            console.log("[NEW ARRIVAL 영역에 추가된 상품리스트 (상위 4개)]\n")

            //원본 배열 훼손 없이 역순 배열 생성 + 4개 추출
            const reversedItemList = [...itemList].reverse().slice(0, 4)
            //상태를 한번만 업데이트
            setNewArrivalList(reversedItemList)
            
            console.log(reversedItemList);
        } catch(error){
            console.error("[NEW ARRIVAL 영역에 상품 추가 실패]\n", error);
        }
    }



    return (
        <section className="newArrival">
            <h2>NEW ARRIVAL</h2>

            <article className="items">
                {
                    newArrivalList && newArrivalList.length>0
                    ? (
                        newArrivalList.map(item =>
                            <Main_newArrival_item key={item.itemId} item={item}/>
                        )
                    )
                    : (
                        <p>신상품 불러오는 중....</p>
                    )
                }
            </article>
        </section>
    );
};

export default Main_newArrival;



{/* 
<div>
    <div>
        상품 이미지
        <button>♡</button>
    </div>
    <p>상품명</p>
    <h4>가격</h4>
</div>  
*/}