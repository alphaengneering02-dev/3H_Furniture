import React, { useEffect, useState } from 'react';
import Main_itemList_item from './Main_itemList_item';
import icon_prev from '../../assets/icon_prev.png'; // 메인 배너와 동일한 아이콘 경로로 맞춰주세요
import icon_next from '../../assets/icon_next.png';

const Main_itemList = ({ totalItemList }) => {
    const [itemList, setItemList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0); // 슬라이드 그룹 인덱스 (0: 1~4번 상품, 1: 5~8번 상품)

    useEffect(() => {
        try {
            if (totalItemList && totalItemList.length > 0) {
                // 기획 조건에 맞춰 상위 8개의 상품 데이터 추출
                const slicedItemList = [...totalItemList].slice(0, 8);
                setItemList(slicedItemList);
            }
        } catch (error) {
            console.error("[ITEM LIST 영역에 상품 추가 실패]\n", error);
        }
    }, [totalItemList]);

    // 8개 상품을 4개씩 2개의 그룹으로 나누어 제어합니다. (G1: index 0, G2: index 1)
    const handlePrev = () => {
        setCurrentIndex(prevIndex => (prevIndex === 0 ? 1 : 0));
    };

    const handleNext = () => {
        setCurrentIndex(prevIndex => (prevIndex === 1 ? 0 : 1));
    };

    const handleSelect = (index) => {
        setCurrentIndex(index);
    };

    return (
        <section className="itemList product-slider-section">
            <h2>상품 목록</h2>

            {/* 1. 상품 유무에 따른 전체 슬라이더 영역 조건 처리 */}
            {
                itemList && itemList.length > 0 ? (
                    /* 참일 때: 리액트 프래그먼트(<></>)로 슬라이더 전체 구조를 묶어줍니다. */
                    <>
                        {/* 슬라이더 전체를 감싸는 뷰포트 컨테이너 */}
                        <div className="slider-container">
                            <article 
                                className="items"
                                style={{
                                    transform: `translateX(-${currentIndex * 100}%)`,
                                    transition: 'transform 1.2s ease-in-out', /* 천천히 돌아가도록 설정 */
                                    display: 'flex',
                                    width: '200%' /* 4개 세트가 2그룹이므로 부모폭의 2배 */
                                }}
                            >
                                {itemList.map(item => (
                                    <Main_itemList_item key={item.itemId} item={item}/>
                                ))}
                            </article>

                            {/* 이전 / 다음으로 이동 버튼 (움직이는 items 밖, slider-container 안에 배치) */}
                            <div className="slider-btn-once">
                                <button id="prev" name="prev" className="prev" onClick={handlePrev}>
                                    <img src={icon_prev} alt='이전으로'/>
                                </button>
                                <button id="next" name="next" className="next" onClick={handleNext}>
                                    <img src={icon_next} alt='다음으로'/>
                                </button>
                            </div>
                        </div>

                        {/* 하단 인디케이터 버튼 */}
                        <ul className="slider-btn-indicator">
                            {[0, 1].map((index) => (
                                <li 
                                    key={index}
                                    className={currentIndex === index ? 'active' : ''} 
                                    onClick={() => handleSelect(index)}
                                ></li>
                            ))}
                        </ul>
                    </>
                ) : (
                    /* 거짓일 때: 상품이 없을 경우 문구만 노출 */
                    <p className="item-empty-text">상품이 없습니다.</p>
                )
            }
        </section>
    );
};

export default Main_itemList;