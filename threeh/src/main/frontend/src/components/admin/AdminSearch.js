import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/adminCss/AdminDashboard.css';

const AdminSearch = ({ items = [], onSearch }) => {
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('all');
    const [localTerm, setLocalTerm] = useState('');     
    const [filteredItems, setFilteredItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false); 
    
    // 디바운스 타이머를 추적하기 위한 ref
    const debounceTimerRef = useRef(null);

    // 백엔드 조기 탈락(Fast-Fail) 방어용 기본 필수 파라미터 고정값
    const BACKEND_DEFENSES = {
        category: '거실,침실,주방,욕실',
        color: 'White,Black,Gray,Beige,Wood',
        price: '0,1000'
    };

    // 한글 색상 검색어 영문 치환 매핑 테이블
    const colorMap = {
        '화이트': 'white', '흰색': 'white',
        '블랙': 'black', '검정': 'black', '검은색': 'black',
        '우드': 'wood', '원목': 'wood', '나무': 'wood',
        '그레이': 'gray', '회색': 'gray',
        '실버': 'silver', '은색': 'silver',
        '베이지': 'beige'
    };

    const handleClear = () => {
        setLocalTerm('');
        setFilteredItems([]);
        setIsOpen(false);
    };

    const handleItemClick = (itemId) => {
        navigate(`/item/${itemId}`); 
        setIsOpen(false);
        setLocalTerm('');
    };

    // ⚡ 공통 API 호출 함수
    const fetchSearchResults = async (keyword) => {
        let apiSearchValue = keyword.trim().toLowerCase();
        
        if (colorMap[apiSearchValue]) {
            apiSearchValue = colorMap[apiSearchValue];
        }

        const response = await axios.get('http://localhost:8080/api/main/searchResult', {
            params: { 
                searchValue: apiSearchValue,
                category: BACKEND_DEFENSES.category, 
                color: BACKEND_DEFENSES.color,       
                price: BACKEND_DEFENSES.price        
            },
            withCredentials: true
        });
        return response.data || [];
    };

    /* =======================================================
    // 💡 [주석 처리] 엔터 및 검색 버튼 클릭 시 즉시 실행되던 함수
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!localTerm.trim()) return;
        
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        setIsOpen(false); 

        if (searchType === 'member') {
            console.log("회원 정보 검색 처리 구역");
            return;
        }

        try {
            const data = await fetchSearchResults(localTerm);
            if (onSearch) {
                onSearch(data);
            }
            setFilteredItems([]); 
        } catch (error) {
            console.error("엔터 즉시 검색 에러:", error);
        }
    };
    ======================================================= */

    // ⏳ 타이핑 시 300ms 디바운스 후 실행되는 효과
    useEffect(() => {
        if (!localTerm.trim()) {
            setFilteredItems([]);
            // 검색어를 다 지웠을 때 대시보드 화면도 리셋하고 싶다면 주석 해제하세요
            // if (onSearch) onSearch([]); 
            return;
        }

        if (searchType === 'member') {
            setFilteredItems([]);
            return;
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(async () => {
            try {
                if (searchType === 'item' || searchType === 'all') {
                    const data = await fetchSearchResults(localTerm);
                    
                    // 1. 자동완성 말풍선 리스트에 데이터 세팅
                    setFilteredItems(data);

                    // 💡 2. [기능 이관] 엔터 버튼 대신, 타이핑이 끝나면 부모 대시보드 화면도 바로 갱신되도록 처리 완료!
                    if (onSearch) {
                        onSearch(data);
                    }
                }
            } catch (error) {
                console.error("실시간 자동완성 검색 에러:", error);
            }
        }, 300);

        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [localTerm, searchType]);

    return (
        <div className="admin-sidebar-search-box">
            <select 
                className="admin-search-select-block"
                value={searchType}
                onChange={(e) => {
                    setSearchType(e.target.value);
                    setFilteredItems([]);
                }}
            >
                <option value="all">전체 검색</option>
                <option value="member">회원 정보 검색</option>
                <option value="item">상품 정보 검색</option>
            </select>

            <form onSubmit={(e) => e.preventDefault()} className="admin-search-input-block-wrapper">
                <input
                    type="text"
                    placeholder={searchType === 'all' ? "검색어를 입력하세요..." : searchType === 'member' ? "이름, ID, 폰번호 입력..." : "상품명 입력..."}
                    value={localTerm}
                    onChange={(e) => {
                        setLocalTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="admin-search-input-block"
                />

                {localTerm && (
                    <button className='admin-search-submit-btn-block' type="button" onClick={handleClear}>✕</button>
                )}

                {isOpen && filteredItems.length > 0 && (
                    <ul className="admin-search-autocomplete-list">
                        {filteredItems.map((item) => (
                            <li 
                                key={item.itemId} 
                                className="admin-search-autocomplete-item"
                                onClick={() => handleItemClick(item.itemId)}
                                style={{ cursor: 'pointer' }} 
                            >
                                <span className="autocomplete-item-id">[{item.itemId}]</span>
                                <span className="autocomplete-item-name">{item.itemName}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    );
};

export default AdminSearch;