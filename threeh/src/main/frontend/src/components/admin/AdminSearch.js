import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/adminCss/AdminDashboard.css';

const AdminSearch = ({ items = [] }) => {
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('all');
    const [localTerm, setLocalTerm] = useState('');     
    const [filteredItems, setFilteredItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false); 

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

    // 🔥 [추가] 엔터를 치거나 '검색하기' 버튼을 눌렀을 때 실행될 함수
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!localTerm.trim()) return;

        setIsOpen(false); 
        console.log("엔터 또는 검색 버튼 클릭됨! 검색어:", localTerm);
    };

    useEffect(() => {
        if (!localTerm.trim()) {
            setFilteredItems([]);
            return;
        }
        const delayDebounceTimer = setTimeout(async () => {
            try {
                if (searchType === 'item' || searchType === 'all') {
                    
                    let apiSearchValue = localTerm.trim().toLowerCase();

                    if (apiSearchValue === '화이트' || apiSearchValue === '흰색') {
                        apiSearchValue = 'white';
                    } else if (apiSearchValue === '블랙' || apiSearchValue === '검정' || apiSearchValue === '검은색') {
                        apiSearchValue = 'black';
                    } else if (apiSearchValue === '우드' || apiSearchValue === '원목' || apiSearchValue === '나무') {
                        apiSearchValue = 'wood';
                    } else if (apiSearchValue === '그레이' || apiSearchValue === '회색') {
                        apiSearchValue = 'gray';
                    } else if (apiSearchValue === '실버' || apiSearchValue === '은색') {
                        apiSearchValue = 'silver';
                    } else if (apiSearchValue === '베이지') {
                        apiSearchValue = 'beige';
                    } else {
                        apiSearchValue = localTerm;
                    }

                    const response = await axios.get('http://localhost:8080/api/main/searchResult', {
                        params: { searchValue: apiSearchValue }, // 변환된 값 전송!
                        withCredentials: true
                    });
                    setFilteredItems(response.data);
                } else if (searchType === 'member') {
                    setFilteredItems([]);
                }
            } catch (error) {
                console.error("실시간 자동완성 검색 에러:", error);
            }
        }, 300);

        return () => clearTimeout(delayDebounceTimer);
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

            <div className="admin-search-input-block-wrapper">
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
                <button className='admin-search-submit-btn-block' type="button">검색하기</button>

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
            </div>
        </div>
    );
};

export default AdminSearch;