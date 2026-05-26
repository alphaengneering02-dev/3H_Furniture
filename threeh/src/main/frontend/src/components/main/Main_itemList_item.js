import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const Main_itemList_item = ({item, getLoginUser, isUserRole, isUser}) => {

    //이미지 상태 객체
    const [itemImgs, setItemImgs] = useState({});
    

    //DB에서 각 상품의 이미지를 가져오는 함수
    const getItemImg = async() =>{
        try{
            //상품 이미지 가져오기
            const res = await axios.get(
                `http://localhost:8080/api/${item.itemId}`
            );
            setItemImgs(res.data)

            //콘솔 출력
            console.log(`[${item.itemName} 상품의 이미지 가져오기 완료]\n`, res.data)

        } catch(error){
            console.error(`[${item.itemName} 상품의 이미지 가져오기 실패]\n`, error);
        }
    };


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
        alert("로그인이 필요합니다.");
        Navigate("/login");
        return;
        }

        if (!isUserRole(loginUser)) {
        alert("일반 회원만 북마크를 이용할 수 있습니다.");
        return;
        }

        if (!loginUser.memberId) {
        alert("회원 정보가 올바르지 않습ㄴ디ㅏ.");
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

        alert("북마크 처리 실패");
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
        <div className="main-item-card">
            <div className="image-box">
                {/* 상품 이미지 */}
                <img src={item.imgUrl || "placeholder.png"} alt={item.itemName} />
                {/* 북마크 버튼 */}
                {/* <button className="main-bookmark-btn">♡</button> */}

                {/*기존은 !isAdmin이였는데 일반 유저면 보이게 바꿈*/}
                {isUser && (
                    <button
                        type="button"
                        onClick={() => handleToggleBookmark(item.itemId)}
                        className={`main-bookmark-button ${
                            isBookmarked(item.itemId) ? "main-bookmark-active" : ""
                        }`}
                    >
                        {isBookmarked(item.itemId) ? "♥" : "♡"}
                    </button>
                )}

            </div>
            <p className="item-name">{item.itemName || "상품명"}</p>
            <h4 className="item-price">{formatPrice(getFinalPrice(item))}원</h4>
        </div>
    );
};

export default Main_itemList_item;