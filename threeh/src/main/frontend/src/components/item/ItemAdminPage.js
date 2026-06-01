import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate,Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../css/itemPageCss/itemAdminPage.css";
import Header from "../main/Header";
import Footer from "../main/Footer";

const ItemAdminPage = () => {
    const navigate = useNavigate();

    // 전체 상품 목록 저장
    const [items, setItems] = useState([]);

    //관리자 상품목록에서 선택된 상품id(여러개지우고싶어서)
    const [selectedItemIds, setSelectedItemIds]=useState([]);

    // items: 상품 관리 화면
    // reviews: 리뷰 관리 화면
    const [activeTab, setActiveTab] = useState("items");

    // 리뷰 관리에서 선택한 상품 ID
    const [selectedItemId, setSelectedItemId] = useState("");

    // 선택한 상품의 리뷰 목록
    const [reviews, setReviews] = useState([]);

    // 선택한 상품의 리뷰 평균 평점 / 리뷰 개수
    const [reviewSummary, setReviewSummary] = useState(null);

    // 추가: 상품별 리뷰 개수 저장
    const [reviewCounts, setReviewCounts] = useState({});
    const[reviewProductFilter,setReviewProductFilter] = useState("hasReview");

    //조회버튼 눌러야 필터링 적용(state값을 두개로 나눠서)
    //select에서 선택중인 값
    const [searchCategoryFilter, setSearchCategoryFilter] = useState("");
    const [searchSellStatusFilter, setSearchSellStatusFilter] = useState("");
    const [searchStockSort, setSearchStockSort] = useState("");

    //실제 조회 버튼을 눌렀을 때 적용되는 값.
    const [categoryFilter, setCategoryFilter]=useState("");
    const [sellStatusFilter, setSellStatusFilter] = useState("");
    const [stockSort,setStockSort] = useState("");

    //현재 페이지
    const [currentPage, setCurrentPage] = useState(1);

    //한페이지에 보여줄 상품 개수
    const ITEMS_PER_PAGE = 10;

    //페이지 번호를 5개씩 보여주기
    const PAGE_BLOCK_SIZE = 5;

    // sessionStorage에서 로그인 유저 정보 가져오기
    const getLoginUser = () => {
        try {
            return JSON.parse(sessionStorage.getItem("user"));
        } catch (error) {
            console.error("user 파싱 실패", error);
            sessionStorage.removeItem("user");
            return null;
        }
    };

    // 로그인한 유저의 역할 확인하기
    // 일반 유저면, 접근 안되게
    const getUserRole = (user) => {
        if (!user) return null;

        if (typeof user.role === "string") {
            return user.role;
        }

        if (user.role?.key) {
            return user.role.key;
        }

        return null;
    };

    // 로그인 유저가 관리자인지 확인
    const isAdminRole = (user) => {
        const role = getUserRole(user);
        return role === "ADMIN" || role === "ROLE_ADMIN";
    };

    // 컴포넌트 실행 시 관리자 권한 확인 후 상품 목록 불러오기
    useEffect(() => {
        const user = getLoginUser();

        if (!user || !isAdminRole(user)) {
            toast.error("관리자만 접근할 수 있습니다.");

            setTimeout(() => {
                navigate("/");
            }, 800);

            return;
        }

        getItems();
    }, []);

    // 상품 목록 불러오기
    const getItems = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/item", {
                withCredentials: true,
            });

            const itemList = response.data || [];

            // 상품 목록 state 저장
            setItems(itemList);

            // 추가: 상품 목록을 가져온 뒤, 각 상품별 리뷰 개수도 함께 조회
            // 상품 개수만큼 /api/reviews/summary/{itemId} API가 반복 호출되어 요청이 많아지므로 자동 조회하지 않음
            getReviewCounts();
        } catch (error) {
            console.error("상품 목록 조회 실패", error);
            toast.error("상품 목록을 불러오지 못했습니다.");
        }
    };

    // 상품별 리뷰 개수 가져오기
    // 테이블의 리뷰보기 버튼 옆에
    // 상품 목록 조회 시 자동 호출하지 않음
    const getReviewCounts = async () => {
       try{
        const response = await axios.get(
            "http://localhost:8080/api/reviews/summary/all",
            {
                withCredentials: true,
            }
        );

        const summaries = response.data || {};
        const countData = {};

        Object.entries(summaries).forEach(([itemId, summary])=>{
            countData[itemId] = {
                itemId:Number(itemId),
                averageScore:summary.averageScore || 0,
                reviewCounts: summary?.reviewCount || 0,
            };
        });

            setReviewCounts(countData);
       }catch(error){
        console.error("리뷰 개수 조회 실패",error);
        toast.error("리뷰 개수를 불러오지 못했습니다.");
       }
    };

    // 특정 상품의 이미지 목록 불러오기
    // 상품 삭제 시 FK 문제 때문에 상품 이미지 먼저 삭제해야 함
    // 현재 상품 삭제는 백엔드에서 이미지 DB 삭제, 상품 DB 삭제, 물리 파일 삭제까지 처리하므로 사용하지 않음
    const getItemImgs = async (itemId) => {
        const response = await axios.get(
            `http://localhost:8080/api/itemImgs/${itemId}`,
            {
                withCredentials: true,
            }
        );

        return response.data || [];
    };


    //상품여러개 선택해서 삭제하기 하고싶어.진짜루 귀찮아서.
    const isSelectedItem = (itemId)=>{
        return selectedItemIds.includes(Number(itemId));
    };

    //상품 개별 선택하거나 해제도 해야지.
    const handleSelectAdminItem = (itemId)=>{
        const numberItemId = Number(itemId);
        
        if(selectedItemIds.includes(numberItemId)){
            setSelectedItemIds(
                selectedItemIds.filter((id)=> id !== numberItemId)
            );
            return;
        };
         setSelectedItemIds([...selectedItemIds,numberItemId]);   
    };

    //현재 페이지 상품 전체 선택/선택헤제도...우와...신기해.
    const handleSelectAllPagedItems = ()=>{
        //pagedItems를 사용하는이유는: 현재 페이지에 보이는 상품만 전체 선택되게 하려는 의도로 한거니까 건들면안됌.
        const pagedItemIds = pagedItems.map((item)=>Number(item.itemId));

        const isAllSelected = pagedItemIds.every((itemId)=>selectedItemIds.includes(itemId));
        
        if(isAllSelected){
            setSelectedItemIds(
                selectedItemIds.filter((itemId)=>!pagedItemIds.includes(itemId))
            );
            return;
        }
        
        const mergedIds = Array.from(
            new Set([...selectedItemIds,...pagedItemIds])
        );
        setSelectedItemIds(mergedIds);
    }


    // 상품 삭제_ 관리자
    const handleAdminDeleteItem = async (itemId) => {
        const confirmDelete = window.confirm("정말 이 상품을 삭제하시겠습니까?");

        if (!confirmDelete) {
            return;
        }

        try {
            //상품이 주문내역에 있던 상품인지 삭제 가능 여부 먼저 확인
            const deletableResponse = await axios.get(
                `http://localhost:8080/api/admin/item/${itemId}/deletable`,
                {
                    withCredentials: true,
                }
            );

            if (!deletableResponse.data) {
                toast.warning(
                    "이미 주문내역이 있는 상품은 삭제할 수 없습니다. 판매상태를 판매중지(STOP)로 변경해주세요."
                );
                return;
            }

            //상품 삭제 API 하나만 호출
            //이미지 DB 삭제, 상품DB삭제, 물리 파일 삭제는 백엔드에서 처리
            await axios.delete(`http://localhost:8080/api/admin/item/${itemId}`, {
                withCredentials: true,
            });

            toast.success("상품이 삭제되었습니다.");

            // 삭제 가능한 상품이면, 상품이미지가 상품아이디를 FK하고 있어서, 이미지 먼저 지워야 됌.
            /*
            const itemImgs = await getItemImgs(itemId);

            // 상품에 연결된 이미지 먼저 삭제
            for (const img of itemImgs) {
                await axios.delete(
                    `http://localhost:8080/api/itemImgs/${img.itemImgId}`,
                    {
                        withCredentials: true,
                    }
                );
            }

            // 이미지 삭제 후 상품 삭제
            await axios.delete(`http://localhost:8080/api/admin/item/${itemId}`, {
                withCredentials: true,
            });

            alert("상품이 삭제되었습니다.");
            */

            // 삭제 후 상품 목록 다시 불러오기
            getItems();

            //삭제된 상품은 선택목록에서 제거(단일)
            setSelectedItemIds((prevIds)=>prevIds.filter((id)=>id !==Number(itemId)));

            // 삭제한 상품이 현재 리뷰 관리에서 선택된 상품이면 리뷰에서도 안보이게
            if (Number(selectedItemId) === Number(itemId)) {
                setSelectedItemId("");
                setReviews([]);
                setReviewSummary(null);
            }
        } catch (error) {
            console.error("상품 삭제 실패", error);

            if (error.response) {
                console.log("상품 삭제 상태코드:", error.response.status);
                console.log("상품 삭제 응답:", error.response.data);
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("관리자 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                sessionStorage.removeItem("user");

                setTimeout(() => {
                    navigate("/login");
                }, 1000);

                return;
            }

            toast.error(
                error.response?.data?.message ||
                    error.response?.data ||
                    "상품 삭제 실패"
            );
        }
    };


    //선택한 상품 여러개 삭제하는거 하자이제.
        const handleAdminDeleteSelectedItems = async () => {
            if (selectedItemIds.length === 0) {
                toast.warning("삭제할 상품을 선택해주세요.");
                return;
            }

            const confirmDelete = window.confirm(
                `선택한 상품 ${selectedItemIds.length}개를 삭제하시겠습니까?`
            );

            if (!confirmDelete) {
                return;
            }

            //정리해줘야지
            const deletedItemIds = [];
            const notDeletableItemIds = [];
            const failedItemIds = [];

            try {
                for (const selectedItemId of selectedItemIds) {
                    try {
                        //상품이 주문내역에 있던 상품이면 삭제 안되니까 먼저 확인.
                        const deletableResponse = await axios.get(
                            `http://localhost:8080/api/admin/item/${selectedItemId}/deletable`,
                            {
                                withCredentials: true,
                            }
                        );

                        if (!deletableResponse.data) {
                            notDeletableItemIds.push(selectedItemId);
                            continue;
                        }

                        //상품 삭제api하나만 호출해야
                        //이미지 db삭제하고, 상품db삭제하고,물리적파일 삭제는 내가하고...ㅜ
                        await axios.delete(
                            `http://localhost:8080/api/admin/item/${selectedItemId}`,
                            {
                                withCredentials: true,
                            }
                        );

                        deletedItemIds.push(selectedItemId);
                    } catch (error) {
                        console.error(`${selectedItemId}번 상품 삭제 실패..`, error);

                        if (error.response?.status === 401 || error.response?.status === 403) {
                            toast.error("관리자 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                            sessionStorage.removeItem("user");

                            setTimeout(() => {
                                navigate("/login");
                            }, 1000);

                            return;
                        }

                        failedItemIds.push(selectedItemId);
                    }
                }

                if (deletedItemIds.length > 0) {
                    toast.success(`${deletedItemIds.length}개 상품이 삭제되었습니다.`);
                }

                if (notDeletableItemIds.length > 0) {
                    toast.warning(
                        `주문내역이 있는 상품 ${notDeletableItemIds.length}개는 삭제되지 않았습니다.`
                    );
                }

                if (failedItemIds.length > 0) {
                    toast.error(`${failedItemIds.length}개 상품 삭제에 실패했습니다...`);
                }

                //삭제되면 상품목록을 다시 불러와서 가져와야지
                getItems();


                //삭제된 상품은 선택목록에서 제거되야되고(여러개 삭제)
                setSelectedItemIds((prevIds) =>
                    prevIds.filter((itemId) => !deletedItemIds.includes(itemId))
                );

                //삭제한 상품은 리뷰 관리에서도 안보이게
                if (deletedItemIds.includes(Number(selectedItemId))) {
                    setSelectedItemId("");
                    setReviews([]);
                    setReviewSummary(null);
                }
            } catch (error) {
                console.error("선택한 상품 삭제 실패", error);
                toast.error("선택 상품 삭제 실패");
            }
        };

    // 리뷰 관리_관리자
    const handleAdminSelectReviewItem = async (itemId) => {
        // 상품 선택을 해제한 경우 리뷰 관련 state 초기화
        if (!itemId) {
            setSelectedItemId("");
            setReviews([]);
            setReviewSummary(null);
            return;
        }

        // 선택한 상품 ID 저장
        setSelectedItemId(itemId);

        // 리뷰보기 클릭 시 리뷰 관리 화면으로 이동
        setActiveTab("reviews");

        try {
            // 선택한 상품의 리뷰 목록 조회
            const reviewResponse = await axios.get(
                `http://localhost:8080/api/reviews/item/${itemId}`,
                {
                    withCredentials: true,
                }
            );

            // 리뷰평점 평균
            const summaryResponse = await axios.get(
                `http://localhost:8080/api/reviews/summary/${itemId}`,
                {
                    withCredentials: true,
                }
            );

            setReviews(reviewResponse.data || []);
            setReviewSummary(summaryResponse.data);

            // 리뷰보기 클릭 시 해당 상품의 리뷰 수만 갱신
            setReviewCounts((prevCounts) => ({
                ...prevCounts,
                [itemId]: summaryResponse.data?.reviewCount || 0,
            }));
        } catch (error) {
            console.error("리뷰 조회 실패", error);

            if (error.response) {
                console.log("리뷰 조회 상태코드:", error.response.status);
                console.log("리뷰 조회 응답:", error.response.data);
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("관리자 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                sessionStorage.removeItem("user");

                setTimeout(() => {
                    navigate("/login");
                }, 1000);

                return;
            }

            toast.error("리뷰 목록을 불러오지 못했습니다.");
        }
    };

    // 리뷰 삭제하기
    const handleAdminDeleteReview = async (reviewId) => {
        const confirmDelete = window.confirm("이 리뷰를 삭제하시겠습니까?");

        if (!confirmDelete) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:8080/api/reviews/admin/${reviewId}`,
                {
                    withCredentials: true,
                }
            );

            toast.success("리뷰가 삭제되었습니다.");

            // 현재 선택된 상품이 있으면 해당 상품 리뷰 목록 다시 불러오기
            if (selectedItemId) {
                handleAdminSelectReviewItem(selectedItemId);
            }

            // 추가: 리뷰 삭제 후 상품 목록의 리뷰 개수도 다시 갱신
            // 상품 개수만큼 리뷰 요약 API가 반복 호출되지 않도록 전체 상품 목록 재조회만 실행
            getItems();
        } catch (error) {
            console.error("관리자 리뷰 삭제 실패", error);

            if (error.response) {
                console.log("리뷰 삭제 상태 코드:", error.response.status);
                console.log("리뷰 삭제 응답:", error.response.data);
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("관리자 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                sessionStorage.removeItem("user");

                setTimeout(() => {
                    navigate("/login");
                }, 1000);

                return;
            }

            toast.error(
                error.response?.data?.message ||
                    error.response?.data ||
                    "리뷰 삭제 실패"
            );
        }
    };

    // 가격 정형화
    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString();
    };

    // 리뷰 평가
    const renderStars = (score) => {
        const safeScore = Math.max(0, Math.min(5, Number(score || 0)));
        return "★".repeat(safeScore) + "☆".repeat(5 - safeScore);
    };

    //필터 실시간 말고 조회 버튼 눌러야 가능하게 해야하니까.....^___^
    const handleSearchFilter = () => {
        setCategoryFilter(searchCategoryFilter);
        setSellStatusFilter(searchSellStatusFilter);
        setSearchStockSort(searchStockSort);
        setCurrentPage(1);
    }

    // 상품 목록 필터링 / 정렬 처리
    // 카테고리 필터, 판매상태 필터, 재고 정렬을 화면 출력 전에 한 번에 적용
    const filteredItems = useMemo(() => {
        let result = [...items];

        // 카테고리 필터
        if (categoryFilter) {
            result = result.filter(
                (item) => item.itemCategory === categoryFilter
            );
        }

        // 판매상태 필터
        if (sellStatusFilter) {
            result = result.filter(
                (item) => item.itemSellStatus === sellStatusFilter
            );
        }

        // 재고 적은순 정렬
        if (stockSort === "stockAsc") {
            result.sort(
                (a, b) => Number(a.itemStock || 0) - Number(b.itemStock || 0)
            );
        }

        // 재고 많은순 정렬
        if (stockSort === "stockDesc") {
            result.sort(
                (a, b) => Number(b.itemStock || 0) - Number(a.itemStock || 0)
            );
        }

        return result;
    }, [items, categoryFilter, sellStatusFilter, stockSort]);

    //필터가 바뀌면 첫 페이지로 이동
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, sellStatusFilter, stockSort]);

    //전체 페이지 수
    const totalPages = Math.max(
        1,
        Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
    );

    //현재 페이지가 전체 페이지보다 커지면 마지막 페이지로 보정
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    //현재 페이지에 보여줄 상품 목록
    const pagedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        return filteredItems.slice(startIndex, endIndex);
    }, [filteredItems, currentPage]);

    // 5개 단위 페이지 블록 계산
    const currentPageBlock = Math.floor((currentPage - 1) / PAGE_BLOCK_SIZE);
    const startPage = currentPageBlock * PAGE_BLOCK_SIZE + 1;
    const endPage = Math.min(startPage + PAGE_BLOCK_SIZE - 1, totalPages);

    const pageNumbers = Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index
    );

    // 페이지 이동
    const goPage = (page) => {
        if (page < 1 || page > totalPages) {
            return;
        }

        setCurrentPage(page);
    };

    const reviewProductItems = useMemo(()=>{
        let result = items.map((item)=>{
            const summary = reviewCounts[item.itemId];

            return{
                ...item,
                reviewCounts: summary?.reviewCount||0,
                averageScore: summary?.averageScore||0,
            };
        })
        .filter((item)=>item.reviewCount > 0);
        if(reviewProductFilter === "lowScore"){
            result = result.filter((item)=>item.averageScore < 3);
        }
        if(reviewProductFilter === "manyReviews"){
            result = [...result].sort(
                (a,b) => Number(b.reviewCount || 0) - Number(a.reviewCount || 0)
            );
        }
        if(reviewProductFilter === "highScore"){
            result = [...result].sort(
                (a,b) => Number(b.averageScore||0)- Number(a.averageScore ||0)
            );
        }
        return result;
    },[items,reviewCounts,reviewProductFilter]);

    //============================================================//

    return (
        <div>
            {/*헤더영역 메인에서 가져옴 */}
            <Header/>
            <div className="itemAdmin-page">
            <ToastContainer
                position="top-center"
                autoClose={1800}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnHover
                theme="light"
            />
              {/* 관리자 페이지 제목 */}
            <h1 className="itemAdmin-title">관리자 상품/ 리뷰관리</h1>

            {/* 상품 등록하기 버튼과 리뷰 관리 버튼을 같은 레벨에 배치 */}
            {/* 상품 관리 버튼은 따로 노출하지 않음 */}
            <div className="itemAdmin-adminActionArea">
                 <button
                    type="button"
                    className="itemAdmin-button itemAdmin-subButton"
                    onClick={() => navigate("/item")}
                >
                    상품목록으로
                </button>
                <button
                    type="button"
                    className="itemAdmin-button"
                    onClick={() => navigate("/item/create")}
                >
                    상품 등록하기
                </button>

                <button
                    type="button"
                    className="itemAdmin-button itemAdmin-subButton"
                    onClick={() => setActiveTab("reviews")}
                >
                    리뷰 관리
                </button>
                {/*선택한 상품 여러개 삭제 */}
                <button type="button" className="itemAdmin-button itemAdmin-dangerButton"
                onClick={handleAdminDeleteSelectedItems} disabled={selectedItemIds.length===0}>
                    선택 삭제{selectedItemIds.length>0?`(${selectedItemIds.length})`:""}
                </button>
            </div>

            {/* 상품 관리 화면 */}
            {activeTab === "items" && (
                <div className="itemAdmin-section">
                    <h2 className="itemAdmin-sectionTitle">상품 관리</h2>
                    {/*등록된 상품 개수 표시 */}
                    <div className="itemAdmin-countBox">
                        <span className="itemAdmin-countText">
                            총 등록 상품: {items.length}개
                        </span>
                        <span className="itemAdmin-countText">
                            현재 조건 상품: {filteredItems.length}개
                        </span>
                    </div>
                    
                    {/* 상품 목록 필터 / 정렬 영역 */}
                    <div className="itemAdmin-filterArea">
                        {/* 카테고리 필터 */}
                        <div className="itemAdmin-filterGroup">
                            <label className="itemAdmin-label">카테고리</label>
                            <select
                                className="itemAdmin-select"
                                value={searchCategoryFilter}
                                onChange={(e) => setSearchCategoryFilter(e.target.value)}
                            >
                                <option value="">전체</option>
                                <option value="주방">주방</option>
                                <option value="거실">거실</option>
                                <option value="욕실">욕실</option>
                                <option value="침실">침실</option>
                            </select>
                        </div>

                        {/* 판매상태 필터 */}
                        <div className="itemAdmin-filterGroup">
                            <label className="itemAdmin-label">판매상태</label>
                            <select
                                className="itemAdmin-select"
                                value={searchSellStatusFilter}
                                onChange={(e) => setSearchSellStatusFilter(e.target.value)}
                            >
                                <option value="">전체</option>
                                <option value="SELL">SELL</option>
                                <option value="SOLD_OUT">SOLD_OUT</option>
                                <option value="STOP">STOP</option>
                                <option value="COMING_SOON">COMING_SOON</option>
                            </select>
                        </div>

                        {/* 재고 정렬 */}
                        <div className="itemAdmin-filterGroup">
                            <label className="itemAdmin-label">재고 정렬</label>
                            <select
                                className="itemAdmin-select"
                                value={searchStockSort}
                                onChange={(e) => setSearchStockSort(e.target.value)}
                            >
                                <option value="">기본순</option>
                                <option value="stockAsc">재고 적은순</option>
                                <option value="stockDesc">재고 많은순</option>
                            </select>
                        </div>

                        {/* 필터 조회,초기화 버튼 */}

                        <button type="button" className="itemAdmin-button" onClick={handleSearchFilter}>  
                        필터조회하기
                        </button>
                        <button
                            type="button"
                            className="itemAdmin-button itemAdmin-subButton"
                            onClick={() => {
                                setSearchCategoryFilter("");
                                setSearchSellStatusFilter("");
                                setSearchStockSort("");

                                setCategoryFilter("");
                                setSellStatusFilter("");
                                setStockSort("");

                                setCurrentPage(1);
                            }}
                        >
                            필터 초기화
                        </button>
                    </div>

                    {filteredItems.length === 0 ? (
                        <p className="itemAdmin-emptyText">
                            조건에 맞는 상품이 없습니다.
                        </p>
                    ) : (
                        <div className="itemAdmin-tableWrap">
                            <table className="itemAdmin-table">
                                <thead>
                                   <tr>
                                        {/* 상품 선택 */}
                                        <th className="itemAdmin-checkColumn">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    pagedItems.length > 0 &&
                                                    pagedItems.every((item) =>
                                                        selectedItemIds.includes(Number(item.itemId))
                                                    )
                                                }
                                                onChange={handleSelectAllPagedItems}
                                            />
                                        </th>

                                        {/* 화면 순번 */}
                                        <th>번호</th>
                                        <th>상품ID</th>
                                        <th>카테고리</th>
                                        <th>상품명</th>
                                        <th>가격</th>
                                        <th>재고</th>
                                        <th>판매상태</th>
                                        <th>리뷰</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pagedItems.map((item, index) => (
                                        <tr key={item.itemId}>

                                            {/* 상품선택 */}
                                            <td className="itemAdmin-checkColumn">
                                                 <input
                                                    type="checkbox"
                                                    checked={isSelectedItem(item.itemId)}
                                                    onChange={() => handleSelectAdminItem(item.itemId)}
                                                />
                                            </td>

                                            {/* 필터링된 목록 기준 순번 */}
                                            <td>
                                                {(currentPage - 1) * ITEMS_PER_PAGE +
                                                    index +
                                                    1}
                                            </td>
                                            <td>{item.itemId}</td>
                                            <td>{item.itemCategory}</td>
                                            <td className="itemAdmin-tableTextLeft">
                                                <Link to={`/item/${item.itemId}`}
                                                className="itemAdmin-nameLink">
                                                {item.itemName}
                                                </Link>
                                            </td>
                                            <td>{formatPrice(item.itemPrice)}원</td>
                                            <td>{item.itemStock}</td>
                                            <td>{item.itemSellStatus}</td>

                                            <td>
                                                {/* 리뷰보기 버튼 옆에 리뷰 개수 표시 */}
                                                <div className="itemAdmin-reviewButtonBox">
                                                    <button
                                                        type="button"
                                                        className="itemAdmin-tableButton itemAdmin-tableSubButton"
                                                        onClick={() =>
                                                            handleAdminSelectReviewItem(item.itemId)
                                                        }
                                                    >
                                                        리뷰보기
                                                    </button>

                                                    <span className="itemAdmin-reviewCount">
                                                        {reviewCounts[item.itemId]?.reviewCount ?? 0}개
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="itemAdmin-tableButtonArea">
                                                    <button
                                                        type="button"
                                                        className="itemAdmin-tableButton"
                                                        onClick={() =>
                                                            navigate(`/item/update/${item.itemId}`)
                                                        }
                                                    >
                                                        수정
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="itemAdmin-tableButton itemAdmin-tableDangerButton"
                                                        onClick={() =>
                                                            handleAdminDeleteItem(item.itemId)
                                                        }
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* 페이지네이션 */}
                            {filteredItems.length > ITEMS_PER_PAGE && (
                                <div className="itemAdmin-pagination">
                                    <button
                                        type="button"
                                        className="itemAdmin-pageButton"
                                        onClick={() => goPage(startPage - 1)}
                                        disabled={startPage === 1}
                                    >
                                        &lt;
                                    </button>

                                    {pageNumbers.map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            className={
                                                currentPage === page
                                                    ? "itemAdmin-pageButton itemAdmin-pageButtonActive"
                                                    : "itemAdmin-pageButton"
                                            }
                                            onClick={() => goPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        className="itemAdmin-pageButton"
                                        onClick={() => goPage(endPage + 1)}
                                        disabled={endPage === totalPages}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 리뷰 관리 화면 */}
            {activeTab === "reviews" && (
                <div className="itemAdmin-section">
                    <h2 className="itemAdmin-sectionTitle">리뷰 관리</h2>

                    {/* 리뷰를 관리할 상품 선택 영역 */}
                    <div className="itemAdmin-reviewSelectArea">
                        <label className="itemAdmin-label">리뷰 상품 필터:</label>

                        <select
                            className="itemAdmin-select"
                            value={reviewProductFilter}
                            onChange={(e) =>
                                setReviewProductFilter(e.target.value)
                            }
                        >
                            <option value="">상품을 선택하세요</option>

                            {items.map((item) => (
                                <option key={item.itemId} value={item.itemId}>
                                    [{item.itemId}] {item.itemName}
                                </option>
                            ))}
                        </select>

                        {/* 리뷰 관리 화면에서 상품 관리 화면으로 돌아가기 */}
                        <button
                            type="button"
                            className="itemAdmin-button itemAdmin-subButton"
                            onClick={() => setActiveTab("items")}
                        >
                            상품 관리로 돌아가기
                        </button>
                    </div>

                    {!selectedItemId ? (
                        <p className="itemAdmin-emptyText">
                            리뷰를 관리할 상품을 선택해주세요.
                        </p>
                    ) : (
                        <div className="itemAdmin-reviewContent">
                            {/* 선택한 상품의 리뷰 요약 */}
                            {reviewSummary && (
                                <div className="itemAdmin-summaryBox">
                                    <p className="itemAdmin-summaryText">
                                        평균 평점:{" "}
                                        <span className="itemAdmin-summaryStrong">
                                            {Number(
                                                reviewSummary.averageScore || 0
                                            ).toFixed(1)}
                                            /5
                                        </span>
                                    </p>

                                    <p className="itemAdmin-summaryText">
                                        리뷰 수:{" "}
                                        <span className="itemAdmin-summaryStrong">
                                            {reviewSummary.reviewCount || 0}
                                        </span>
                                    </p>
                                </div>
                            )}

                            {reviews.length === 0 ? (
                                <p className="itemAdmin-emptyText">
                                    이 상품에는 아직 리뷰가 없습니다.
                                </p>
                            ) : (
                                <div className="itemAdmin-tableWrap">
                                    <table className="itemAdmin-table">
                                        <thead>
                                            <tr>
                                                <th>리뷰ID</th>
                                                <th>작성자</th>
                                                <th>별점</th>
                                                <th>내용</th>
                                                <th>작성일</th>
                                                <th>관리</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {reviews.map((review) => (
                                                <tr key={review.reviewId}>
                                                    <td>{review.reviewId}</td>

                                                    <td>
                                                        {review.memberName ||
                                                            review.memberLoginId ||
                                                            "회원"}
                                                    </td>

                                                    <td className="itemAdmin-stars">
                                                        {renderStars(review.reviewScore)}
                                                        ({review.reviewScore}점)
                                                    </td>

                                                    <td className="itemAdmin-reviewTextCell">
                                                        {review.reviewText}
                                                    </td>

                                                    <td>
                                                        {review.createdAt
                                                            ? String(
                                                                  review.createdAt
                                                              ).substring(0, 10)
                                                            : "-"}
                                                    </td>

                                                    <td>
                                                        <div className="itemAdmin-tableButtonArea">
                                                            <button
                                                                type="button"
                                                                className="itemAdmin-tableButton itemAdmin-tableDangerButton"
                                                                onClick={() =>
                                                                    handleAdminDeleteReview(
                                                                        review.reviewId
                                                                    )
                                                                }
                                                            >
                                                                리뷰 삭제
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
        {/*푸터 영역 */}
        <Footer/>
    </div>
    );
};

export default ItemAdminPage;