//검색결과 페이지
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchResult_item from './SearchResult_item';

const SearchResult = () => {
    
    const [searchParams] = useSearchParams()  //URL의 쿼리스트링(? 뒤의 파라미터)을 가져오는 훅
    const [searchResult, setSearchResult] = useState([])

    useEffect(() => {
        getSearchResult()
    }, [searchParams])  //searchParams가 바뀔 때마다(새로 검색할 때마다) 다시 실행


    
    const getSearchResult = async() => {
        //1. URL에서 필요한 데이터 꺼내기 (꺼낼 때 %2C는 자동으로 쉼표로 해석됨)
        const searchValue = searchParams.get("searchValue"); // "검색어"
        const space = searchParams.get("space");             // "livingroom,bedroom"
        const kind = searchParams.get("kind");               // "desk,chair"
        const brand = searchParams.get("brand");             // "livart,hanssem"
        const material = searchParams.get("material");       // "wood,fabric"
        const size = searchParams.get("size");               // "1,2"
        const price = searchParams.get("price");             // "0,50"


        //2. 백엔드(Spring Boot) API로 데이터 전송하기
        try {
            //axios의 'params' 속성: GET 요청 시 쿼리 파라미터를 알아서 만들어줌.
            const res = await axios.get("http://localhost:8080/api/main/searchResult", {  //*** itemController에 관련 메소드 추가건의
                params: {
                    searchValue: searchValue,
                    space: space,
                    kind: kind,
                    brand: brand,
                    material: material,
                    price: price,
                    size: size
                }
            })
            

            //백엔드에서 받아온 가구 리스트를 상태에 저장
            console.log("[검색된 가구리스트 (상위 4개)]\n")

            const sliceRes = res.data.slice(0, 4)
            setSearchResult(sliceRes)

            console.log(sliceRes)
        } catch (error) {
            console.error("검색 결과를 불러오는데 실패했습니다.", error);
        }
    }



    return (
        <div>
            검색결과 페이지
            {
                searchResult && searchResult.length>0
                ? (
                    searchResult.map(item =>
                        <SearchResult_item key={item.itemId} item={item}/>
                    )
                )
                : (
                    <p>검색에 실패하거나, 검색결과가 없습니다...</p>
                )
            }
        </div>
    );
};

export default SearchResult;