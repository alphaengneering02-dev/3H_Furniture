import React, { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import '../../css/itemPageCss/itemPage.css';
import IconButton from "@mui/material/IconButton";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../main/Header";
import Footer from "../main/Footer";


//상품목록, 선택상품영역이 모두 코딩되어 있는 곳입니다. 망가지면 큰일나요.
//관리자 상품관리/리뷰관리는 ItemAdminPage.js로 분리했습니다.

function Item() {
  const navigate = useNavigate();

  //백엔드에서 가져온 전체 상품 목록 저장
  const [items, setItems] = useState([]);

  //알반 유저가 체크박스로 선택한 상품 목록 저장
  const [selectedItems, setSelectedItems] = useState([]);

  //관리자 체크박스 선택한 상품 목록
  const [selectedAdminItemIds,setSelectedAdminItemIds] = useState([]);

  //북마크 상태 저장([201,223,230])
  const [bookmarkedItems, setBookmarkedItems] = useState([]);

  //상품 상세페이지로 갔다가 아이템 목록으로 돌아오더라도 체킹 유지 및 체킹 목록 유지
  const SELECTED_ITEMS_KEY = "selectedItems";

  //상품별 리뷰 요약 저장
  const [reviewSummaryMap,setReviewSummaryMap] = useState({});
  //정렬기준
  const [sortType, setSortType] = useState("");
  //판매상태 필터
  const [sellStatusFilter,setSellStatusFilter] = useState("");

  //조회버튼 눌렀을 때, 필터 적용
  const [searchSortType, setSearchSortType] = useState("");
  const [searchSellStatusFilter, setSearchSellStatusFilter] = useState("");

  //메인페이지랑 연결되는 필터링
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const [categoryFilter,setCategoryFilter] = useState(categoryParam);

  //페이징
  const [currentPage, setCurrentPage] = useState(1);

  //한 페이지에 보여줄 상품 개수
  const ITEMS_PER_PAGE =8;

  //페이지 번호를 5개씩 보여주기
  const PAGE_BLOCK_SIZE = 5;

  //로그인 유저 롤
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

  //컴포넌트가 처음 실행될 때 상품 목록 조회. 그리고 북마크
  //처음 화면 돌아왔을 때, 선택한 상품 복구
  useEffect(() => {
    getItems();
    getMyBookmarks();
    getAllReviewSummaries();

    //세션 유지 코드 보강(기존 코딩)
    // const savedSelectedItems =JSON.parse(sessionStorage.getItem(SELECTED_ITEMS_KEY));

    // if(savedSelectedItems && Array.isArray(savedSelectedItems)){
    //   setSelectedItems(savedSelectedItems);
    //}

    let savedSelectedItems = [];

    try {
      savedSelectedItems =
        JSON.parse(sessionStorage.getItem(SELECTED_ITEMS_KEY)) || [];
    } catch (error) {
      console.error("selectedItems 파싱 실패", error);
      sessionStorage.removeItem(SELECTED_ITEMS_KEY);
      savedSelectedItems = [];
    }

    if (Array.isArray(savedSelectedItems)) {
      setSelectedItems(savedSelectedItems);
    }
  }, []);

  //selectedItems가 바뀔 때마다 자동으로 sessionStorage에 저장
  useEffect(() => {
    sessionStorage.setItem(
      SELECTED_ITEMS_KEY,
      JSON.stringify(selectedItems)
    );
  }, [selectedItems]);


  //메인에서 사용할 카테고리 필터 함수
  useEffect(()=>{
    setCategoryFilter(categoryParam);
    setCurrentPage(1);
  },[categoryParam]);

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


  //상품 선택 가능 여부 확인
  //재고가 없거나 판매 상태가 SELL이 아니면 선택 불가
 const getSellStatusInfo = (item)=>{
    if(!item){
      return{
        text:"-",
        selectable:false,
        message:"상품 정보가 없습니다.",
      };
    }
    if(Number(item.itemStock||0)<=0){
      return{
        text:"품절",
        selectable:false,
        message:"품절된 상품입니다.",
      };
    }
    if(item.itemSellStatus === "SELL"){
      return{
        text:"판매중",
        selectable:true,
        message:"",
      };
    }
    if(item.itemSellStatus==="STOP"){
      return{
        text:"판매중지",
        selectable:false,
        message:"판매중지된 상품입니다.",
      };
    }
    if(item.itemSellStatus==="SOLD_OUT"){
      return{
        text:"품절",
        selectable:false,
        message:"품절된 상품입니다."
      };
    }
    if(item.itemSellStatus==="COMING_SOON"){
      return{
        text:"판매예정",
        selectable:false,
        message:"판매예정 상품입니다.",
      };
    }

    return{
      text:item.itemSellStatus || "-",
      selectable: false,
      message: "판매중인 상품만 선택 가능합니다.",
    }
 };

 //선택할 수 있는 아이템
 const canSellectItem = (item,showAlert =false)=>{
    const sellStatusInfo = getSellStatusInfo(item);

    if(!sellStatusInfo.selectable){
      if(showAlert){
        toast.warning(sellStatusInfo.message);
      }
      return false;
    }
    return true;
 };

  //백엔드에서 전체 상품 목록 가져오기
  const getItems = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/item", {
        withCredentials: true,
      });

      console.log("상품 목록:", response.data);

      //가져온 상품 목록을 items state에 저장
      setItems(response.data || []);
    } catch (error) {
      console.error("상품 목록 조회 실패", error);
      toast.error("상품 목록을 불러오지 못했습니다.");
    }
  };

  //상품 평점
  const getAllReviewSummaries = async()=>{
    try{
      const response = await axios.get(
        "http://localhost:8080/api/reviews/summary/all",
        {
          withCredentials:true,
        }
      );
      setReviewSummaryMap(response.data||{});
    }catch(error){
      console.error("전체 리뷰 요약 조회 실패",error);
      setReviewSummaryMap({});
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

  //현재 로그인한 사용자 정보
  const user = getLoginUser();

  //현재 로그인한 사용자가 admin인지 여부
  const isAdmin = isAdminRole(user);

  //비로그인 유저 확인
  const isUser = isUserRole(user);

  //북마크 여부 확인 함수
  const isBookmarked = (itemId) => {
    return bookmarkedItems.includes(itemId);
  };

  //특정 상품이 현재 선택된 상태인지 확인
  const isSelected = (itemId) => {
    return selectedItems.some((selected) => selected.itemId === itemId);
  };

  //체크박스로 상품선택/선택해제 처리
  const handleSelectItem = (item) => {
    const loginUser = getLoginUser();

      if (!loginUser) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      if (!isUserRole(loginUser)) {
        toast.warning("일반 회원만 상품을 선택할 수 있습니다.");
        return;
      }

      //재고,판매상태 확인
      if (!canSellectItem(item, true)) {
        return;
      }
      //이미 선택된 상품이면 선택 해제
      if (isSelected(item.itemId)) {
        setSelectedItems(
          selectedItems.filter((selected) => selected.itemId !== item.itemId)
        );
        return;
      }

    //선택되지 않은 상품이면 selecteItems에 추가
    setSelectedItems([
      ...selectedItems,
      {
        itemId: item.itemId,
        itemName: item.itemName,
        itemImgUrl: item.itemImgUrl,
        itemPrice: item.itemPrice,
        itemDiscountPrice: item.itemDiscountPrice,
        itemFinalPrice: getFinalPrice(item),
        itemStock: item.itemStock,
        itemSellStatus: item.itemSellStatus,
        count: 1,
      },
    ]);
  };

  //북마크 토글 함수 추가
  const handleToggleBookmark = async (itemId) => {
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
      toast.error("회원 정보가 올바르지 않습ㄴ디ㅏ.");
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

      toast.error("북마크 처리 실패");
    }
  };

  //선택 상품 수량 변경
  const handleCountChange = (itemId, value) => {
    const count = Number(value);

    //수량은 1이상만 가능
    if (count < 1) {
      toast.warning("수량은 1개 이상이어야 합니다.");
      return;
    }

    //선택된 상품 목록에서 해당 상품의 수량만 변경
    setSelectedItems(
      selectedItems.map((selected) => {
        if (selected.itemId !== itemId) {
          return selected;
        }

        //재고보다 많이 선택할 수 없도록 방지
        if (count > selected.itemStock) {
          toast.warning("재고 수량을 초과할 수 없습니다.");
          return selected;
        }

        return {
          ...selected,
          count,
        };
      })
    );
  };

  //선택 목록에서 상품 제거
  const handleRemoveSelectedItem = (itemId) => {
    setSelectedItems(
      selectedItems.filter((selected) => selected.itemId !== itemId)
    );
  };

  //선택 상품 장바구니/구매처리 전 검증
  const validateSelectedItems = () => {
    const loginUser = getLoginUser();

    //  console.log("validateSelectedItems loginUser:", loginUser);
    //  console.log("loginUser.role:", loginUser?.role);
    //  console.log("loginUser.role.key:", loginUser?.role?.key);
    //  console.log("isUserRole:", isUserRole(loginUser));

    //비로그인 검사
    if (!loginUser) {
      toast.error("로그인이 필요합니다.");
      navigate("/login");
      return false;
    }

    //일반 회원인지 검사
    if (!isUserRole(loginUser)) {
      toast.error("일반 회원만 이용할 수 있습니다.");
      return false;
    }

    //선택 상품이 있는지 검사
    if (selectedItems.length === 0) {
      toast.error("상품을 1개 이상 선택해주세요.");
      return false;
    }

    //선택된 상품 하나씩 검사
    for (const item of selectedItems) {
      if (!item.itemId) {
        toast.warning("잘못된 상품 정보가 있습니다.");
        return false;
      }

      if (!item.count || item.count < 1) {
        toast.warning(`${item.itemName}의 수량은 1개 이상이어야 합니다.`);
        return false;
      }

      if (item.count > item.itemStock) {
        toast.warning(`${item.itemName}의 수량이 재고보다 많습니다.`);
        return false;
      }

      if (item.itemSellStatus && item.itemSellStatus !== "SELL") {
        toast.warning(`${item.itemName}은 현재 판매중인 상품이 아닙니다.`);
        return false;
      }
    }

    return true;
  };

  //선택한 상품들의 총 가격 계산
  const getTotalPrice = () => {
    return selectedItems.reduce((sum, item) => {
      return sum + Number(item.itemFinalPrice || 0) * Number(item.count || 1);
    }, 0);
  };

  //장바구니에 상품 담기
  //itemId: 상품ID
  //count: 수량
  //showSuccessAlert: 성공 alert 표시 여부
  const handleAddCart = async (itemId, count = 1, showSuccessAlert = true) => {
    const loginUser = getLoginUser();

    if (!loginUser) {
      toast.warning("로그인이 필요합니다.");
      navigate("/login");
      return false;
    }

    if (!isUserRole(loginUser)) {
      toast.warning("일반 회원만 장바구니를 이용할 수 있습니다.");
      return false;
    }

    try {
      //CartItemController에서 @ModelAttribute로 받기 때문에 FormData 사용
      const formData = new FormData();
      formData.append("itemId", itemId);
      formData.append("count", count);

      await axios.post("http://localhost:8080/api/cartItem/add", formData, {
        withCredentials: true,
      });

      if (showSuccessAlert) {
        toast.success("장바구니에 담겼습니다.");
      }

      return true;
    } catch (error) {
      console.error("장바구니 담기 실패", error);

      if (error.response) {
        console.log("상태코드:", error.response.status);
        console.log("응답메시지:", error.response.data);
      }

      if (error.response?.status === 401) {
        toast.error("로그인이 필요합니다.");
        navigate("/login");
      }

      return false;
    }
  };

  //상품 1개를 바로 장바구니에 담기
  const handleAddOneCart = async (item) => {
    if (!canSellectItem(item, true)) {
      return;
    }

    const success = await handleAddCart(item.itemId, 1, true);

    if (!success) {
      toast.error("장바구니 담기 실패");
    }
  };

  //선택한 여러 상품을 장바구니에 담기
  const handleAddSelectedCart = async () => {
    if (!validateSelectedItems()) {
      return;
    }

    const failedItems = [];

    //선택된 상품들을 하나씩 장바구니 api로 전송
    for (const item of selectedItems) {
      const success = await handleAddCart(item.itemId, item.count, false);

      if (!success) {
        failedItems.push(item.itemName);
      }
    }

    if (failedItems.length > 0) {
      toast.error(`일부 상품 담기 실패: ${failedItems.join(", ")}`);
      return;
    }

    toast.success("선택한 상품이 장바구니에 담겼습니다.");

    //성공 후 선택 목록 비우기
    setSelectedItems([]);
  };

  //상품 1개 바로 구매
  const handleBuyNow = (item) => {
    const loginUser = getLoginUser();

    if (!loginUser) {
      toast.error("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (!isUserRole(loginUser)) {
      toast.warning("일반 회원만 구매할 수 있습니다.");
      return;
    }

    if (!canSellectItem(item, true)) {
      return;
    }

    //단일 상품 주문 페이지로 이동
    navigate(`/order/${item.itemId}`);
  };

  //내 장바구니로 가기
  //장바구니 담기 API: POST /api/cartItem/add
  //장바구니 목록 API: GET /api/Member/cart/list/{id}
  //프론트 장바구니 화면: /cart
  const handlGoMyCart = () => {
    const loginUser = getLoginUser();

    if (!loginUser) {
      toast.error("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (!isUserRole(loginUser)) {
      toast.warning("일반 회원만 장바구니를 이용할 수 있습니다.");
      return;
    }

    navigate("/cart");
  };

  //선택한 여러 상품 구매
  //현재 구조에서는 선택 상품을 장바구니에 담고 장바구니 페이지로 이동
  const handleBuySelectedItems = async () => {
    if (!validateSelectedItems()) {
      return;
    }

    const confirmBuy = window.confirm(
      "선택한 상품을 장바구니에 담고 장바구니 페이지로 이동하시겠습니까?"
    );

    if (!confirmBuy) {
      return;
    }

    const failedItems = [];

    //선택한 상품을 장바구니에 먼저 담기
    for (const item of selectedItems) {
      const success = await handleAddCart(item.itemId, item.count, false);

      if (!success) {
        failedItems.push(item.itemName);
      }
    }

    if (failedItems.length > 0) {
      toast.error(`일부 상품 처리 실패: ${failedItems.join(", ")}`);
      return;
    }

    setSelectedItems([]);
    navigate("/cart");
  };

  //상품 목록 체킹 시, 선택한 목록에서 전체 삭제 기능 추가.
  const handleClearSelectedItems = () => {
    const confirmClear = window.confirm("선택한 상품을 모두 삭세하시겠습니까?");

    if (!confirmClear) {
      return;
    }

    setSelectedItems([]);
    sessionStorage.removeItem(SELECTED_ITEMS_KEY);
  };

  //상품 목록 정렬 / 필터 처리/카테고리도 필터_메인과 연결
  const sortedItems = [...items]
    .filter((item) => {

      //메인페이지에서 /item?category로 넘어온 경우
      if(categoryFilter && item.itemCategory !== categoryFilter){
        return false;
      }
      //판매상태 필터
      if(sellStatusFilter && item.itemSellStatus !== sellStatusFilter){
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aFinalPrice = getFinalPrice(a);
      const bFinalPrice = getFinalPrice(b);

      const aRating = Number(reviewSummaryMap[a.itemId]?.averageScore || 0);
      const bRating = Number(reviewSummaryMap[b.itemId]?.averageScore || 0);

      if (sortType === "priceHigh") {
        return bFinalPrice - aFinalPrice;
      }

      if (sortType === "priceLow") {
        return aFinalPrice - bFinalPrice;
      }

      if (sortType === "ratingHigh") {
        return bRating - aRating;
      }

      if (sortType === "ratingLow") {
        return aRating - bRating;
      }

      return 0;
    });

  //조회버튼 눌렀을 때, 필터링 적용
  const handleSearchFilter = () =>{
    setSortType(searchSortType);
    setSellStatusFilter(searchSellStatusFilter);
    setCurrentPage(1);
  };


 //관리자 상품 선택 여부 확인
 const isSelectedAdminItem =(itemId)=>{
  return selectedAdminItemIds.includes(Number(itemId));
 };

 //관리자 상품 개별 선택/선택해제 처리
 const handleSelectAdminItem = (itemId)=>{
  const numberItemId = Number(itemId);

  if(selectedAdminItemIds.includes(numberItemId)){
    setSelectedAdminItemIds(
      selectedAdminItemIds.filter((id)=>id !== numberItemId)
    );
    return;
  }
  setSelectedAdminItemIds([...selectedAdminItemIds,numberItemId]);
 };

//관리자가 선택한 상품 여러 개 삭제 
const handleAdminDeleteSelectedItems = async ()=>{
  const loginUser = getLoginUser();

  if(!loginUser){
    toast.error("로그인이 필요합니다.");
    navigate("/login");
    return;
  }
  if(!isAdminRole(loginUser)){
    toast.warning("관리자만 상품을 삭제할 수 있습니다.");
    return;
  }
  
  if(selectedAdminItemIds.length===0){
    toast.warning("삭제할 상품을 선택해주세요.");
    return;
  }

  const confirmDelete = window.confirm(
    `선택한 상품 ${selectedAdminItemIds.length}개를 삭제하시겠습니다?`
  );

  if(!confirmDelete){
    return;
  }

    const deletedItemIds = [];
    const notDeletableItemIds = [];
    const failedItemIds = [];

    try {
      for (const selectedItemId of selectedAdminItemIds) {
        try {
          //상품이 주문내역에 있던 상품인지 삭제 가능 여부 먼저 확인
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

          //상품 삭제 API 하나만 호출
          //이미지 DB 삭제, 상품DB삭제, 물리 파일 삭제는 백엔드에서 처리
          await axios.delete(
            `http://localhost:8080/api/admin/item/${selectedItemId}`,
            {
              withCredentials: true,
            }
          );

          deletedItemIds.push(selectedItemId);
        } catch (error) {
          console.error(`${selectedItemId}번 상품 삭제 실패`, error);

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
          `주문내역이 있는 상품 ${notDeletableItemIds.length}개는 삭제되지 않았습니다. 판매상태를 판매중지(STOP)로 변경해주세요.`
        );
      }

      if (failedItemIds.length > 0) {
        toast.error(`${failedItemIds.length}개 상품 삭제에 실패했습니다.`);
      }

      //삭제 후 상품 목록 다시 불러오기
      getItems();

      //삭제된 상품은 관리자 선택 목록에서 제거
      setSelectedAdminItemIds((prevIds) =>
        prevIds.filter((itemId) => !deletedItemIds.includes(itemId))
      );
    } catch (error) {
      console.error("선택 상품 삭제 실패", error);
      toast.error("선택 상품 삭제 실패");
    }
  };


  //페이징 계산
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE));

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const pagedItems = sortedItems.slice(startIndex, endIndex);

  // 5개 단위 페이지 블록 계산
  const currentPageBlock = Math.floor((currentPage - 1) / PAGE_BLOCK_SIZE);
  const startPage = currentPageBlock * PAGE_BLOCK_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_BLOCK_SIZE - 1, totalPages);

    const pageNumbers = Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    );

    const handlePgeChange = (page) => {
      if (page < 1 || page > totalPages) {
        return;
      }

    setCurrentPage(page);
    window.scrollTo({top:0,behavior:"smooth"});
  }


  //JSX부분^__________^===================================================

  return (
  <div>
    {/* 실제 헤더 영역 */}
    <Header />
    
        <ToastContainer
      position="top-center"
      autoClose={1800}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      pauseOnHover
      theme="light"
    />

    <div className="item-page">
      {/*상품 목록 페이지 제목 */}
      <h1 className="item-title">상품 목록</h1>
      {categoryFilter&& (
        <p className="item-current-category">
          현재 카테고리: <strong>{categoryFilter}</strong>
        </p>
      )}

      {/*등록된 상품 개수 표시 */}
      <div className="item-count-box">
        <span className="item-count-text">
            총 등록 상품: {items.length}개
        </span>
        <span className="item-count-text">
          현재 조건 상품: {sortedItems.length}개
        </span>
      </div>

          {/*상품정렬/필터 영역 */}
      <div className="item-sort-area">
        <select
          className="item-sort-select"
          value={searchSortType}
          onChange={(e) => {
            setSearchSortType(e.target.value);
          }}
        >
          <option value="">기본순</option>
          <option value="ratingHigh">평점 높은 순</option>
          <option value="ratingLow">평점 낮은 순</option>
          <option value="priceHigh">가격 높은 순</option>
          <option value="priceLow">가격 낮은 순</option>
        </select>

        <select
          className="item-sort-select"
          value={searchSellStatusFilter}
          onChange={(e) => {
            setSearchSellStatusFilter(e.target.value);
          }}
        >
          <option value="">판매상태 전체</option>
          <option value="SELL">판매중</option>
          <option value="SOLD_OUT">품절</option>
          <option value="STOP">판매중지</option>
          <option value="COMING_SOON">판매예정</option>
        </select>

        <button type="button" onClick={handleSearchFilter}>
          필터조회하기
        </button>

                <button type="button" onClick={()=>{
          setSearchSortType("");
          setSearchSellStatusFilter("");

          setSortType("");
          setSellStatusFilter("");

          setCurrentPage(1);
        }}>
          필터초기화
        </button>
      </div>

      {/*관리자 로그인 시에만 관리자 상품/리뷰 관리 페이지 이동 버튼 표시 */}
      {isAdmin && (
        <div className="item-action-area">
          <button type="button" onClick={() => navigate("/admin/item")}>
            관리자 상품/리뷰 관리
          </button>
          {/* 관리자가 상품 목록에서 여러 개 선택 삭제 */}
        <button
          type="button"
          className="item-admin-delete-button"
          onClick={handleAdminDeleteSelectedItems}
          disabled={selectedAdminItemIds.length === 0}
        >
          선택 삭제 {selectedAdminItemIds.length > 0 ? `(${selectedAdminItemIds.length})` : ""}
        </button>
        </div>
      )}

      {/*상품 목록 표시 영역 */}
      <div className="item-list">
        {sortedItems.length === 0 ? (
          <p className="item-empty-text">상품이 없습니다.</p>
        ) : (
          pagedItems.map((item) => {
            const selectable = canSellectItem(item, false);

            return (
              <div key={item.itemId} className="item-card">
                {/*기존은 !isAdmin이였는데 일반 유저면 보이게 바꿈*/}
                {isUser && (
                  <input
                    className="item-checkbox"
                    type="checkbox"
                    checked={isSelected(item.itemId)}
                    disabled={!selectable}
                    onChange={() => handleSelectItem(item)}
                  />
                )}
                {/* 관리자가 상품 목록에서 여러 개 선택 삭제 */}
                {isAdmin && (
                  <input
                    className="item-checkbox item-admin-checkbox"
                    type="checkbox"
                    checked={isSelectedAdminItem(item.itemId)}
                    onChange={() => handleSelectAdminItem(item.itemId)}
                  />
                )}

                <div className="item-image-box">
                  {item.itemImgUrl ? (
                    <img
                      className="item-image"
                      src={`http://localhost:8080${item.itemImgUrl}`}
                      alt={item.itemName}
                    />
                  ) : (
                    <p className="item-no-image">이미지 없음</p>
                  )}
                </div>

                <div className="item-info">
                  <Link className="item-link" to={`/item/${item.itemId}`}>
                    <h2 className="item-name">{item.itemName}</h2>
                  </Link>
                  <p className="item-rating-text">
                    평점:{Number(reviewSummaryMap[item.itemId]?.averageScore||0).toFixed(1)}
                    /5({reviewSummaryMap[item.itemId]?.reviewCount||0})
                  </p>

                  {/*<p className="item-text">카테고리: {item.itemCategory}</p>*/}
                  {/*<p className="item-text">상품 설명: {item.itemDetail}</p>*/}
                  {/*<p className="item-text">상품 색상: {item.itemColor}</p>*/}
                  <p className="item-text">
                    상품 가격: {formatPrice(item.itemPrice)}원
                  </p>
                  <p className="item-text">
                    상품 할인가격: {formatPrice(item.itemDiscountPrice)}원
                  </p>
                  <p className="item-text item-price">
                    상품 최종가격: {formatPrice(getFinalPrice(item))}원
                  </p>
                  <p className="item-text">상품 재고: {item.itemStock}</p>
                  <p className="item-text">
                    판매 상태: {getSellStatusInfo(item).text}
                  </p>

                  {/*판매 상태가 sell이 아니면 구매 또는 장바구니 담기 안됌. */}
                  <p className="item-text">
                    {/*{getSellStatusInfo(item).message}*/}
                  </p>

                  {!selectable && (
                    <p className="item-warning">
                      {getSellStatusInfo(item).message}
                    </p>
                  )}

                  {/*기존은 !isAdmin이였는데 일반 유저면 보이게 바꿈*/}
                </div>

                {/*기존은 !isAdmin이였는데 일반 유저면 보이게 바꿈*/}
                {isUser && (
                    <div className="item-card-icon-area">
                      <IconButton
                        type="button"
                        className="item-card-icon-button"
                        disabled={!selectable}
                        onClick={() => handleAddOneCart(item)}
                        aria-label="장바구니 담기"
                      >
                        <ShoppingBagOutlinedIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        type="button"
                        className="item-card-icon-button"
                        onClick={() => handleToggleBookmark(item.itemId)}
                        aria-label="북마크"
                      >
                        {isBookmarked(item.itemId) ? (
                          <FavoriteIcon fontSize="small" className="item-card-favorite-active" />
                        ) : (
                          <FavoriteBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    </div>
                  )}
              </div>
            );
          })
        )}
      </div>

      {sortedItems.length > ITEMS_PER_PAGE && (
        <div className="item-pagination">
          <button
            type="button"
            className="item-page-button"
            disabled={startPage === 1}
            onClick={() => handlePgeChange(startPage - 1)}
          >
            &lt;
          </button>

          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              className={`item-page-button ${
                currentPage === page ? "item-page-button-active" : ""
              }`}
              onClick={() => handlePgeChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="item-page-button"
            disabled={endPage === totalPages}
            onClick={() => handlePgeChange(endPage + 1)}
          >
            &gt;
          </button>
        </div>
      )}

      {/*기존은 !isAdmin이였는데 일반 유저면 보이게 바꿈*/}
      {isUser && selectedItems.length > 0 && (
        <div className="item-selected-box">
          <h2 className="item-section-title">선택한 상품</h2>

          <table className="item-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>가격</th>
                <th>수량</th>
                <th>소계</th>
                <th>삭제</th>
              </tr>
            </thead>

            <tbody>
              {selectedItems.map((item) => (
                <tr key={item.itemId}>
                  <td>
                    <Link
                      className="item-table-link"
                      to={`/item/${item.itemId}`}
                    >
                      {item.itemName}
                    </Link>
                  </td>

                  <td>{item.itemFinalPrice}</td>

                  <td>
                    <input
                      className="item-count-input"
                      type="number"
                      min="1"
                      max={item.itemStock}
                      value={item.count}
                      onChange={(e) =>
                        handleCountChange(item.itemId, e.target.value)
                      }
                    />
                    <span className="item-stock-text">
                      {" "}
                      / 재고 {item.itemStock}
                    </span>
                  </td>

                  <td>{item.itemFinalPrice * item.count}</td>

                  <td>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedItem(item.itemId)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="item-total-price">
            총 가격: {formatPrice(getTotalPrice())}원
          </h3>

          <div className="item-selected-button-area">
            <button
              type="button"
              onClick={handleClearSelectedItems}
              className="item-button item-danger-button"
            >
              선택 상품 전체 삭제
            </button>

            <button
              type="button"
              onClick={handleAddSelectedCart}
              className="item-button"
            >
              선택 상품 장바구니 담기
            </button>

            <button
              type="button"
              className="item-button item-sub-button"
              onClick={handleBuySelectedItems}
            >
              선택 상품 구매하기
            </button>
          </div>
        </div>
      )}
    </div>

    {/* 실제 푸터 영역 */}
    <Footer />
  </div>
);
}

export default Item;