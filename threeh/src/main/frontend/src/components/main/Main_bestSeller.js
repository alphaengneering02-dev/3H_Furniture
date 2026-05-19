import React, { useEffect, useState } from 'react';
import Main_bestSeller_item from './Main_bestSeller_item';

const Main_bestSeller = ({itemList}) => {

    //BEST SELLER 데이터 객체
    const [bestSellerList, setbestSellerList] = useState([])

    useEffect(() => {  // itemList 상태가 변경될 때마다 setbestSeller가 실행됨.
        if (itemList.length > 0) {
            setbestSeller();
        }
    }, [itemList]);



    //BEST SELLER 데이터 세팅함수 (재고 많은순, 카테고리로 분류)
    const setbestSeller = () => {
        try {
            console.log("[BEST SELLER 영역에 추가된 상품리스트 (상위 4개)]\n")

            //원본 배열 훼손 없이 재고순 배열 생성 + 4개 추출
            const stockOrderedList = [...itemList].sort(descByStock).slice(0, 4)
            //상태를 한번만 업데이트
            setbestSellerList(stockOrderedList)
            
            console.log(stockOrderedList);
        } catch(error){
            console.error("[BEST SELLER 영역에 상품 추가 실패]\n", error);
        }
    }
    

    const descByStock = (a, b) => {
        return b.itemStock - a.itemStock //재고 많은순 (b상품이 a상품 앞에 추가됨)
    }


    //BEST SELLER 영역의 상품 세팅 (재고순, 카테고리로 분류)



    return (
        <section className="bestSeller">
            <h2>BEST SELLER</h2>

            <article className="items">
                {
                    bestSellerList && bestSellerList.length>0
                    ? (
                        bestSellerList.map(item =>
                            <Main_bestSeller_item key={item.itemId} item={item}/>
                        )
                    )
                    : (
                        <p>베스트셀러 상품 불러오는 중....</p>
                    )
                }
            </article>
        </section>
    );
};

export default Main_bestSeller;



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