import React from 'react';

const AdminSearch = ({ searchTerm, setSearchTerm, searchType, setSearchType, onSearch, isSearching }) => {
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className="admin-sidebar-search-box">
            {/* 🔍 1층: 셀렉트 박스 */}
            <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="admin-search-select-block"
            >
                <option value="all">전체 검색</option>
                <option value="member">회원 정보 검색</option>
                <option value="item">상품 정보 검색</option>
            </select>

            {/* ✍️ 2층: 입력창 영역 */}
            <div className="admin-search-input-block-wrapper">
                <input 
                    type="text" 
                    placeholder={
                        searchType === 'all' ? "검색어를 입력하세요..." :
                        searchType === 'member' ? "이름, ID, 폰번호 입력..." : "상품명 입력..."
                    } 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="admin-search-input-block"
                />
                {searchTerm && (
                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setTimeout(() => onSearch(), 10);
                        }}
                        className="admin-search-clear-btn-block"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* 🚀 3층: 전체 너비 검색 버튼 */}
            <button
                onClick={onSearch}
                disabled={isSearching}
                className={`admin-search-submit-btn-block ${isSearching ? 'admin-is-searching' : ''}`}
            >
                {isSearching ? '검색 중...' : '검색하기'}
            </button>
        </div>
    );
};

export default AdminSearch;