import React, { useEffect, useState } from 'react';
import Main_itemList_item from './Main_itemList_item';
import icon_prev from '../../assets/icon_prev.png';
import icon_next from '../../assets/icon_next.png';
import { useToast } from '../../hook/useToast';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Main_itemList = ({ totalItemList }) => {

    const { success, error: err, warn, info } = useToast();
    //오현옥 추가
    const navigate= useNavigate();


    //로그인한 유저 정보 가져오기
    const getLoginUser = () => {
        try {
        //sesstionStroage에 저장된 로그인 사용자 정보 가져오기
        return JSON.parse(sessionStorage.getItem("user"));
        } catch (error) {
        console.error("user 파싱 실패", error);
        sessionStorage.removeItem("user");
        return null;
        }
    };

    const getUserRole = (user) => {
        if (!user) {
        return null;
        }

        if (typeof user.role === "string") {
        return user.role;
        }

        if (user.role?.key) {
        return user.role.key;
        }

        return null;
    };

    const user = getLoginUser();  //현재 로그인한 사용자 정보


    //로그인한 사용자가 관리자인지 확인
    const isAdminRole = (user) => {
        const role = getUserRole(user);

        return role === "ADMIN" || role === "ROLE_ADMIN";
    };

    //로그인한 사용자가 일반 회원인지 확인
    const isUserRole = (user) => {
        const role = getUserRole(user);

        return role === "USER" || role === "ROLE_USER";
    }

    //비로그인 유저 확인
    const isUser = isUserRole(user);


    const VISIBLE_COUNT = 4; // 화면에 노출될 카드 개수
    const [itemList, setItemList] = useState([]); // 원본 8개 데이터
    const [displayList, setDisplayList] = useState([]); // 앞뒤로 복제본이 추가된 전체 데이터
    
    // 시작 인덱스는 0이 아니라 앞쪽 복제본(4개)을 건너뛴 진짜 1번 카드 위치인 VISIBLE_COUNT로 설정
    const [currentIndex, setCurrentIndex] = useState(VISIBLE_COUNT); 
    const [isTransition, setIsTransition] = useState(true); // 눈속임 이동 시 애니메이션을 끄기 위한 상태
    const [isClickable, setIsClickable] = useState(true);  // 광클 방지를 위한 클릭 잠금 상태

    //무한 슬라이드(Infinite Carousel) 적용
    useEffect(() => {
        try {
            if (totalItemList && totalItemList.length > 0) {
                //상태가 SELL인 것만 먼저 거른 후, 등록순으로 8개를 자름
                const sellItems = totalItemList
                                .filter(item => item.itemSellStatus==="SELL")
                                .slice(0, 8);

                console.log("[메인 상품목록 데이터]\n", sellItems)
                setItemList(sellItems);
                
                // [무한 슬라이드 핵심 1] 앞뒤로 카드 복제본 붙이기
                const head = sellItems.slice(-VISIBLE_COUNT); // 끝부분 4개 (5, 6, 7, 8)
                const tail = sellItems.slice(0, VISIBLE_COUNT); // 앞부분 4개 (1, 2, 3, 4)
                setDisplayList([...head, ...sellItems, ...tail]);
            }
        } catch (error) {
            console.error("[ITEM LIST 영역에 상품 추가 실패]\n", error);
        }
    }, [totalItemList]);

    // [무한 슬라이드 핵심 2] 끝에 도달했을 때 눈속임으로 제자리 찾아가기
    useEffect(() => {
        if (itemList.length === 0) return;

        // CSS의 transition 시간(0.8s)과 동일하게 800ms 대기 후 실행
        const transitionTime = 800; 

        // 1. 오른쪽으로 끝까지 갔을 때 (뒤쪽 복제본 1번 위치)
        if (currentIndex === itemList.length + VISIBLE_COUNT) {
            const timeout = setTimeout(() => {
                setIsTransition(false); // 스르륵 넘어가는 애니메이션 끄기
                setCurrentIndex(VISIBLE_COUNT); // 진짜 1번 위치로 순간이동!
            }, transitionTime);
            return () => clearTimeout(timeout);
        }
        
        // 2. 왼쪽으로 끝까지 갔을 때 (앞쪽 복제본 8번 위치)
        if (currentIndex === 0) {
            const timeout = setTimeout(() => {
                setIsTransition(false); // 애니메이션 끄기
                setCurrentIndex(itemList.length); // 진짜 8번 위치로 순간이동!
            }, transitionTime);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, itemList.length]);

    // 1. 페이지 로딩 시 자동 슬라이드
    useEffect(() => {
        if (displayList.length === 0) return;

        const autoSlide = setInterval(() => {
            setIsTransition(true); // 이동할 땐 무조건 애니메이션 켜기
            setCurrentIndex(prev => prev + 1);
        }, 3000);

        return () => clearInterval(autoSlide);
    }, [displayList]);

    // 2. 좌우 버튼 조작
    const handlePrev = () => {
        if (!isClickable) return; // 🌟 잠겨있으면 아무것도 안 하고 함수 종료 (광클 방지)
        setIsClickable(false);    // 버튼 잠금
        setIsTransition(true);
        setCurrentIndex(prev => prev - 1);

        // 애니메이션 시간(0.8s)이 끝난 후 다시 버튼 잠금 해제
        setTimeout(() => setIsClickable(true), 800);
    };

    const handleNext = () => {
        if (!isClickable) return;
        setIsClickable(false);
        setIsTransition(true);
        setCurrentIndex(prev => prev + 1);
        
        setTimeout(() => setIsClickable(true), 800);
    };

    // 3. 인디케이터 클릭 시 이동
    const handleSelect = (index) => {
        if (!isClickable) return;
        setIsClickable(false);
        setIsTransition(true);
        setCurrentIndex(index + VISIBLE_COUNT);  // 인디케이터는 원본 8개 기준(0~7)이므로, 화면 인덱스는 +VISIBLE_COUNT 해줌

        setTimeout(() => setIsClickable(true), 800);

        setIsTransition(true);
        
        setCurrentIndex(index + VISIBLE_COUNT); 
    };


    // 아이템 컨테이너 넓이 및 비율 계산 (복제본이 포함된 displayList 기준)
    const containerWidth = displayList.length > 0 ? `${(displayList.length / VISIBLE_COUNT) * 100}%` : '100%';
    const slidePercentage = displayList.length > 0 ? (100 / displayList.length) : 0;

    // 현재 활성화된 진짜 인덱스 계산 (인디케이터에 불 들어오게 하기 위함)
    let activeIndicator = currentIndex - VISIBLE_COUNT;
    if (activeIndicator < 0) activeIndicator += itemList.length;
    if (activeIndicator >= itemList.length) activeIndicator -= itemList.length;


    //==========================북마크 기능==========================
    //컴포넌트가 처음 실행될 때 북마크 목록 조회
    useEffect(() => {
        getMyBookmarks();
    }, [])

    //북마크 토글 함수 추가
    const isBookmarked = (itemId) => {  //북마크 여부 확인 함수
        return bookmarkedItems.includes(itemId);
    };
    const [bookmarkedItems, setBookmarkedItems] = useState([]);  //북마크 상태 저장([201,223,230])

    const handleToggleBookmark = async (itemId) => {
        const loginUser = getLoginUser();

        if (!loginUser) {
        err("로그인이 필요합니다.");
        Navigate("/login");
        return;
        }

        if (!isUserRole(loginUser)) {
        err("일반 회원만 북마크를 이용할 수 있습니다.");
        return;
        }

        if (!loginUser.memberId) {
        err("회원 정보가 올바르지 않습니다.");
        console.log("로그인 유저:", loginUser);
        return;
        }

        try {
        const payload = {
            memberId: loginUser.memberId,
            itemId: itemId,
            type: "ITEM",
        };

        const response = await axios.post(
            "http://localhost:8080/api/bookmarks/toggle",
            payload,
            {
            withCredentials: true,
            }
        );

        console.log("북마크 응답:", response.data);

        if (response.data.bookmarked) {
            //북마크 추가
            setBookmarkedItems((prev) => {
            if (prev.includes(itemId)) {
                return prev;
            }
            return [...prev, itemId];
            });
        } else {
            //북마크 삭제
            setBookmarkedItems((prev) =>
            prev.filter((id) => id !== itemId)
            );
        }
        } catch (error) {
        console.error("북마크 처리 실패", error);

        if (error.response) {
            console.log("상태코드:", error.response.status);
            console.log("응답메시지:", error.response.data);
        }

        err("북마크 처리 실패");
        }
    };


    //북마크 가져오기
    const getMyBookmarks = async () => {
        const loginUser = getLoginUser();

        if (!loginUser || !isUserRole(loginUser)) {
            return;
        }

        const memberId = loginUser.memberId;

        if (!memberId) {
            console.log("memberId가 없습니다:", loginUser);
            return;
        }

        try {
            const response = await axios.get(
            `http://localhost:8080/api/bookmarks/member/${memberId}`,
            {
                withCredentials: true,
            }
            );

            console.log("내 북마크 목록:", response.data);

            const bookmarkedItems = response.data.map(
                (bookmark) => bookmark.itemId
            );

            setBookmarkedItems(bookmarkedItems);
        } catch (error) {
            console.error("북마크 목록 조회 실패", error);
        }
    };
    //===============================================================


    return (
        <section className="main-itemList main-product-slider-section">
            <h2>상품 목록</h2>

            {
                displayList && displayList.length > 0 ? (
                    <>
                        <div className="main-slider-container" style={{ overflow: 'hidden' }}>
                            <article 
                                className="main-items"
                                style={{
                                    transform: `translateX(-${currentIndex * slidePercentage}%)`,
                                    // isTransition 상태에 따라 0.8초 애니메이션을 껐다 켰다 함
                                    transition: isTransition ? 'transform 0.8s ease-in-out' : 'none', 
                                    display: 'flex',
                                    width: containerWidth
                                }}
                            >
                                {displayList.map((item, idx) => (
                                    <div 
                                        // 복제된 카드가 있으므로 itemId만 쓰면 중복 에러가 남. idx를 붙여서 고유하게!
                                        key={`${item.itemId}-${idx}`} 
                                        style={{ width: `${100 / displayList.length}%`, flexShrink: 0 }}
                                    >
                                        <Main_itemList_item item={item} getLoginUser={getLoginUser} isUserRole={isUserRole} isUser={isUser} handleToggleBookmark={handleToggleBookmark} isBookmarked={isBookmarked}/>
                                    </div>
                                ))}
                            </article>
                        </div>


                        {/* 이전 / 다음으로 이동 버튼 (움직이는 main-items 밖, slider-container 안에 배치) */}
                            <div className="main-slider-btn-once">
                                <button id="prev" name="prev" className="prev" onClick={handlePrev}>
                                    <img src={icon_prev} alt='이전으로'/>
                                </button>
                                <button id="next" name="next" className="next" onClick={handleNext}>
                                    <img src={icon_next} alt='다음으로'/>
                                </button>
                            </div>


                        {/* 하단 인디케이터 (복제본 빼고 진짜 원본 8개만큼만 보여줌) */}
                        <ul className="main-slider-btn-indicator">
                            {itemList.map((_, index) => (
                                <li 
                                    key={index}
                                    className={activeIndicator === index ? 'active' : ''} 
                                    onClick={() => handleSelect(index)}
                                ></li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="main-item-empty-text">상품이 없습니다.</p>
                )
            }
        </section>
    );
};

export default Main_itemList;