import React, { useEffect, useState } from 'react';
import Main_itemList_item from './Main_itemList_item';

const Main_itemList = ({ totalItemList }) => {
    // 1. 초기값 설정 단계에서 상위 4개만 잘라서 넣어줍니다. (totalItemList가 없을 때를 대비해 빈 배열 예외처리)
    const [itemList, seItemList] = useState([]);

    useEffect(() => {
        try {
            if (totalItemList && totalItemList.length > 0) {
                console.log("[ITEM LIST 영역에 추가된 상품리스트 (상위 4개)]\n");
                
                // 원본 데이터에서 상위 4개만 추출하여 상태 업데이트
                const slicedItemList = [...totalItemList].slice(0, 4);
                seItemList(slicedItemList);
                
                console.log(slicedItemList);
            }
        } catch (error) {
            console.error("[ITEM LIST 영역에 상품 추가 실패]\n", error);
        }
    }, [totalItemList]); // 부모로부터 전달받은 totalItemList가 변경될 때만 실행됩니다.

    return (
        <section className="itemList">
            <h2>ITEM LIST</h2>

            <article className="items">
                {
                    itemList && itemList.length > 0
                    ? (
                        itemList.map(item =>
                            <Main_itemList_item key={item.itemId} item={item}/>
                        )
                    )
                    : (
                        <p>상품목록 불러오는 중....</p>
                    )
                }
            </article>
        </section>
    );
};

export default Main_itemList;