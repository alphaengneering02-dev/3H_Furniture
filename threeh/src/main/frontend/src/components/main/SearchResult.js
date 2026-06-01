//검색결과 페이지
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchResult_item from './SearchResult_item';
import SearchResult_filter from './SearchResult_filter';
import '../../css/mainPageCss/searchResult.css';
import Header from './Header';
import Footer from './Footer';
import Item from '../item/Item';
import { useSearch } from '../../hook/SearchContext';

const SearchResult = () => {

    //검색상태 Context에서 모든 상태와 옵션을 가져옵니다.
    const {
        category_options, color_options, price_options,
        searchValue, setSearchValue, searchKey, setSearchKey,
        changeSearchValue, resetSearchKey, deleteSearchKey,
        generateQueryString, doSearch
    } = useSearch()
    
    const [searchParams] = useSearchParams()  //URL의 쿼리스트링(? 뒤의 파라미터)을 가져오는 훅
    const [searchResult, setSearchResult] = useState([])
    const [currentSearchValue, setCurrentSearchValue] = useState("전체")

    const memoSearchKey =  useMemo(() => {return searchKey},[searchKey])
    const categoryKey = useMemo(() => {return memoSearchKey.category},[memoSearchKey.category])
    const colorKey = useMemo(() => {return memoSearchKey.color},[memoSearchKey.color])
    const priceKey = useMemo(() => {return memoSearchKey.price},[memoSearchKey.price])


    //검색된 데이터를 가져오는 함수
    const getSearchResult = async() => {
        try {
            //1. 백엔드(Spring Boot) API에서 데이터 가져오기
            const res = await axios.get("http://localhost:8080/api/main/searchResult", {
                params: {
                    searchValue: searchValue,
                    category: categoryKey.join(','),  // 배열을 "침실,거실" 형태의 문자열로 변환
                    color: colorKey.join(','),        // "White,Black"
                    price: priceKey.join(','),        // "0,500"
                }
            })

            //2. 백엔드에서 받아온 가구 리스트를 상태에 저장
            setSearchResult(res.data)

            //3. 콘솔에 찍어보기
            console.log("[새로 조회된 가구리스트 (상위 4개)]\n")
            const sliceRes = res.data.slice(0, 4)
            console.log(sliceRes)
            console.log(res.data)
        } catch (error) {
            console.error("검색 결과를 불러오는데 실패했습니다.", error);
        }
    }


    //검색결과 페이지 진입 시, 검색된 데이터 가져오기
    useEffect(() => {
        //1. URL에서 필요한 데이터 꺼내기 (꺼낼 때 %2C는 자동으로 쉼표로 해석됨)
        const urlSearchValue = searchParams.get("searchValue"); // "검색어"
        const urlCategory = searchParams.get("category");       // "거실,침실"
        const urlColor = searchParams.get("color");             // "White,Black"
        const urlPrice = searchParams.get("price");             // "200,300"

        // 2. 읽어온 URL 파라미터를 Context 상태(UI)에 반영 (UI 동기화의 핵심)
        setSearchValue(urlSearchValue);
        setCurrentSearchValue(searchParams.get("searchValue") || "전체");
        setSearchKey({
            category: urlCategory ? urlCategory.split(',') : category_options,
            color: urlColor ? urlColor.split(',') : color_options,
            price: urlPrice ? urlPrice.split(',').map(Number) : [0, 500]
        })

        // 4. URL 파라미터 값으로 데이터 가져오기
        getSearchResult()
    }, [searchParams])  //searchParams가 바뀔 때마다(새로 검색할 때마다) 다시 실행



    //상품 최종 가격 계산
    //백엔드에서 itemFinalPrice가 오면 그 값을 사용
    //없으면 원가-할인금액으로 계산
    //천 단위 콤마 적용
    const getFinalPrice = (item) => {
        if (item.itemFinalPrice !== null && item.itemFinalPrice !== undefined) {
        return Number(item.itemFinalPrice);
        }

        return Number(item.itemPrice || 0) - Number(item.itemDiscountPrice || 0);
    };

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString();
    };



    return (
        <div>
            <div className='main-header'>
                <Header/>
            </div>


            {/* 상단 검색어 타이틀 */}
            <div className="search-result-page">
                <div className="search-result-header">
                    <h2><span className="search-result-highlight">{currentSearchValue}</span> 에 대한 검색결과</h2>
                </div>

                {/* 필터 영역 */}
                <div>
                    <SearchResult_filter/>
                    {/* <SearchResult_filter myFilter={myFilter} setMyFilter={setMyFilter}/> */}
                </div>

                {/* 총 상품 개수 및 정렬 */}
                <div className="search-result-list-header">
                    <span className="search-result-total-count"><b>{searchResult.length.toLocaleString()}</b> 개 상품</span>
                </div>


                {/* 검색 결과 그리드 */}
                {
                    searchResult.length > 0 
                    ? (
                        <div className="search-result-grid-container">
                            {searchResult.map(item =>
                                <SearchResult_item key={item.itemId} item={item} getFinalPrice={getFinalPrice} formatPrice={formatPrice}/>
                            )}
                        </div>
                    ) 
                    : (
                        <div className="search-result-empty-result">
                            <p>검색결과가 없습니다.</p>
                        </div>
                    )
                }
            </div>


            <div className="main-mypage-footer">
                <Footer/>
            </div>
        </div>
    );
};

export default SearchResult;