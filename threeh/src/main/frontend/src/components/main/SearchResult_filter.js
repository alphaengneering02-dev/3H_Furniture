import React, { useEffect, useState } from 'react';
import { Slider } from "@mui/material";
import { useSearch } from '../../hook/SearchContext';

const SearchResult_filter = ({onClickSearch, updateAndSearch}) => {

    //검색상태 Context에서 모든 상태와 옵션을 가져옵니다.
    const {
        category_options, color_options, price_options,
        searchValue, setSearchValue, searchKey, setSearchKey,
        changeSearchValue, resetSearchKey, deleteSearchKey,
        doSearch
    } = useSearch()


    //전체 선택/해제 핸들러
    const handleAllCheck = (type, options) => {  
        //type: category, color
        //options: 선택한 항목('거실', '하얀색', ...)
        setSearchKey((prev) => {
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
        setSearchKey((prev) => {
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
        setSearchKey({
            ...searchKey,
            price: range
        }) 
    }

    

    return (
         <section className='search-result-filter-container'>
            {/* 검색 조건 헤더 영역 */}
            <article className='search-result-filter-header'>
                <h3>검색 조건</h3>
                <button type='button' className='deleteAll' onClick={deleteSearchKey}>
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
                                checked={searchKey.category.length === category_options.length}
                                onChange={() => handleAllCheck('category', category_options)}/>
                                <label htmlFor="category_all">전체</label>
                            </div>

                            {category_options.map((item) => (
                                <div className='search-result-checkbox-item' key={item}>
                                    <input 
                                        type="checkbox" 
                                        id={`category_${item}`}
                                        checked={searchKey.category.includes(item)}
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
                                checked={searchKey.color.length === color_options.length}
                                onChange={() => handleAllCheck('color', color_options)}/>
                                <label htmlFor="color_all">전체</label>
                            </div>

                            {color_options.map((item) => (
                                <div className='search-result-checkbox-item' key={item}>
                                    <input 
                                        type="checkbox" 
                                        id={`color_${item}`}
                                        checked={searchKey.color.includes(item)}
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
                            value={searchKey.price}
                            onChange={changePrice}
                            marks={price_options}
                            valueLabelDisplay="on"
                            disableSwap
                        />
                    </div>
                </div>
            </article>


            <article className='search-result-select-body'>
                <button className='select' onClick={() => updateAndSearch()}>
                    조회하기
                </button>
            </article>
        </section>
    );
};

export default SearchResult_filter;