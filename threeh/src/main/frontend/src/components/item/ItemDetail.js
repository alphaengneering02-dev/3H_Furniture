import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import Review from './Review';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../css/itemPageCss/itemDetail.css";
import Header from "../main/Header";
import Footer from "../main/Footer";

// MUI 라이브러리
import {
    Box,
    Button,
    IconButton,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";

const ItemDetail = () => {

    //URL에서 Item 가져오기
    const { itemId } = useParams();
    const navigate = useNavigate();

    //상품 상태 관리
    const [item, setItem] = useState(null);

    //이미지 상태 관리
    const [itemImgs, setItemImgs] = useState([]);

    //현재 선택된 대표 이미지 상태 관리
    const [selectedImg, setSelectedImg] = useState(null);

    //색상 옵션 선택 상태 관리
    const [selectedColor, setSelectedColor] = useState("");

    //해당 상품이 실제 구매된 수량 상태 관리
    const[itemOrderCount,setItemOrderCount] = useState(0);

    //북마크 상태 저장([201,223,230])
    const [bookmarkedItems, setBookmarkedItems] = useState([]);

    //가격 정형화.
    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString();
    };

    //로그인 확인
    const getLoginUser = () => {
        try {
            return JSON.parse(sessionStorage.getItem("user"));
        } catch (error) {
            console.error("user 파싱 실패", error);
            sessionStorage.removeItem("user");
            return null;
        }
    };

    //로그인 유저 권한 가져오기
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

    //로그인한 사용자가 관리자인지 확인
    const isAdminRole = (user) => {
        const role = getUserRole(user);

        return role === "ADMIN" || role === "ROLE_ADMIN";
    };

    //로그인한 사용자가 일반 회원인지 확인
    const isUserRole = (user) => {
        const role = getUserRole(user);

        return role === "USER" || role === "ROLE_USER";
    };

    //판매상태 확인_상태랑 재고에 따라 구매 가능 여부 
    const getSellStatusInfo = (item) => {
        if (!item) {
            return {
                text: "-",
                buyable: false,
                message: "상품 정보가 없습니다.",
            };
        }

        if (Number(item.itemStock || 0) <= 0) {
            return {
                text: "품절",
                buyable: false,
                message: "품절된 상품입니다."
            };
        }

        if (item.itemSellStatus === "SELL") {
            return {
                text: "판매중",
                buyable: true,
                message: "",
            };
        }

        if (item.itemSellStatus === "SOLD_OUT") {
            return {
                text: "품절",
                buyable: false,
                message: "품절된 상품입니다.",
            };
        }

        if (item.itemSellStatus === "STOP") {
            return {
                text: "판매중지",
                buyable: false,
                message: "판매중지된 상품입니다.",
            };
        }

        if (item.itemSellStatus === "COMING_SOON") {
            return {
                text: "판매예정",
                buyable: false,
                message: "판매예정 상품입니다.",
            };
        }

        return {
            text: item.itemSellStatus || "-",
            buyable: false,
            message: "판매중인 상품만 구매할 수 있습니다.",
        };
    };

    //할인율 계산
    const getDiscountRate = () => {
        const price = Number(item?.itemPrice || 0);
        const finalPrice = Number(item?.itemFinalPrice || 0);

        if (!price || !finalPrice || price <= finalPrice) {
            return 0;
        }

        return Math.round(((price - finalPrice) / price) * 100);
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

    //북마크 여부 확인 함수
    const isBookmarked = (itemId) => {
        return bookmarkedItems.includes(Number(itemId));
    };

    //북마크 토글 함수 추가
    const handleToggleBookmark = async () => {
        const loginUser = getLoginUser();

        if (!loginUser) {
            toast.error("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        if (!isUserRole(loginUser)) {
            toast.warning("일반 회원만 북마크를 이용할 수 있습니다.");
            return;
        }

        if (!loginUser.memberId) {
            toast.error("회원 정보가 올바르지 않습니다.");
            console.log("로그인 유저:", loginUser);
            return;
        }

        try {
            const payload = {
                memberId: loginUser.memberId,
                itemId: Number(itemId),
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
                    if (prev.includes(Number(itemId))) {
                        return prev;
                    }
                    return [...prev, Number(itemId)];
                });

                toast.success("북마크에 추가되었습니다.");
            } else {
                //북마크 삭제
                setBookmarkedItems((prev) =>
                    prev.filter((id) => id !== Number(itemId))
                );

                toast.info("북마크가 해제되었습니다.");
            }
        } catch (error) {
            console.error("북마크 처리 실패", error);

            if (error.response) {
                console.log("상태코드:", error.response.status);
                console.log("응답메시지:", error.response.data);
            }

            toast.error("북마크 처리 실패");
        }
    };

    //장바구니 담기
    const handleAddCart = async () => {
        const user = getLoginUser();

        if (!user) {
            toast.error("로그인이 필요합니다.");

            setTimeout(() => {
                navigate("/login");
            }, 800);

            return;
        }

        if (!isUserRole(user)) {
            toast.warning("일반 회원만 장바구니를 이용할 수 있습니다.");
            return;
        }

        if (!getSellStatusInfo(item).buyable) {
            toast.warning(getSellStatusInfo(item).message);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("itemId", itemId);
            formData.append("count", 1);

            await axios.post(
                "http://localhost:8080/api/cartItem/add",
                formData,
                {
                    withCredentials: true,
                }
            );

            toast.success("장바구니에 담겼습니다.");
        } catch (error) {
            console.error("장바구니 담기 실패", error);

            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("로그인이 필요합니다.");

                setTimeout(() => {
                    navigate("/login");
                }, 800);

                return;
            }

            toast.error(
                error.response?.data?.message ||
                error.response?.data ||
                "장바구니 담기 실패"
            );
        }
    };

    //바로 구매하기
    const handleBuyNow = () => {
        const user = getLoginUser();

        if (!user) {
            toast.error("로그인이 필요합니다.");

            setTimeout(() => {
                navigate("/login");
            }, 800);

            return;
        }

        if (!isUserRole(user)) {
            toast.warning("일반 회원만 구매할 수 있습니다.");
            return;
        }

        if (!getSellStatusInfo(item).buyable) {
            toast.warning(getSellStatusInfo(item).message);
            return;
        }

        navigate(`/order/${itemId}`);
    };

    //admin 판별 코드
    const user = getLoginUser();

    const isAdmin = isAdminRole(user);

    //일반 유저 판별 코드
    const isUser = isUserRole(user);

    useEffect(() => {
        if (!itemId) {
            console.error("itemId가 없습니다.");
            toast.error("상품 정보를 찾을 수 없습니다.");
            return;
        }

        getItem();
        getItemImgs();
        getMyBookmarks();
        getItemOrderCount();
    }, [itemId]);

    //상품정보 동기화
    const getItem = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/item/${itemId}`, {
                    withCredentials: true,
                }
            );

            console.log("상품 상세:", response.data);
            setItem(response.data);
        } catch (error) {
            console.error("상품 상세조회 실패", error);
            toast.error("상품 상세 정보를 불러오지 못했습니다.");
        }
    };

    //해당 상품이 구입된 횟수 조회
   const getItemOrderCount = async () => {
    try {
        const response = await axios.get(
            "http://localhost:8080/api/orders",
            {
                withCredentials: true,
            }
        );

        const orders = response.data || [];

        let totalCount = 0;

        orders.forEach((order) => {
            const orderItemsArray = order.orderItems || order.orderitems || [];

            if (!Array.isArray(orderItemsArray)) {
                return;
            }

            orderItemsArray.forEach((orderItem) => {
                const orderItemId = Number(
                    orderItem.itemId ||
                    orderItem.item?.itemId ||
                    orderItem.item_id
                );

                if (orderItemId === Number(itemId)) {
                    totalCount += Number(orderItem.count || 0);
                }
            });
        });
        setItemOrderCount(totalCount);
    }catch(error){
        console.error("상품 구매 수량 조회 실패", error);
        setItemOrderCount(0);
    }
};
    

    //상품이미지 정보 동기화
    const getItemImgs = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/itemImgs/${itemId}`
            );

            console.log("상품 이미지: ", response.data);

            const imgs = response.data || [];
            setItemImgs(imgs);

            const mainImg = imgs.find((img) => img.thumbnailYn === "Y");
            setSelectedImg(mainImg || imgs[0] || null);
        } catch (error) {
            console.error("상품 이미지 조회 실패", error);
            toast.error("상품 이미지를 불러오지 못했습니다.");
        }
    };

    if (!item) {
        return (
            <div>
                <Header />

                <main className="itemDetail-page">
                    <ToastContainer
                        position="top-center"
                        autoClose={1800}
                        hideProgressBar={false}
                        newestOnTop={true}
                        closeOnClick
                        pauseOnHover
                        theme="light"
                    />

                    <p className="itemDetail-loading">상품 불러오는 중....</p>
                </main>

                <Footer />
            </div>
        );
    }

    const sellStatus = getSellStatusInfo(item);
    const discountRate = getDiscountRate();

    //현재 선택된 이미지 번호 계산
    const selectedImgIndex = itemImgs.findIndex(
        (img) => img.itemImgId === selectedImg?.itemImgId
    );

    //=================================JSX구역===========================

    return (
        <div>
            <Header />

            <main className="itemDetail-page">
                <ToastContainer
                    position="top-center"
                    autoClose={1800}
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick
                    pauseOnHover
                    theme="light"
                />

                <Box className="itemDetail-topArea">
                    <Button
                        type="button"
                        className="itemDetail-listButton"
                        onClick={() => navigate("/item")}
                    >
                        상품 목록
                    </Button>
                </Box>

                <section className="itemDetail-productArea">

                    {/* 왼쪽 상품 이미지 영역 */}
                    <div className="itemDetail-gallery">
                        <div className="itemDetail-mainImageBox">
                            {selectedImg ? (
                                <img
                                    className="itemDetail-mainImage"
                                    src={`http://localhost:8080${selectedImg.itemImgUrl}`}
                                    alt={selectedImg.itemImgName || item.itemName}
                                />
                            ) : (
                                <p className="itemDetail-emptyImageText">
                                    대표 이미지가 없습니다.
                                </p>
                            )}

                            {itemImgs.length > 0 && (
                                <span className="itemDetail-imageCount">
                                    {selectedImgIndex >= 0 ? selectedImgIndex + 1 : 1} / {itemImgs.length}
                                </span>
                            )}
                        </div>

                        {/* 서브 이미지 영역: 클릭하면 대표 이미지로 변경 */}
                        {itemImgs.length > 0 && (
                            <div className="itemDetail-thumbList">
                                {itemImgs.map((img) => (
                                    <button
                                        type="button"
                                        key={img.itemImgId}
                                        className={`itemDetail-thumbButton ${
                                            selectedImg?.itemImgId === img.itemImgId ? "active" : ""
                                        }`}
                                        onClick={() => setSelectedImg(img)}
                                    >
                                        <img
                                            src={`http://localhost:8080${img.itemImgUrl}`}
                                            alt={img.itemImgName || item.itemName}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 오른쪽 상품 정보 영역 */}
                    <aside className="itemDetail-summary">

                        <div className="itemDetail-titleRow">
                            <Typography component="p" className="itemDetail-interestText">
                                지금까지 <strong>{formatPrice(itemOrderCount)}개</strong>가 구매되었어요.
                            </Typography>

                            <div className="itemDetail-iconArea">
                                {/* 북마크 버튼 */}
                                {isUser && (
                                    <IconButton
                                        type="button"
                                        className="itemDetail-iconButton"
                                        onClick={handleToggleBookmark}
                                        aria-label="북마크"
                                    >
                                        {isBookmarked(item.itemId) ? (
                                            <FavoriteIcon className="itemDetail-favoriteActive" />
                                        ) : (
                                            <FavoriteBorderIcon />
                                        )}
                                    </IconButton>
                                )}

                                <IconButton
                                    type="button"
                                    className="itemDetail-iconButton"
                                    aria-label="공유"
                                >
                                    <ShareOutlinedIcon />
                                </IconButton>
                            </div>
                        </div>

                        <Typography component="h1" className="itemDetail-name">
                            {item.itemName}
                        </Typography>

                        <div className="itemDetail-priceBox">
                            {Number(item.itemPrice || 0) > Number(item.itemFinalPrice || 0) && (
                                <p className="itemDetail-originPrice">
                                    {formatPrice(item.itemPrice)}원
                                </p>
                            )}

                            <div className="itemDetail-finalPriceRow">
                                {discountRate > 0 && (
                                    <span className="itemDetail-discountRate">
                                        {discountRate}%
                                    </span>
                                )}

                                <strong className="itemDetail-finalPrice">
                                    {formatPrice(item.itemFinalPrice)}원
                                </strong>
                            </div>
                        </div>

                        {/* 상품 옵션 영역 */}
                        <div className="itemDetail-optionBox">
                            <div className="itemDetail-optionRow">
                                <span className="itemDetail-label">색상</span>

                                <Select
                                    size="small"
                                    displayEmpty
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="itemDetail-optionSelect"
                                >
                                    <MenuItem value="">
                                        - [필수] 옵션을 선택해 주세요 -
                                    </MenuItem>

                                    {item.itemColor && (
                                        <MenuItem value={item.itemColor}>
                                            {item.itemColor}
                                        </MenuItem>
                                    )}
                                </Select>
                            </div>
                        </div>

                        {/* 상품 정보 영역 */}
                        <dl className="itemDetail-infoList">
                            <div>
                                <dt>카테고리</dt>
                                <dd>{item.itemCategory || "-"}</dd>
                            </div>

                            <div>
                                <dt>판매상태</dt>
                                <dd>
                                    <span className="itemDetail-status">
                                        {sellStatus.text}
                                    </span>
                                </dd>
                            </div>

                            <div>
                                <dt>재고</dt>
                                <dd>{item.itemStock}</dd>
                            </div>
                        </dl>

                        <div className="itemDetail-totalBox">
                            <span>TOTAL</span>
                            <strong>
                                {selectedColor ? `${formatPrice(item.itemFinalPrice)}원` : "0"}
                            </strong>
                        </div>

                        {!sellStatus.buyable && (
                            <p className="itemDetail-warning">
                                {sellStatus.message}
                            </p>
                        )}

                        {/*관리자는 상품 상세에서 직접 수정/삭제하지 않고, 관리자 상품/리뷰 관리 페이지로 이동 */}
                        {isAdmin && (
                            <div className="itemDetail-adminArea">
                                <Button
                                    type="button"
                                    className="itemDetail-buyButton"
                                    onClick={() => navigate("/admin/item")}
                                >
                                    관리자 상품/리뷰 관리로 이동
                                </Button>
                            </div>
                        )}

                        {/*관리자 모드일 때는 장바구니 구매하기 안보이게 */}
                        {!isAdmin && (
                            <div className="itemDetail-buttonArea">
                                <Button
                                    type="button"
                                    className="itemDetail-cartButton"
                                    onClick={handleAddCart}
                                    disabled={!sellStatus.buyable}
                                >
                                    <ShoppingCartOutlinedIcon />
                                </Button>

                                <Button
                                    type="button"
                                    className="itemDetail-buyButton"
                                    onClick={handleBuyNow}
                                    disabled={!sellStatus.buyable}
                                >
                                    구매하기
                                </Button>
                            </div>
                        )}
                    </aside>
                </section>

                {/* 상품 상세 설명 영역 */}
                <section className="itemDetail-detailSection">
                    <h2>상품 정보</h2>
                    <p>{item.itemDetail}</p>
                </section>

                <div className="itemDetail-reviewWrap">
                    <Review itemId={itemId} isAdmin={isAdmin} />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ItemDetail;