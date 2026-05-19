import React, { useEffect, useState } from 'react';
import { Slider } from "@mui/material";

const Header_searchCondition2 = ({searchKey, setSearchKey}) => {

    //검색조건 선택 (multiple select 가능)
    useEffect(() => {
        resetSearchKey()
    }, [])


    //검색조건 선택
    //예: { space: ['livingroom', 'bedroom', ...] }

    //검색조건 데이터
    const markSpace = [
        {id: "livingroom", title: "거실"},
        {id: "bedroom", title: "침실"},
        {id: "kitchen", title: "주방"},
    ]


    //1. 전체 선택일 때
    const checkAll = (evt) => {
        const {name, checked} = evt.target

        //전체 선택 클릭
        if(checked) {
            markSpace.forEach(space => 
                setSearchKey({
                    ...searchKey,
                    "space": space
                }) 
            )
        } else {
            setSearchKey({
                ...searchKey,
                "space": []
            }) 
        }
    }
    

    //2. 단일 선택일 때
    const checkSearchKey = (evt) => {
        const {name, value, checked} = evt.target;


        //해당 name에 저장되어 있는 value 배열을 가져옴 (예: 'space': ['livingroom', 'kitchen'])
        const currentValues = searchKey[name]

        //체크한 value값 추가/삭제
        let updatedValues;

        if (checked) {
            updatedValues = [...currentValues, value]  //체크되었을 때: 추가
        } else {
            updatedValues = currentValues.filter(val => val !== value)  //체크 해제되었을 때: 삭제
        }
        
        //상태 업데이트
        setSearchKey({
            ...searchKey,
            [name]: updatedValues
        })
    }


    const resetSearchKey = () => {
        setSearchKey({
            "space": [],
            "kind": [],
            "brand": [],
            "material": [],
            "size": [1, 6],
            "price": [0, 100]
        })
    }



    //Range Slider
    const marksSize = [
        {value: 1, label: '최소'},
        {value: 2, label: '2인용'},
        {value: 3, label: '3인용'},
        {value: 4, label: '4인용'},
        {value: 5, label: '5인용'},
        {value: 6, label: '최대'},
    ]

    const changeSize = (evt, range) => {
        setSearchKey({
            ...searchKey,
            size: range
        }) 
    }


    const marksPrice = [
        {value: 0, label: '0'},
        {value: 25, label: '25'},
        {value: 50, label: '50'},
        {value: 75, label: '75'},
        {value: 100, label: '100'},
    ]

    const changePrice = (evt, range) => {
        setSearchKey({
            ...searchKey,
            price: range
        }) 
    }



    return (
         <section className='list'>
            <article>
                <h3>검색 조건</h3>
                <button type='button' onClick={resetSearchKey}>전체 삭제</button>
            </article>


            <article>
                {/* 사용공간 */}
                <div>
                    <p>사용공간</p>
                    <div>
                        <div>
                            <input type="checkbox" checked={false} onChange={checkAll}/>
                            <label htmlFor="space_all">전체</label>
                        </div>
                        <div>
                            <input type="checkbox" checked={searchKey.space.includes("")} onChange={checkAll}/>
                            <label htmlFor="space_all">전체</label>
                        </div>
                        <div>
                            <input type="checkbox" checked={false} onChange={checkAll}/>
                            <label htmlFor="space_all">전체</label>
                        </div>
                        <div>
                            <input type="checkbox" checked={false} onChange={checkAll}/>
                            <label htmlFor="space_all">전체</label>
                        </div>
                    </div>
                </div>


                {/* 종류 */}
                <div>
                    <p>종류</p>
                    <div>
                        
                    </div>
                </div>


                {/* 브랜드 */}
                <div>
                    <p>브랜드</p>
                    <div>
                        
                    </div>
                </div>


                {/* 소재 */}
                <div>
                    <p>소재</p>
                    <div>
                        
                    </div>
                </div>


                {/* 사이즈 */}
                <div>
                    <h4>사이즈</h4>
                    <Slider
                        aria-label="사이즈 범위 설정"  //라벨 지정
                        min={1} max={6}
                        value={searchKey.size}
                        onChange={changeSize}
                        marks={marksSize}
                        valueLabelDisplay="on"
                        disableSwap
                        style={{marginLeft: '50px', width: '50%'}}
                    />
                </div>


                {/* 가격대 */}
                <div>
                    <h4>가격대</h4>
                    <Slider
                        aria-label="가격대 범위 설정"  //라벨 지정
                        min={0} max={100}
                        value={searchKey.price}
                        onChange={changePrice}
                        marks={marksPrice}
                        valueLabelDisplay="on"
                        disableSwap
                        style={{marginLeft: '50px', width: '50%'}}
                    />
                </div>
            </article>
        </section>
    );
};

export default Header_searchCondition2;