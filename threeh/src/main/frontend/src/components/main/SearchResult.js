//검색결과 페이지
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchResult_item from './SearchResult_item';
import SearchResult_filter from './SearchResult_filter';

const SearchResult = () => {
    
    const [searchParams] = useSearchParams()  //URL의 쿼리스트링(? 뒤의 파라미터)을 가져오는 훅
    const [searchResult, setSearchResult] = useState([])

    useEffect(() => {
        getSearchResult()
    }, [searchParams])  //searchParams가 바뀔 때마다(새로 검색할 때마다) 다시 실행


    
    const getSearchResult = async() => {
        //1. URL에서 필요한 데이터 꺼내기 (꺼낼 때 %2C는 자동으로 쉼표로 해석됨)
        const searchValue = searchParams.get("searchValue"); // "검색어"
        const category = searchParams.get("category");       // "거실,침실"
        const color = searchParams.get("color");             // "White,Black"
        const price = searchParams.get("price");             // "200,300"


        //2. 백엔드(Spring Boot) API로 데이터 전송하기
        try {
            //axios의 'params' 속성: GET 요청 시 쿼리 파라미터를 알아서 만들어줌.
            const res = await axios.get("http://localhost:8080/api/main/searchResult", {  //*** itemController에 관련 메소드 추가건의
                params: {
                    searchValue: searchValue,
                    category: category,
                    color: color,
                    price: price
                }
            })
            

            //백엔드에서 받아온 가구 리스트를 상태에 저장
            setSearchResult(res.data)

            //콘솔에 찍어보기
            console.log("[검색된 가구리스트 (상위 4개)]\n")
            const sliceRes = res.data.slice(0, 4)
            console.log(sliceRes)
        } catch (error) {
            console.error("검색 결과를 불러오는데 실패했습니다.", error);
        }
    }


    //상품 필터링
    //필터 선택
    /*
    filter (다중 선택 가능)
    - category: [거실, 침실, 주방...] 
    - color: [책상, 의자, 책꽃이...]
    */
    const [myFilter, setMyFilter] = useState({
        "category": [],
        "color": [],
        "price": [0, 500]
    })  //객체



    return (
        <div>
            검색결과 페이지

            상품 필터
            <SearchResult_filter myFilter={myFilter} setMyFilter={setMyFilter}/>


            {/* 검색 결과 */}
            {
                searchResult && searchResult.length>0
                ? (
                    searchResult

                    // 1. 카테고리 필터링 (선택 안했으면 통과, 선택했으면 포함된 것만 유지)
                    .filter(item => 
                        myFilter.category.length===0 || myFilter.category.includes(item.itemCategory)
                    )
                    // 2. 색상 필터링 (선택 안했으면 통과, 선택했으면 포함된 것만 유지)
                    .filter(item => 
                        myFilter.color.length === 0 || myFilter.color.includes(item.itemColor)
                    )
                    // 3. 가격 필터링 (최소값 이상이자 최대값 이하인 상품만 보이기)
                    .filter(item => {
                        const totalPrice = item.itemPrice - item.itemDiscountPrice
                        const min = myFilter.price[0] * 10000
                        const max = myFilter.price[1] * 10000

                        return totalPrice>=min && totalPrice<=max
                    })

                    // 3. 필터링 결과 출력
                    .map(item =>
                        <SearchResult_item key={item.itemId} item={item}/>
                    )
                )
                : (
                    <p>검색에 실패하거나, 검색결과가 없습니다.</p>
                )
            }
        </div>
    );
};

export default SearchResult;



// {
//     searchResult && searchResult.length>0
//     ? (
//         searchResult
//         .map(item =>
//             <SearchResult_item key={item.itemId} item={item}/>
//         )
//     )
//     : (
//         <p>검색에 실패하거나, 검색결과가 없습니다.</p>
//     )
// }