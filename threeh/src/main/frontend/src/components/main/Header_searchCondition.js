import React, { useEffect, useState } from 'react';
import { Slider } from "@mui/material";

const Header_searchCondition = ({searchKey, setSearchKey}) => {

    //검색조건 선택 (multiple select 가능)
    useEffect(() => {
        resetSearchKey()
    }, [])


    //예: { space: ['livingroom', 'bedroom', ...] }
    const changeSearchKey = (evt) => {
        const {name, options} = evt.target;
        
        //선택된 option value들의 배열
        const selectedValues = Array.from(options)
                                    .filter(option => option.selected)  //선택된 option들만
                                    .map(option => option.value)  //value 추출
        
        setSearchKey({
            ...searchKey,
            [name]: selectedValues
        })
    }


    const resetSearchKey = () => {
        setSearchKey({
            "space": ["all"],
            "kind": ["all"],
            "brand": ["all"],
            "material": ["all"],
            "size": [1, 6],
            "price": [0, 100]
        })
    }



    //Range Slider
    const marksSize = [
        {
            value: 1,
            label: '최소',
        },
        {
            value: 2,
            label: '2인용',
        },
        {
            value: 3,
            label: '3인용',
        },
        {
            value: 4,
            label: '4인용',
        },
        {
            value: 5,
            label: '5인용',
        },
        {
            value: 6,
            label: '최대',
        },
    ]

    const changeSize = (evt, range) => {
        setSearchKey({
            ...searchKey,
            size: range
        }) 
    }


    const marksPrice = [
        {
            value: 0,
            label: '0',
        },
        {
            value: 25,
            label: '25',
        },
        {
            value: 50,
            label: '50',
        },
        {
            value: 75,
            label: '75',
        },
        {
            value: 100,
            label: '100',
        },
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


            <p>* 다중선택을 하려면 Ctrl 또는 Cmd키를 누르고 클릭하세요.</p>


            <article>
                {/* 사용공간 */}
                <div>
                    <p>사용공간</p>
                    <select id="space" name="space" value={searchKey.space} multiple onChange={changeSearchKey}>  
                        <option value="전체" selected>전체</option>
                        <option value="거실">거실</option>
                        <option value="침실">침실</option>
                        <option value="주방">주방</option>
                    </select>
                </div>

                {/* 종류 */}
                <div>
                    <p>종류</p>
                    <select id="kind" name="kind" value={searchKey.kind} multiple onChange={changeSearchKey}>  
                        <option value="전체" selected>전체</option>
                        <option value="책상">책상</option>
                        <option value="의자">의자</option>
                        <option value="책꽃이">책꽃이</option>
                    </select>
                </div>

                {/* 브랜드 */}
                <div>
                    <p>브랜드</p>
                    <select id="brand" name="brand" value={searchKey.brand} multiple onChange={changeSearchKey}>  
                        <option value="전체" selected>전체</option>
                        <option value="리바트">리바트</option>
                        <option value="한샘">한샘</option>
                        <option value="허먼밀러">허먼 밀러</option>
                    </select>
                </div>

                {/* 소재 */}
                <div>
                    <p>소재</p>
                    <select id="material" name="material" value={searchKey.material} multiple onChange={changeSearchKey}>  
                        <option value="전체" selected>전체</option>
                        <option value="페브릭">페브릭</option>
                        <option value="원목">원목</option>
                        <option value="메탈">메탈</option>
                    </select>
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

export default Header_searchCondition;