import React, { useState } from 'react';

const AdminSearch = ({
    searchTerm,
    setSearchTerm,
    searchType,
    setSearchType,
    onSearchSubmit 
}) => {
    // 💡 실시간 입력값을 제어할 내부 로컬 상태 추가
    const [localTerm, setLocalTerm] = useState(searchTerm);

    // 💡 실제 검색을 실행하는 함수
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault(); // Form 전송 막기
        setSearchTerm(localTerm);   // 버튼을 누를 때만 부모의 상태를 변경!
    };

    // 💡 엔터키 지원
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    // ✕ 버튼 클릭 시 초기화
    const handleClear = () => {
        setLocalTerm('');
        setSearchTerm(''); // 부모 검색어도 함께 초기화
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
                        searchType === 'all'
                            ? "검색어를 입력하세요..."
                            : searchType === 'member'
                            ? "이름, ID, 폰번호 입력..."
                            : "상품명 입력..."
                    }
                    value={localTerm} // 💡 부모의 searchTerm 대신 localTerm 연결
                    onChange={(e) => setLocalTerm(e.target.value)} // 💡 입력 시에는 내부 상태만 변경
                    onKeyDown={handleKeyDown} // 💡 엔터키 감지
                    className="admin-search-input-block"
                />

                {localTerm && (
                    <button
                        onClick={handleClear}
                        className="admin-search-clear-btn-block"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* 🚀 3층: 전체 너비 검색 버튼 */}
            <button
                type="button"
                onClick={handleSearchSubmit} // 💡 클릭 시에만 검색 반영
                className="admin-search-submit-btn-block"
                style={{ cursor: 'pointer' }} // 클릭 유도 스타일링 추가
            >
                검색하기
            </button>
        </div>
    );
};

export default AdminSearch;