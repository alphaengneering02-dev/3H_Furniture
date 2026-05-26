import React, { useEffect, useState } from 'react';
import { Slider } from "@mui/material";

const SearchResult_filter = ({myFilter, setMyFilter}) => {

    //전체 삭제 및 초기화 함수
    const resetMyFilter = () => {
        setMyFilter({
            category: [],
            color: [],
            price: [0, 500],
        })
    }


    //체크박스 옵션 리스트 정의
    const category_options = ['거실', '침실', '욕실', '주방']
    const color_options = ['White', 'Black', 'Wood']  //**상품마다
    const price_options = [
        {value: 0, label: '0원'},
        {value: 100, label: '100만원'},
        {value: 200, label: '200만원'},
        {value: 300, label: '300만원'},
        {value: 400, label: '400만원'},
        {value: 500, label: '500만원'},
    ]


    //전체 선택/해제 핸들러
    const handleAllCheck = (type, options) => {  
        //type: category, color
        //options: 선택한 항목('거실', '하얀색', ...)
        setMyFilter((prev) => {
            //기존 선택값 가져오기
            const currentList = prev[type] || [];
            
            //해제/선택 토글
            const nextList = currentList.length===options.length ? [] : [...options];

            return {
                ...prev,
                [type]: nextList
            }
        })
    }


    //개별 선택/해제 핸들러
    const handleSingleCheck = (type, value) => {
        setMyFilter((prev) => {
            const currentList = prev[type] || [];
            
            //해제/선택 토글
            const nextList = currentList.includes(value)
                ? currentList.filter((item) => item!==value)
                : [...currentList, value];

            return { 
                ...prev, 
                [type]: nextList 
            }
        })
    }


    //Range Slider
    const changePrice = (evt, range) => {
        setMyFilter({
            ...myFilter,
            price: range
        }) 
    }

    

    return (
         <section className='search-result-filter-container'>
            {/* 검색 조건 헤더 영역 */}
            <article className='search-result-filter-header'>
                <h3 className='search-result-filter-main-title'>검색 조건</h3>
                <button type='button' className='search-result-filter-reset-btn' onClick={resetMyFilter}>
                    전체 삭제
                </button>
            </article>

            {/* 필터 본문 영역 */}
            <article className='search-result-filter-body'>
                
                {/* 카테고리 */}
                <div className='search-result-filter-section'>
                    <div className='search-result-filter-group'>
                        <p className='search-result-filter-title'>카테고리</p>
                        <div className='search-result-checkbox-group'>
                            <div className='search-result-checkbox-item'>
                                <input type="checkbox"
                                id="category_all"
                                checked={myFilter.category.length === category_options.length}
                                onChange={() => handleAllCheck('category', category_options)}/>
                                <label htmlFor="category_all">전체</label>
                            </div>

                            {category_options.map((item) => (
                                <div className='search-result-checkbox-item' key={item}>
                                    <input 
                                        type="checkbox" 
                                        id={`category_${item}`}
                                        checked={myFilter.category.includes(item)}
                                        onChange={() => handleSingleCheck('category', item)}
                                    />
                                    <label htmlFor={`category_${item}`}>{item}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 색상 */}
                    <div className='search-result-filter-group'>
                        <p className='search-result-filter-title'>색상</p>
                        <div className='search-result-checkbox-group'>
                            <div className='search-result-checkbox-item'>
                                <input type="checkbox"
                                id="color_all"
                                checked={myFilter.color.length === color_options.length}
                                onChange={() => handleAllCheck('color', color_options)}/>
                                <label htmlFor="color_all">전체</label>
                            </div>

                            {color_options.map((item) => (
                                <div className='search-result-checkbox-item' key={item}>
                                    <input 
                                        type="checkbox" 
                                        id={`color_${item}`}
                                        checked={myFilter.color.includes(item)}
                                        onChange={() => handleSingleCheck('color', item)}
                                    />
                                    <label htmlFor={`color_${item}`}>{item}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 가격대 */}
                <div className='search-result-filter-group'>
                    <h4 className='search-result-filter-title'>가격대</h4>
                    <div className='search-result-slider-wrapper'>
                        <Slider
                            aria-label="가격대 범위 설정"
                            min={0} max={500}
                            value={myFilter.price}
                            onChange={changePrice}
                            marks={price_options}
                            valueLabelDisplay="on"
                            disableSwap
                            sx={{ 
                                color: '#000', // 슬라이더 기본 색상 (검은색)
                                '& .MuiSlider-valueLabel': {
                                    backgroundColor: '#000', // 툴팁 배경색
                                }
                            }}
                        />
                    </div>
                </div>
            </article>
        </section>
    );
};

export default SearchResult_filter;