//검색 관련 상태(searchValue, searchKey 등)를 전역적으로 관리하는 컨텍스트
import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Context 생성
const SearchContext = createContext();

// 2. Provider 컴포넌트 생성
export const SearchProvider = ({ children }) => {
    const navigate = useNavigate();

    // 옵션 리스트 정의
    const category_options = ['거실', '침실', '욕실', '주방'];
    const color_options = ['White', 'Black', 'Wood'];
    const price_options = [
        {value: 0, label: '0원'},
        {value: 100, label: '100만원'},
        {value: 200, label: '200만원'},
        {value: 300, label: '300만원'},
        {value: 400, label: '400만원'},
        {value: 500, label: '500만원'},
    ];

    // 검색어 상태
    const [searchValue, setSearchValue] = useState("");

    // 검색조건 상태
    const [searchKey, setSearchKey] = useState({
        "category": category_options,
        "color": color_options,
        "price": [0, 500],
    });


    //검색어 입력
    const changeSearchValue = (evt) => {setSearchValue(evt.target.value)}

    //검색조건 초기화 함수
    const resetSearchKey = () => {
        setSearchKey({
            category: category_options,
            color: color_options,
            price: [0, 500],
        })
    }

    //검색조건 전체삭제 함수
    const deleteSearchKey = () => {
        setSearchKey({
            category: [],
            color: [],
            price: [0, 0],
        })
    }

    
    //검색결과 URL 생성
    const generateQueryString = (searchValue, searchKey) => {
        const params = new URLSearchParams();
        if (searchValue.trim() !== "") params.append("searchValue", searchValue);

        Object.keys(searchKey).forEach(key => {
            const value = searchKey[key];
            if (value.length > 0) {
                params.append(key, value.join(','))
            }
        })

        return params.toString()
    }


    //검색 함수
    const doSearch = async() => {
        try {
            //1. Query String 생성 (예: ?searchValue=책상&space=거실,침실&size=1,6)
            const params = new URLSearchParams()  //파라미터를 생성하는 훅
            if (searchValue.trim() !== "") {  //parameter - 검색어
                params.append("searchValue", searchValue);
            }

            Object.keys(searchKey).forEach(key => {  //parameter - 다중 검색 조건(searchKey)을 순회하며 파라미터에 추가
                const value = searchKey[key];  //검색조건 배열
                if (value.length > 0) {  //유효한 값들만 params에 쉼표(,)로 연결해 추가 (예: ["거실", "주방"])
                    params.append(key, value.join(','))
                }
            })

            //2. 완성된 Query String 확인 (디버깅용)
            const queryString = params.toString()
            console.log("현재 searchKey 상태: ", searchKey);
            console.log("검색 쿼리: ", queryString)

            //3. 프론트엔드 라우터(SearchResult 페이지)로 이동
            navigate(`/searchResult?${queryString}`)

        } catch (error) {
            console.error("검색 이동 중 오류 발생:", error)
        }
    }


    //검색결과 페이지 - 재검색(URL 변경)
    const updateAndSearch = (newSearchKey) => {
        setSearchKey(newSearchKey) //Context 상태 업데이트
        const queryString = generateQueryString(searchValue, newSearchKey) //새 상태로 URL 생성
        navigate(`/searchResult?${queryString}`) // 페이지 이동 (백엔드 재요청 유도)
    }


    return (
        <SearchContext.Provider value={{
            category_options, color_options, price_options,
            searchValue, setSearchValue, searchKey, setSearchKey,
            changeSearchValue, resetSearchKey, deleteSearchKey,
            generateQueryString, doSearch, updateAndSearch
        }}>
            {children}
        </SearchContext.Provider>
    );
};

// 3. 커스텀 훅 생성 (사용하기 편하게 만듦)
export const useSearch = () => {
    return useContext(SearchContext);
};