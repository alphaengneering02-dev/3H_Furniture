import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
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
    const [selectedItemIds, setSelectedItemIds] = useState([]);

    // items: 상품 관리 화면
    // reviews: 리뷰 관리 화면
    // articles: 상담 관리 화면
    const [activeTab, setActiveTab] = useState("items");

    //상담 문의 목록
    const [articles, setArticles] = useState([]);

    //상담 답변 입력값 저장
    const [articleAnswerInputs, setArticleAnswerInputs] = useState({});

    //상담 관리 페이지
    const [articleCurrentPage, setArticleCurrentPage] = useState(1);

    //상담 한 페이지에 보여줄 개수
    const ARTICLES_PER_PAGE = 6;

    // 리뷰 관리 화면 모드
    // 실무형 구조에서는 리뷰 상세는 상품 상세페이지에서 관리하므로 list만 사용
    const [reviewViewMode, setReviewViewMode] = useState("list");

    // 리뷰 관리에서 선택한 상품 ID
    // 현재는 상품 상세페이지로 이동하는 방식이라 직접 상세 테이블에서는 사용하지 않음
    const [selectedItemId, setSelectedItemId] = useState("");
    const [selectedReviewItemName, setSelectedReviewItemName] = useState("");

    // 선택한 상품의 리뷰 목록
    // 현재는 상품 상세페이지 Review 컴포넌트에서 관리
    const [reviews, setReviews] = useState([]);

    // 선택한 상품의 리뷰 평균 평점 / 리뷰 개수
    const [reviewSummary, setReviewSummary] = useState(null);

    // 추가: 상품별 리뷰 개수 저장
    const [reviewCounts, setReviewCounts] = useState({});

    // 실제 적용되는 리뷰 상품 필터
    const [reviewProductFilter, setReviewProductFilter] = useState("hasReview");

    // 필터가 바로 적용되지 않고, 조회하기 버튼을 눌러야 적용
    const [searchReviewProductFilter, setSearchReviewProductFilter] =
        useState("hasReview");

    //조회버튼 눌러야 필터링 적용(state값을 두개로 나눠서)
    //select에서 선택중인 값
    const [searchCategoryFilter, setSearchCategoryFilter] = useState("");
    const [searchSellStatusFilter, setSearchSellStatusFilter] = useState("");
    const [searchStockSort, setSearchStockSort] = useState("");

    //실제 조회 버튼을 눌렀을 때 적용되는 값.
    const [categoryFilter, setCategoryFilter] = useState("");
    const [sellStatusFilter, setSellStatusFilter] = useState("");
    const [stockSort, setStockSort] = useState("");

    //현재 페이지
    const [currentPage, setCurrentPage] = useState(1);

    //리뷰 관리 페이지
    const [reviewCurrentPage, setReviewCurrentPage] = useState(1);

    //한페이지에 보여줄 상품 개수
    const ITEMS_PER_PAGE = 10;

    //리뷰관리 한 페이지에 보여줄 상품 개수
    const REVIEWS_PER_PAGE = 10;

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

    //상담 문의 목록 불러오기
    const getArticles = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/articles", {
                withCredentials: true,
            });

            setArticles(response.data || []);
        } catch (error) {
            console.error("상담 문의 목록 조회 실패", error);

            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("관리자 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                sessionStorage.removeItem("user");

                setTimeout(() => {
                    navigate("/login");
                }, 1000);

                return;
            }

            toast.error("상담 문의 목록을 불러오지 못했습니다.");
        }
    };

    // 상담 답변 입력값 변경
    const handleChangeArticleAnswer = (articleId, value) => {
        setArticleAnswerInputs((prev) => ({
            ...prev,
            [articleId]: value,
        }));
    };

    // 상담 답변 저장
    const handleSubmitArticleAnswer = async (articleId) => {
        const answer = articleAnswerInputs[articleId];

        if (!answer || !answer.trim()) {
            toast.warning("답변 내용을 입력해주세요.");
            return;
        }

        try {
            await axios.put(
                `http://localhost:8080/api/articles/${articleId}/answer`,
                {
                    articleAnswer: answer,
                },
                {
                    withCredentials: true,
                }
            );

            toast.success("상담 답변이 등록되었습니다.");

            setArticleAnswerInputs((prev) => ({
                ...prev,
                [articleId]: "",
            }));

            getArticles();
        } catch (error) {
            console.error("상담 답변 등록 실패", error);

            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("관리자 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                sessionStorage.removeItem("user");

                setTimeout(() => {
                    navigate("/login");
                }, 1000);

                return;
            }

            toast.error("상담 답변 등록에 실패했습니다.");
        }
    };

    // 상담 문의 삭제
    const handleDeleteArticle = async (articleId) => {
        const confirmDelete = window.confirm(
            "이 상담 문의를 삭제하시겠습니까?\n삭제된 문의와 답변은 복구할 수 없습니다."
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/articles/${articleId}`, {
                withCredentials: true,
            });

            toast.success("상담 문의가 삭제되었습니다.");

            setArticleAnswerInputs((prev) => {
                const copiedInputs = { ...prev };
                delete copiedInputs[articleId];
                return copiedInputs;
            });

            getArticles();
        } catch (error) {
            console.error("상담 문의 삭제 실패", error);

            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("관리자 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                sessionStorage.removeItem("user");

                setTimeout(() => {
                    navigate("/login");
                }, 1000);

                return;
            }

            toast.error("상담 문의 삭제에 실패했습니다.");
        }
    };

    // 상품별 리뷰 개수 가져오기
    // 테이블의 리뷰보기 버튼 옆에
    // 상품 목록 조회 시 자동 호출하지 않음 한번만
    const getReviewCounts = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/reviews/summary/all",
                {
                    withCredentials: true,
                }
            );

            const summaries = response.data || {};
            const countData = {};

            Object.entries(summaries).forEach(([itemId, summary]) => {
                countData[itemId] = {
                    itemId: Number(itemId),
                    averageScore: summary.averageScore || 0,
                    reviewCount: summary?.reviewCount || 0,
                };
            });

            setReviewCounts(countData);
        } catch (error) {
            console.error("리뷰 개수 조회 실패", error);
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
    const isSelectedItem = (itemId) => {
        return selectedItemIds.includes(Number(itemId));
    };

    //상품 개별 선택하거나 해제도 해야지.
    const handleSelectAdminItem = (itemId) => {
        const numberItemId = Number(itemId);

        setSelectedItemIds((prevIds) => {
            if (prevIds.includes(numberItemId)) {
                return prevIds.filter((id) => id !== numberItemId);
            }

            return [...prevIds, numberItemId];
        });
    };

    //선택 상품 목록에서 개별 상품 선택 해제
    const handleRemoveSelectedAdminItem = (itemId) => {
        const numberItemId = Number(itemId);

        setSelectedItemIds((prevIds) =>
            prevIds.filter((id) => id !== numberItemId)
        );
    };

    //선택한 상품 목록 전체 비우기
    const handleClearSelectedAdminItems = () => {
        if (selectedItemIds.length === 0) {
            toast.warning("선택된 상품이 없습니다.");
            return;
        }

        const confirmClear = window.confirm(
            "선택한 상품 목록을 모두 비우시겠습니까?"
        );

        if (!confirmClear) {
            return;
        }

        setSelectedItemIds([]);
    };

    //현재 페이지 상품 전체 선택/선택헤제도...우와...신기해.
    const handleSelectAllPagedItems = () => {
        //pagedItems를 사용하는이유는: 현재 페이지에 보이는 상품만 전체 선택되게 하려는 의도로 한거니까 건들면안됌.
        const pagedItemIds = pagedItems.map((item) => Number(item.itemId));

        const isAllSelected = pagedItemIds.every((itemId) =>
            selectedItemIds.includes(itemId)
        );

        if (isAllSelected) {
            setSelectedItemIds(
                selectedItemIds.filter((itemId) => !pagedItemIds.includes(itemId))
            );
            return;
        }

        const mergedIds = Array.from(
            new Set([...selectedItemIds, ...pagedItemIds])
        );

        setSelectedItemIds(mergedIds);
    };

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

            // 삭제 후 상품 목록 다시 불러오기
            getItems();

            //삭제된 상품은 선택목록에서 제거(단일)
            setSelectedItemIds((prevIds) =>
                prevIds.filter((id) => id !== Number(itemId))
            );

            // 삭제한 상품이 현재 리뷰 관리에서 선택된 상품이면 리뷰에서도 안보이게
            if (Number(selectedItemId) === Number(itemId)) {
                setSelectedItemId("");
                setSelectedReviewItemName("");
                setReviews([]);
                setReviewSummary(null);
                setReviewViewMode("list");
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
                setSelectedReviewItemName("");
                setReviews([]);
                setReviewSummary(null);
                setReviewViewMode("list");
            }
        } catch (error) {
            console.error("선택한 상품 삭제 실패", error);
            toast.error("선택 상품 삭제 실패");
        }
    };

    // 가격 정형화
    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString();
    };

    // 날짜 정형화
    const formatDate = (dateValue) => {
        if (!dateValue) return "-";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleString("ko-KR");
    };

    //상담 문의에 연결된 상품 상세페이지로 이동
    const handleGoArticleItemDetail = (itemId) => {
        if(!itemId){
            toast.warning("일반 상담 문의는 연결된 상품이 없습니다.");
            return;
        }

        navigate(`/item/${itemId}`);
    }

    //관리자 리뷰보기: 상품 상세 페이지의 리뷰 영역가기
    const handleGoItemReviewDetail = (itemId) => {
        navigate(`/item/${itemId}?adminReview=true`);
    };

    //필터 실시간 말고 조회 버튼 눌러야 가능하게 해야하니까.....^___________^
    const handleSearchFilter = () => {
        setCategoryFilter(searchCategoryFilter);
        setSellStatusFilter(searchSellStatusFilter);
        setStockSort(searchStockSort);
        setCurrentPage(1);
    };

    // 관리자 탭 변경
    const handleChangeAdminTab = (tabName) => {
        setActiveTab(tabName);

        if (tabName === "items") {
            return;
        }

        if (tabName === "reviews") {
            setReviewViewMode("list");
            setSelectedItemId("");
            setSelectedReviewItemName("");
            setReviews([]);
            setReviewSummary(null);
            setSearchReviewProductFilter(reviewProductFilter);
            setReviewCurrentPage(1);
            return;
        }

        if (tabName === "articles") {
            setArticleCurrentPage(1);
            getArticles();
        }
    };

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

    //선택한 상품 ID목록을 실제 상품 객체 목록으로 변환
    //필터/페이지가 바뀌어도 selectedItemIds는 유지되므로,
    //관리자가 선택한 상품을 아래에서 계속 확인할 수 있음
    const selectedAdminItems = useMemo(() => {
        return selectedItemIds
            .map((itemId) =>
                items.find((item) => Number(item.itemId) === Number(itemId))
            )
            .filter(Boolean);
    }, [selectedItemIds, items]);

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

    //상담 페이지네이션 계산
    const articleTotalPages = Math.max(
        1,
        Math.ceil(articles.length / ARTICLES_PER_PAGE)
    );

    useEffect(() => {
        if (articleCurrentPage > articleTotalPages) {
            setArticleCurrentPage(articleTotalPages);
        }
    }, [articleCurrentPage, articleTotalPages]);

    const pagedArticles = useMemo(() => {
        const startIndex = (articleCurrentPage - 1) * ARTICLES_PER_PAGE;
        const endIndex = startIndex + ARTICLES_PER_PAGE;

        return articles.slice(startIndex, endIndex);
    }, [articles, articleCurrentPage]);

    const articleCurrentPageBlock = Math.floor(
        (articleCurrentPage - 1) / PAGE_BLOCK_SIZE
    );

    const articleStartPage = articleCurrentPageBlock * PAGE_BLOCK_SIZE + 1;
    const articleEndPage = Math.min(
        articleStartPage + PAGE_BLOCK_SIZE - 1,
        articleTotalPages
    );

    const articlePageNumbers = Array.from(
        { length: articleEndPage - articleStartPage + 1 },
        (_, index) => articleStartPage + index
    );

    const goArticlePage = (page) => {
        if (page < 1 || page > articleTotalPages) {
            return;
        }

        setArticleCurrentPage(page);
    };

    // 리뷰가 달린 상품 목록
    // 리뷰 관리 탭에서는 리뷰가 있는 상품만 보여주고,
    // 필터는 조회하기 버튼을 눌렀을 때 reviewProductFilter 값으로 적용됨.
    const reviewProductItems = useMemo(() => {
        let result = items
            .map((item) => {
                const summary = reviewCounts[item.itemId];

                return {
                    ...item,
                    reviewCount: summary?.reviewCount || 0,
                    averageScore: summary?.averageScore || 0,
                };
            })
            .filter((item) => item.reviewCount > 0);

        if (reviewProductFilter === "lowScore") {
            result = result.filter((item) => item.averageScore < 3);
        }

        if (reviewProductFilter === "manyReviews") {
            result = [...result].sort(
                (a, b) => Number(b.reviewCount || 0) - Number(a.reviewCount || 0)
            );
        }

        if (reviewProductFilter === "highScore") {
            result = [...result].sort(
                (a, b) => Number(b.averageScore || 0) - Number(a.averageScore || 0)
            );
        }

        return result;
    }, [items, reviewCounts, reviewProductFilter]);

    //리뷰 관리 전체페이지 수
    const reviewTotalPages = Math.max(
        1,
        Math.ceil(reviewProductItems.length / REVIEWS_PER_PAGE)
    );

    useEffect(() => {
        if (reviewCurrentPage > reviewTotalPages) {
            setReviewCurrentPage(reviewTotalPages);
        }
    }, [reviewCurrentPage, reviewTotalPages]);

    const pagedReviewProductItems = useMemo(() => {
        const startIndex = (reviewCurrentPage - 1) * REVIEWS_PER_PAGE;
        const endIndex = startIndex + REVIEWS_PER_PAGE;

        return reviewProductItems.slice(startIndex, endIndex);
    }, [reviewProductItems, reviewCurrentPage]);

    // 리뷰 관리 5개 단위 페이지 블록 계산
    const reviewCurrentPageBlock = Math.floor(
        (reviewCurrentPage - 1) / PAGE_BLOCK_SIZE
    );

    const reviewStartPage = reviewCurrentPageBlock * PAGE_BLOCK_SIZE + 1;
    const reviewEndPage = Math.min(
        reviewStartPage + PAGE_BLOCK_SIZE - 1,
        reviewTotalPages
    );

    const reviewPageNumbers = Array.from(
        { length: reviewEndPage - reviewStartPage + 1 },
        (_, index) => reviewStartPage + index
    );

    // 리뷰 관리 페이지 이동
    const goReviewPage = (page) => {
        if (page < 1 || page > reviewTotalPages) {
            return;
        }

        setReviewCurrentPage(page);
    };

    //관리자 요약 정보
    const waitingArticleCount = articles.filter(
        (article) => article.articleStatus !== "ANSWERED"
    ).length;

    const answeredArticleCount = articles.filter(
        (article) => article.articleStatus === "ANSWERED"
    ).length;

    //============================================================//

    return (
        <div>
            <div className="main-header">
                {/* 헤더 영역 */}
                <Header />
            </div>

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
                <div className="itemAdmin-topHeader">
                    <div>
                        <p className="itemAdmin-kicker">ADMIN CONSOLE</p>
                        <h1 className="itemAdmin-title">관리자 통합 관리</h1>
                    </div>

                    <button
                        type="button"
                        className="itemAdmin-button itemAdmin-subButton"
                        onClick={() => navigate("/item")}
                    >
                        쇼핑몰 상품목록으로
                    </button>
                </div>

                {/* 관리자 요약 카드 */}
                <div className="itemAdmin-summaryGrid">
                    <div className="itemAdmin-summaryCard">
                        <span className="itemAdmin-summaryLabel">전체 상품</span>
                        <strong className="itemAdmin-summaryValue">{items.length}</strong>
                    </div>

                    <div className="itemAdmin-summaryCard">
                        <span className="itemAdmin-summaryLabel">리뷰 상품</span>
                        <strong className="itemAdmin-summaryValue">
                            {reviewProductItems.length}
                        </strong>
                    </div>

                    <div className="itemAdmin-summaryCard">
                        <span className="itemAdmin-summaryLabel">상담 대기</span>
                        <strong className="itemAdmin-summaryValue">
                            {waitingArticleCount}
                        </strong>
                    </div>

                    <div className="itemAdmin-summaryCard">
                        <span className="itemAdmin-summaryLabel">답변 완료</span>
                        <strong className="itemAdmin-summaryValue">
                            {answeredArticleCount}
                        </strong>
                    </div>
                </div>

                {/* 상단 관리자 탭 영역 */}
                <div className="itemAdmin-tabArea">
                    <button
                        type="button"
                        className={
                            activeTab === "items"
                                ? "itemAdmin-tabButton itemAdmin-tabButtonActive"
                                : "itemAdmin-tabButton"
                        }
                        onClick={() => handleChangeAdminTab("items")}
                    >
                        상품 관리
                    </button>

                    <button
                        type="button"
                        className={
                            activeTab === "reviews"
                                ? "itemAdmin-tabButton itemAdmin-tabButtonActive"
                                : "itemAdmin-tabButton"
                        }
                        onClick={() => handleChangeAdminTab("reviews")}
                    >
                        리뷰 관리
                    </button>

                    <button
                        type="button"
                        className={
                            activeTab === "articles"
                                ? "itemAdmin-tabButton itemAdmin-tabButtonActive"
                                : "itemAdmin-tabButton"
                        }
                        onClick={() => handleChangeAdminTab("articles")}
                    >
                        상담 관리
                    </button>
                </div>

                {/* 상품 관리 화면 */}
                {activeTab === "items" && (
                    <div className="itemAdmin-section">
                        <div className="itemAdmin-sectionHeader">
                            <div>
                                <h2 className="itemAdmin-sectionTitle">상품 관리</h2>
                                <p className="itemAdmin-sectionDesc">
                                    등록된 상품을 조회하고 수정, 삭제할 수 있습니다.
                                </p>
                            </div>

                            <div className="itemAdmin-sectionActions">
                                <button
                                    type="button"
                                    className="itemAdmin-button"
                                    onClick={() => navigate("/item/create")}
                                >
                                    상품 등록
                                </button>

                                <button
                                    type="button"
                                    className="itemAdmin-button itemAdmin-dangerButton"
                                    onClick={handleAdminDeleteSelectedItems}
                                    disabled={selectedItemIds.length === 0}
                                >
                                    선택 삭제
                                    {selectedItemIds.length > 0
                                        ? ` (${selectedItemIds.length})`
                                        : ""}
                                </button>
                            </div>
                        </div>

                        {/* 등록 상품 개수 */}
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
                            <div className="itemAdmin-filterGroup">
                                <label className="itemAdmin-label">카테고리</label>

                                <select
                                    className="itemAdmin-select"
                                    value={searchCategoryFilter}
                                    onChange={(e) =>
                                        setSearchCategoryFilter(e.target.value)
                                    }
                                >
                                    <option value="">전체</option>
                                    <option value="주방">주방</option>
                                    <option value="거실">거실</option>
                                    <option value="욕실">욕실</option>
                                    <option value="침실">침실</option>
                                </select>
                            </div>

                            <div className="itemAdmin-filterGroup">
                                <label className="itemAdmin-label">판매상태</label>

                                <select
                                    className="itemAdmin-select"
                                    value={searchSellStatusFilter}
                                    onChange={(e) =>
                                        setSearchSellStatusFilter(e.target.value)
                                    }
                                >
                                    <option value="">전체</option>
                                    <option value="SELL">SELL</option>
                                    <option value="SOLD_OUT">SOLD_OUT</option>
                                    <option value="STOP">STOP</option>
                                    <option value="COMING_SOON">COMING_SOON</option>
                                </select>
                            </div>

                            <div className="itemAdmin-filterGroup">
                                <label className="itemAdmin-label">재고 정렬</label>

                                <select
                                    className="itemAdmin-select"
                                    value={searchStockSort}
                                    onChange={(e) =>
                                        setSearchStockSort(e.target.value)
                                    }
                                >
                                    <option value="">기본순</option>
                                    <option value="stockAsc">재고 적은순</option>
                                    <option value="stockDesc">재고 많은순</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                className="itemAdmin-button"
                                onClick={handleSearchFilter}
                            >
                                필터 조회
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
                                초기화
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
                                            <th className="itemAdmin-checkColumn">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        pagedItems.length > 0 &&
                                                        pagedItems.every((item) =>
                                                            selectedItemIds.includes(
                                                                Number(item.itemId)
                                                            )
                                                        )
                                                    }
                                                    onChange={handleSelectAllPagedItems}
                                                />
                                            </th>

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
                                                <td className="itemAdmin-checkColumn">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelectedItem(item.itemId)}
                                                        onChange={() =>
                                                            handleSelectAdminItem(item.itemId)
                                                        }
                                                    />
                                                </td>

                                                <td>
                                                    {(currentPage - 1) * ITEMS_PER_PAGE +
                                                        index +
                                                        1}
                                                </td>

                                                <td>{item.itemId}</td>
                                                <td>{item.itemCategory}</td>

                                                <td className="itemAdmin-tableTextLeft">
                                                    <Link
                                                        to={`/item/${item.itemId}`}
                                                        className="itemAdmin-nameLink"
                                                    >
                                                        {item.itemName}
                                                    </Link>
                                                </td>

                                                <td>{formatPrice(item.itemPrice)}원</td>
                                                <td>{item.itemStock}</td>
                                                <td>{item.itemSellStatus}</td>

                                                <td>
                                                    <div className="itemAdmin-reviewButtonBox">
                                                        <button
                                                            type="button"
                                                            className="itemAdmin-tableButton itemAdmin-tableSubButton"
                                                            onClick={() =>
                                                                handleGoItemReviewDetail(item.itemId)
                                                            }
                                                        >
                                                            리뷰보기
                                                        </button>

                                                        <span className="itemAdmin-reviewCount">
                                                            {reviewCounts[item.itemId]?.reviewCount ??
                                                                0}
                                                            개
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="itemAdmin-tableButtonArea">
                                                        <button
                                                            type="button"
                                                            className="itemAdmin-tableButton"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/item/update/${item.itemId}`
                                                                )
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

                                {/*선택한 상품 목록 표시 영역 */}
                                <div className="itemAdmin-selectedBox">
                                    <div className="itemAdmin-selectedHeader">
                                        <h3 className="itemAdmin-selectedTitle">
                                            선택한 상품
                                            <span className="itemAdmin-selectedCount">
                                                {selectedAdminItems.length}개
                                            </span>
                                        </h3>

                                        <div className="itemAdmin-selectedButtonArea">
                                            <button
                                                type="button"
                                                className="itemAdmin-button itemAdmin-dangerButton"
                                                onClick={handleAdminDeleteSelectedItems}
                                                disabled={selectedAdminItems.length === 0}
                                            >
                                                선택 삭제
                                            </button>

                                            <button
                                                type="button"
                                                className="itemAdmin-button itemAdmin-subButton"
                                                onClick={handleClearSelectedAdminItems}
                                                disabled={selectedAdminItems.length === 0}
                                            >
                                                선택 비우기
                                            </button>
                                        </div>
                                    </div>

                                    {selectedAdminItems.length === 0 ? (
                                        <p className="itemAdmin-emptyText">
                                            선택한 상품이 없습니다.
                                        </p>
                                    ) : (
                                        <div className="itemAdmin-selectedList">
                                            {selectedAdminItems.map((item) => (
                                                <div
                                                    key={item.itemId}
                                                    className="itemAdmin-selectedCard"
                                                >
                                                    <div>
                                                        <p className="itemAdmin-selectedName">
                                                            {item.itemName}
                                                        </p>

                                                        <p className="itemAdmin-selectedInfo">
                                                            ID {item.itemId} · {item.itemCategory} ·{" "}
                                                            {formatPrice(item.itemPrice)}원 · 재고{" "}
                                                            {item.itemStock}개 · {item.itemSellStatus}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="itemAdmin-tableButton itemAdmin-tableDangerButton"
                                                        onClick={() =>
                                                            handleRemoveSelectedAdminItem(item.itemId)
                                                        }
                                                    >
                                                        선택 해제
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 리뷰 관리 화면 */}
                {activeTab === "reviews" && (
                    <div className="itemAdmin-section">
                        <div className="itemAdmin-sectionHeader">
                            <div>
                                <h2 className="itemAdmin-sectionTitle">리뷰 관리</h2>
                                <p className="itemAdmin-sectionDesc">
                                    리뷰가 등록된 상품을 기준으로 리뷰 현황을 확인합니다.
                                </p>
                            </div>
                        </div>

                        {/* 리뷰 상품 필터 영역 */}
                        <div className="itemAdmin-reviewSelectArea">
                            <label className="itemAdmin-label">리뷰 상품 필터</label>

                            <select
                                className="itemAdmin-select"
                                value={searchReviewProductFilter}
                                onChange={(e) =>
                                    setSearchReviewProductFilter(e.target.value)
                                }
                            >
                                <option value="hasReview">리뷰 있는 상품</option>
                                <option value="lowScore">낮은 평점 상품</option>
                                <option value="manyReviews">리뷰 많은 상품</option>
                                <option value="highScore">평점 높은 상품</option>
                            </select>

                            <button
                                type="button"
                                className="itemAdmin-button"
                                onClick={() => {
                                    setReviewProductFilter(searchReviewProductFilter);
                                    setReviewCurrentPage(1);
                                }}
                            >
                                조회
                            </button>
                        </div>

                        {/* 리뷰 달린 상품 목록 */}
                        <div className="itemAdmin-tableWrap">
                            <table className="itemAdmin-table">
                                <thead>
                                    <tr>
                                        <th>번호</th>
                                        <th>상품ID</th>
                                        <th>상품명</th>
                                        <th>카테고리</th>
                                        <th>판매상태</th>
                                        <th>평균 평점</th>
                                        <th>리뷰 수</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {reviewProductItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="itemAdmin-emptyText">
                                                조건에 맞는 리뷰 상품이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        pagedReviewProductItems.map((item, index) => (
                                            <tr key={item.itemId}>
                                                <td>
                                                    {(reviewCurrentPage - 1) *
                                                        REVIEWS_PER_PAGE +
                                                        index +
                                                        1}
                                                </td>

                                                <td>{item.itemId}</td>

                                                <td className="itemAdmin-tableTextLeft">
                                                    <Link
                                                        to={`/item/${item.itemId}`}
                                                        className="itemAdmin-nameLink"
                                                    >
                                                        {item.itemName}
                                                    </Link>
                                                </td>

                                                <td>{item.itemCategory}</td>
                                                <td>{item.itemSellStatus}</td>

                                                <td>
                                                    {Number(item.averageScore || 0).toFixed(1)} / 5
                                                </td>

                                                <td>{item.reviewCount}개</td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="itemAdmin-tableButton itemAdmin-tableSubButton"
                                                        onClick={() =>
                                                            handleGoItemReviewDetail(item.itemId)
                                                        }
                                                    >
                                                        리뷰보기
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* 리뷰 관리 페이지네이션 */}
                            {reviewProductItems.length > REVIEWS_PER_PAGE && (
                                <div className="itemAdmin-pagination">
                                    <button
                                        type="button"
                                        className="itemAdmin-pageButton"
                                        onClick={() => goReviewPage(reviewStartPage - 1)}
                                        disabled={reviewStartPage === 1}
                                    >
                                        &lt;
                                    </button>

                                    {reviewPageNumbers.map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            className={
                                                reviewCurrentPage === page
                                                    ? "itemAdmin-pageButton itemAdmin-pageButtonActive"
                                                    : "itemAdmin-pageButton"
                                            }
                                            onClick={() => goReviewPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        className="itemAdmin-pageButton"
                                        onClick={() => goReviewPage(reviewEndPage + 1)}
                                        disabled={reviewEndPage === reviewTotalPages}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 상담 관리 화면 */}
                {activeTab === "articles" && (
                    <div className="itemAdmin-section">
                        <div className="itemAdmin-sectionHeader">
                            <div>
                                <h2 className="itemAdmin-sectionTitle">상담 관리</h2>
                                <p className="itemAdmin-sectionDesc">
                                    고객 문의를 확인하고 관리자 답변을 등록합니다.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="itemAdmin-button"
                                onClick={getArticles}
                            >
                                새로고침
                            </button>
                        </div>

                        <div className="itemAdmin-countBox">
                            <span className="itemAdmin-countText">
                                총 상담 문의: {articles.length}개
                            </span>

                            <span className="itemAdmin-countText">
                                답변 대기: {waitingArticleCount}개
                            </span>

                            <span className="itemAdmin-countText">
                                답변 완료: {answeredArticleCount}개
                            </span>
                        </div>

                        {articles.length === 0 ? (
                            <p className="itemAdmin-emptyText">
                                등록된 상담 문의가 없습니다.
                            </p>
                        ) : (
                            <>
                                <div className="itemAdmin-articleGrid">
                                    {pagedArticles.map((article) => (
                                        <div
                                            key={article.articleId}
                                            className="itemAdmin-articleCard"
                                        >
                                            <div className="itemAdmin-articleCardHeader">
                                                <div>
                                                    <span
                                                        className={
                                                            article.articleStatus === "ANSWERED"
                                                                ? "itemAdmin-statusBadge itemAdmin-statusAnswered"
                                                                : "itemAdmin-statusBadge itemAdmin-statusWaiting"
                                                        }
                                                    >
                                                        {article.articleStatus === "ANSWERED"
                                                            ? "답변완료"
                                                            : "답변대기"}
                                                    </span>

                                                    <h3 className="itemAdmin-articleTitle">
                                                        {article.articleTitle}
                                                    </h3>
                                                </div>

                                                <div className="itemAdmin-articleHeaderActions">
                                                    <span className="itemAdmin-articleId">
                                                        #{article.articleId}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className="itemAdmin-articleDeleteButton"
                                                        onClick={() =>
                                                            handleDeleteArticle(article.articleId)
                                                        }
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="itemAdmin-articleMeta">
                                                <span>
                                                    구분: {article.memberId ? "회원" : "비회원"}
                                                </span>

                                                <span>회원ID: {article.memberId || "-"}</span>

                                                <span>
                                                    상품ID:{" "}
                                                    {article.itemId ? (
                                                        <button
                                                            type="button"
                                                            className="itemAdmin-articleItemLink"
                                                            onClick={() => handleGoArticleItemDetail(article.itemId)}
                                                        >
                                                            {article.itemId}
                                                        </button>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </span>

                                                <span>작성일: {formatDate(article.createdAt)}</span>
                                            </div>

                                            <div className="itemAdmin-articleContentBox">
                                                <p className="itemAdmin-articleLabel">문의 내용</p>
                                                <pre className="itemAdmin-articleContent">
                                                    {article.articleContent}
                                                </pre>
                                            </div>

                                            <div className="itemAdmin-articleContentBox">
                                                <p className="itemAdmin-articleLabel">현재 답변</p>

                                                {article.articleAnswer ? (
                                                    <pre className="itemAdmin-articleAnswer">
                                                        {article.articleAnswer}
                                                    </pre>
                                                ) : (
                                                    <p className="itemAdmin-noAnswer">
                                                        아직 등록된 답변이 없습니다.
                                                    </p>
                                                )}
                                            </div>

                                            <div className="itemAdmin-answerBox">
                                                <label className="itemAdmin-label">
                                                    관리자 답변 작성
                                                </label>

                                                <textarea
                                                    className="itemAdmin-answerTextarea"
                                                    value={
                                                        articleAnswerInputs[article.articleId] || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChangeArticleAnswer(
                                                            article.articleId,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={
                                                        article.articleAnswer
                                                            ? "답변을 수정하려면 새 답변을 입력하세요."
                                                            : "고객에게 보낼 답변을 입력하세요."
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    className="itemAdmin-button"
                                                    onClick={() =>
                                                        handleSubmitArticleAnswer(article.articleId)
                                                    }
                                                >
                                                    {article.articleAnswer
                                                        ? "답변 수정"
                                                        : "답변 등록"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {articles.length > ARTICLES_PER_PAGE && (
                                    <div className="itemAdmin-pagination">
                                        <button
                                            type="button"
                                            className="itemAdmin-pageButton"
                                            onClick={() =>
                                                goArticlePage(articleStartPage - 1)
                                            }
                                            disabled={articleStartPage === 1}
                                        >
                                            &lt;
                                        </button>

                                        {articlePageNumbers.map((page) => (
                                            <button
                                                key={page}
                                                type="button"
                                                className={
                                                    articleCurrentPage === page
                                                        ? "itemAdmin-pageButton itemAdmin-pageButtonActive"
                                                        : "itemAdmin-pageButton"
                                                }
                                                onClick={() => goArticlePage(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            className="itemAdmin-pageButton"
                                            onClick={() =>
                                                goArticlePage(articleEndPage + 1)
                                            }
                                            disabled={articleEndPage === articleTotalPages}
                                        >
                                            &gt;
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* 푸터 영역 */}
            <div className="main-mypage-footer">
                <Footer />
            </div>
        </div>
    );
};

export default ItemAdminPage;