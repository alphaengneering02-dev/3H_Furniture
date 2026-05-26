import React, { useEffect, useRef, useState } from 'react';

const AdminMemoDay = () => {
    const [memo1, setMemo1] = useState('');
    const memoRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // 초기값 파싱 에러 및 빈 배열 부활 방지 로직
    const [dDayList, setDDayList] = useState(() => {
        const saved = localStorage.getItem("admin_dday_list");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("D-day 파싱 에러:", e);
            }
        }
        return [];
    });

    const [isDDayFormOpen, setIsDDayFormOpen] = useState(false);
    const [newDDayTitle, setNewDDayTitle] = useState('');
    const [newDDayDate, setNewDDayDate] = useState('');

    // 메모 저장
    const saveMemo = () => {
        localStorage.setItem("memo_textarea", memo1);
        if (memoRef.current) {
            localStorage.setItem("memo_editor", memoRef.current.innerHTML);
        }
        alert("메모가 저장되었습니다.");
    };

    // 엔터 시 불릿 생성
    const handleBulletKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const newLine = document.createElement("div");
            newLine.innerHTML = "• ";
            memoRef.current.appendChild(newLine);

            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(newLine, 1);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };

    // 실시간 시계 작동
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return `${year}년 ${month}월 ${day}일 (${days[date.getDay()]})`;
    };

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    // D-day 계산
    const calculateDDay = (targetDate) => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const target = new Date(targetDate); target.setHours(0, 0, 0, 0);
        
        const differenceInTime = target.getTime() - today.getTime();
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
        
        if (differenceInDays === 0) return "D-Day 🔥";
        return differenceInDays > 0 ? `D-${differenceInDays}` : `D+${Math.abs(differenceInDays)}`;
    };

    // 디데이 추가
    const handleAddDDay = (e) => {
        e.preventDefault();
        if (!newDDayTitle.trim() || !newDDayDate) {
            alert("제목과 날짜를 모두 입력해주세요.");
            return;
        }

        const newItems = [
            ...dDayList,
            { id: Date.now(), title: newDDayTitle, date: newDDayDate }
        ];

        setDDayList(newItems);
        localStorage.setItem("admin_dday_list", JSON.stringify(newItems));

        setNewDDayTitle('');
        setNewDDayDate('');
        setIsDDayFormOpen(false);
    };

    // 디데이 삭제
    const handleDeleteDDay = (id) => {
        const filtered = dDayList.filter(item => item.id !== id);
        setDDayList(filtered);
        localStorage.setItem("admin_dday_list", JSON.stringify(filtered));
    };

    // 메모 데이터 복구
    useEffect(() => {
        const savedTextarea = localStorage.getItem("memo_textarea");
        const savedEditor = localStorage.getItem("memo_editor");

        if (savedTextarea) setMemo1(savedTextarea);
        if (savedEditor && memoRef.current) {
            memoRef.current.innerHTML = savedEditor;
        }
    }, []);

    return (
        <div className="admin-memo-day-component">
            {/* 2. 날짜 및 시간 체계 화면 */}
            <div className="admin-time-panel">
                <div className="admin-date-text">{formatDate(currentTime)}</div>
                <div className="admin-time-text">{formatTime(currentTime)}</div>
            </div>

            {/* 3. 메모장 컴포넌트 섹션 */}
            <div className="admin-sidebar-section">
                <textarea
                    value={memo1}
                    onChange={(e) => setMemo1(e.target.value)}
                    placeholder="여기에 메모를 입력하세요..."
                    className="admin-memo-textarea"
                />
                <button onClick={saveMemo} className="admin-save-btn">
                    메모 저장하기
                </button>

                <div
                    ref={memoRef}
                    contentEditable
                    onKeyDown={handleBulletKeyDown}
                    suppressContentEditableWarning
                    className="admin-memo-editor"
                >
                    <div>• </div>
                </div>
            </div>

            {/* 내부 구분선 */}
            <hr className="admin-sidebar-divider" />

            {/* 4. 로컬 D-day 설정 섹션 */}
            <div className="admin-dday-manager">
                <div className="admin-dday-header">
                    <span className="admin-dday-title">📌 주요 디데이 일정</span>
                    <button 
                        type="button"
                        onClick={() => setIsDDayFormOpen(!isDDayFormOpen)}
                        className={`admin-dday-toggle-btn ${isDDayFormOpen ? 'open' : ''}`}
                    >
                        {isDDayFormOpen ? '✕' : '+'}
                    </button>
                </div>

                {isDDayFormOpen && (
                    <form onSubmit={handleAddDDay} className="admin-dday-form">
                        <input 
                            type="text"
                            placeholder="일정 이름 (예: 여름 세일 시작)"
                            value={newDDayTitle}
                            onChange={(e) => setNewDDayTitle(e.target.value)}
                            className="admin-dday-input"
                        />
                        <input 
                            type="date"
                            value={newDDayDate}
                            onChange={(e) => setNewDDayDate(e.target.value)}
                            className="admin-dday-input"
                        />
                        <button type="submit" className="admin-dday-submit-btn">
                            디데이 일정 추가
                        </button>
                    </form>
                )}

               <div className="admin-dday-list">
    {dDayList.map((item) => {
        // 현재 날짜와 타겟 날짜 비교해서 오늘이 D-Day인지 판별하는 로직 추가
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const target = new Date(item.date); target.setHours(0, 0, 0, 0);
        const isToday = (target.getTime() - today.getTime()) === 0;

        return (
            /* 오늘이 D-Day면 'is-today' 클래스가 붙어 색상이 변하고 깜빡입니다 */
            <div key={item.id} className={`dday-card ${isToday ? 'is-today' : ''}`}>
                <div className="dday-card-info">
                    <span className="dday-card-title">{item.title}</span>
                    <span className="dday-card-date">{item.date}</span>
                </div>

                <div className="dday-card-action">
                    <span className="dday-card-count">
                        {calculateDDay(item.date)}
                    </span>
                    <button 
                        type="button"
                        onClick={() => handleDeleteDDay(item.id)}
                        className="dday-delete-btn"
                        title="일정 삭제"
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    })}
</div>
            </div>
        </div> 
    );
};

export default AdminMemoDay;