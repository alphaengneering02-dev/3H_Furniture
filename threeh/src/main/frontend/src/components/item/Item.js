import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import '../../css/itemPageCss/itemPage.css';

function Item() {
  const navigate = useNavigate();

  //백엔드에서 가져온 전체 상품 목록 저장
  const [items, setItems] = useState([]);
  const [adminMode, setAdminMode] = useState(false);

  //알반 유저가 체크박스로 선택한 상품 목록 저장
  const [selectedItems, setSelectedItems] = useState([]);
  //북마크 상태 저장([201,223,230])
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  //상품 상세페이지로 갔다가 아이템 목록으로 돌아오더라도 체킹 유지 및 체킹 목록 유지
  const SELECTED_ITEMS_KEY = "selectedItems";

  //관리자 모드 여부
  //false: 일반 상품 목록 화면
  //ture: 관리자 상품 수정/삭제 테이블 화면
  //상품 수정 및 등록 후 /item으로 돌아왔을 때, 바로 관리자 테이블(목록)이 보이도록(useLocation)
  const location = useLocation();
  
  const getLoginUser = () => {
    
    //sesstionStroage에 저장된 로그인 사용자 정보 가져오기
    return JSON.parse(sessionStorage.getItem("user"));
  };

  //로그인한 사용자가 관리자인지 확인
  const isAdminRole = (user) => {
    return (
      user &&
      (
        user.role === "ADMIN" ||
        user.role === "ROLE_ADMIN" ||
        user.role?.key === "ADMIN" ||
        user.role?.key === "ROLE_ADMIN"
      )
    );
  };

  //로그인한 사용자가 일반 회원인지 확인
  const isUserRole = (user) => {
    return (
      user &&
      (
        user.role === "USER" ||
        user.role === "ROLE_USER" ||
        user.role?.key === "USER" ||
        user.role?.key === "ROLE_USER"
      )
    );
  };

   //컴포넌트가 처음 실행될 때 상품 목록 조회. 그리고 북마크
   //관리자 모드일때, ItemCreate.js또는 ItemUpdate.js에서 /item으로 돌아왔을 때, 상품관리 목록이 바로 열림.
   //처음 화면 돌아왔을 때, 선택한 상품 복구

  useEffect(() => {
    getItems();
    getMyBookmarks();

    const savedSelectedItems =JSON.parse(sessionStorage.getItem(SELECTED_ITEMS_KEY));

    if(savedSelectedItems && Array.isArray(savedSelectedItems)){
      setSelectedItems(savedSelectedItems);
    }

    if(location.state?.adminMode){
      setAdminMode(true);
    }

  }, [location.state]);

  //selectedItems가 바뀔 때마다 자동으로 sessionStorage에 저장
  useEffect(()=>{
    sessionStorage.setItem(
      SELECTED_ITEMS_KEY,
      JSON.stringify(selectedItems)
    );
  },[selectedItems]);


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

  const formatPrice = (price) =>{
    return Number(price || 0).toLocaleString();
  };


  //상품 선택 가능 여부 확인
  //재고가 없거나 판매 상태가 SELL이 아니면 선택 불가
  const canSelectItem = (item, showAlert = false) => {
    if (item.itemStock <= 0) {
      if (showAlert) {
        alert("품절된 상품입니다.");
      }
      return false;
    }

    if (item.itemSellStatus && item.itemSellStatus !== "SELL") {
      if (showAlert) {
        alert("판매중인 상품만 선택 가능합니다.");
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
      setItems(response.data);
    } catch (error) {
      console.error("상품 목록 조회 실패", error);
      alert("상품 목록을 불러오지 못했습니다.");
    }
  };

//북마크 가져오기
  const getMyBookmarks = async()=>{
    const loginUser = getLoginUser();
 
    if(!loginUser||!isUserRole(loginUser)){
      return;
    }

    const memberId = loginUser.memberId;

    if(!memberId){
      console.log("memberId가 없습니다:", loginUser);
      return;
    }

    try{
      const response = await axios.get(
        `http://localhost:8080/api/bookmarks/member/${memberId}`,
        {
          withCredentials:true,
        }
      );

      console.log("내 북마크 목록:", response.data);

      const bookmarkedItems=response.data.map(
        (bookmark)=>bookmark.itemId
      );

      setBookmarkedItems(bookmarkedItems);
    }catch(error){
      console.error("북마크 목록 조회 실패", error);
    }
  };


  //현재 로그인한 사용자 정보
  const user = getLoginUser();
  //현재 로그인한 사용자가 admin인지 여부
  const isAdmin = isAdminRole(user);

  //북마크 여부 확인 함수
  const isBookmarked = (itemId) =>{
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
      alert("일반 회원만 상품을 선택할 수 있습니다.");
      return;
    }

    //재고,판매상태 확인
    if (!canSelectItem(item, true)) {
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
   const handleToggleBookmark = async(itemId) =>{
    const loginUser = getLoginUser();

    if(!loginUser){
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if(!isUserRole(loginUser)){
      alert("일반 회원만 북마크를 이용할 수 있습니다.");
      return;
    }

    if(!loginUser.memberId){
      alert("회원 정보가 올바르지 않습ㄴ디ㅏ.");
      console.log("로그인 유저:", loginUser);
      return;
    }

    try{
      const payload = {
        memberId:loginUser.memberId,
        itemId: itemId,
        type: "ITEM",
      };

      const response =await axios.post(
        "http://localhost:8080/api/bookmarks/toggle",
        payload,
        {
          withCredentials: true,
        }
      );

      console.log("북마크 응답:",response.data);

      if(response.data.bookmarked){
        //북마크 추가
        setBookmarkedItems((prev)=>{
          if(prev.includes(itemId)){
            return prev;
          }
          return[...prev,itemId];
        });
      }else{
        //북마크 삭제
        setBookmarkedItems((prev) => prev.filter((id)=>id !==itemId)
      );
    }
  } catch (error) {
      console.error("북마크 처리 실패",error);

      if(error.response){
        console.log("상태코드:",error.response.status);
        console.log("응답메시지:",error.response.data);
      }
      alert("북마크 처리 실패");
    }
   };

  //선택 상품 수량 변경
  const handleCountChange = (itemId, value) => {
    const count = Number(value);

    //수량은 1이상만 가능
    if (count < 1) {
      alert("수량은 1개 이상이어야 합니다.");
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
          alert("재고 수량을 초과할 수 없습니다.");
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

    //비로그인 검사
    if (!loginUser) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return false;
    }

    //일반 회원인지 검사
    if (!isUserRole(loginUser)) {
      alert("일반 회원만 이용할 수 있습니다.");
      return false;
    }

    //선택 상품이 있는지 검사
    if (selectedItems.length === 0) {
      alert("상품을 1개 이상 선택해주세요.");
      return false;
    }

    //선택된 상품 하나씩 검사
    for (const item of selectedItems) {
      if (!item.itemId) {
        alert("잘못된 상품 정보가 있습니다.");
        return false;
      }

      if (!item.count || item.count < 1) {
        alert(`${item.itemName}의 수량은 1개 이상이어야 합니다.`);
        return false;
      }

      if (item.count > item.itemStock) {
        alert(`${item.itemName}의 수량이 재고보다 많습니다.`);
        return false;
      }

      if (item.itemSellStatus && item.itemSellStatus !== "SELL") {
        alert(`${item.itemName}은 현재 판매중인 상품이 아닙니다.`);
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
      alert("로그인이 필요합니다.");
      navigate("/login");
      return false;
    }

    if (!isUserRole(loginUser)) {
      alert("일반 회원만 장바구니를 이용할 수 있습니다.");
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
        alert("장바구니에 담겼습니다.");
      }

      return true;
    } catch (error) {
      console.error("장바구니 담기 실패", error);

      if (error.response) {
        console.log("상태코드:", error.response.status);
        console.log("응답메시지:", error.response.data);
      }

      if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      }

      return false;
    }
  };

  //상품 1개를 바로 장바구니에 담기
  const handleAddOneCart = async (item) => {
    if (!canSelectItem(item, true)) {
      return;
    }

    const success = await handleAddCart(item.itemId, 1, true);

    if (!success) {
      alert("장바구니 담기 실패");
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
      alert(`일부 상품 담기 실패: ${failedItems.join(", ")}`);
      return;
    }

    alert("선택한 상품이 장바구니에 담겼습니다.");
    
    //성공 후 선택 목록 비우기
    setSelectedItems([]);
  };

  //상품 1개 바로 구매
  const handleBuyNow = (item) => {
    const loginUser = getLoginUser();

    if (!loginUser) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (!isUserRole(loginUser)) {
      alert("일반 회원만 구매할 수 있습니다.");
      return;
    }

    if (!canSelectItem(item, true)) {
      return;
    }

    //단일 상품 주문 페이지로 이동
    navigate(`/order/${item.itemId}`);
  };


  //내 장바구니로 가기
  //장바구니 담기 API: POST /api/cartItem/add
  //장바구니 목록 API: GET /api/Member/cart/list/{id}
  //프론트 장바구니 화면: /cart
  const handlGoMyCart = () =>{
    const loginUser = getLoginUser();

    if(!loginUser){
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
    }

    if(!isUserRole(loginUser)){
        alert("일반 회원만 장바구니를 이용할 수 있습니다.");
        return;
    }

    navigate("/cart")
  }

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
      alert(`일부 상품 처리 실패: ${failedItems.join(", ")}`);
      return;
    }

    setSelectedItems([]);
    navigate("/cart");
  };

  const handleAdminCreateClick = () => {
    navigate("/item/create");
  };

  //관리자 상품 수정/삭제 테이블 보기
  const handleAdminListClick = () => {
    setAdminMode(true);
  };

  //일반 상품 목록 보기
  const handleNormalListClick = () => {
    setAdminMode(false);
  };

  //상품 수정 페이지 이동
  const handleUpdateClick = (itemId) => {
    navigate(`/item/update/${itemId}`);
  };

  //상품 삭제
  const handleDeleteClick = async (itemId) => {
    const confirmDelete = window.confirm("정말 이 상품을 삭제하시겠습니까?");

    if (!confirmDelete) {
      return;
    }

    try {
        //상품에 연결된 이미지 먼저 조회 (FK)
      const imgRes = await axios.get(
        `http://localhost:8080/api/itemImgs/${itemId}`,
        {
          withCredentials: true,
        }
      );

      const itemImgs = imgRes.data;

      //FK문제 방지를 위해 이미지 먼저 삭제
      for (const img of itemImgs) {
        await axios.delete(
          `http://localhost:8080/api/itemImgs/${img.itemImgId}`,
          {
            withCredentials: true,
          }
        );
      }

      //이미지 삭제 후 상품 삭제
      await axios.delete(`http://localhost:8080/api/admin/item/${itemId}`, {
        withCredentials: true,
      });

      alert("상품이 삭제되었습니다.");
      
      //선택 목록에 있던 상품도 제거
      setSelectedItems(
        selectedItems.filter((item) => item.itemId !== itemId)
      );

      //북마크 목록에 있는 상품도 제거
      setBookmarkedItems(
        bookmarkedItems.filter((id) => id !== itemId)
      );

      //삭제 후 최신 상품 목록 다시 조회
      getItems();

    } catch (error) {
      console.error("상품 삭제 실패", error);

      if (error.response) {
        console.log("상품 삭제 상태코드: ",error.response.status);
        console.log("상품 삭제 응답: ",error.response.data);
      }

      alert("상품 삭제 실패");
    }
  };

  //상품 목록 체킹 시, 선택한 목록에서 전체 삭제 기능 추가.
  const handleClearSelectedItems =()=>{
    const confirmClear = window.confirm("선택한 상품을 모두 삭세하시겠습니까?");

    if(!confirmClear){
      return;    
    }

    setSelectedItems([]);
    sessionStorage.removeItem(SELECTED_ITEMS_KEY);
  };


  //JSX부분^__________^

  return (
    <div >
        {/*상품 목록 페이지 제목 */}
      <h1>상품 목록</h1>

         {/*내 장바구니로 가기_admin인경우 안보이게*/}
      {!isAdmin&&(
        <div style={{marginBottom:"20px"}}>
            <button type="button" onClick={handlGoMyCart}>
                장바구니 보기
            </button>
        </div>
      )}

      {/*관리자 로그인 시에만 상품 등록/수정삭제 버튼 표시 */}
      {isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <button type="button" onClick={handleAdminCreateClick}>
            상품 등록하기
          </button>

          <button
            type="button"
            onClick={handleAdminListClick}
            style={{ marginLeft: "10px" }}
          >
            상품수정 및 삭제하기
          </button>

        {/*관리자 모드일 때 일반 목록으로 돌아가는 버튼 표시*/}
          {adminMode && (
            <button
              type="button"
              onClick={handleNormalListClick}
              style={{ marginLeft: "10px" }}
            >
              일반상품 목록 보기
            </button>
          )}
        </div>
      )}

    {/*adminMode가 true이고 관리자라면 관리자용 테이블 표시 */}
      {adminMode && isAdmin ? (
        <div>
          <h2>관리자 상품 관리</h2>

          {items.length === 0 ? (
            <p>등록된 상품이 없습니다.</p>
          ) : (
            <table
              border="1"
              cellPadding="10"
              style={{ borderCollapse: "collapse", width:"100%", }}
            >
              <thead>
                <tr>
                  <th>ItemId</th>
                  <th>제품 카테고리</th>
                  <th>제품명</th>
                  <th>가격</th>
                  <th>재고</th>
                  <th>판매상태</th>
                  <th>관리</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.itemId}>
                    <td>{item.itemId}</td>
                    <td>{item.itemCategory}</td>
                    <td>{item.itemName}</td>
                    <td>{formatPrice(item.itemPrice)}원</td>
                    <td>{item.itemStock}</td>
                    <td>{item.itemSellStatus}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleUpdateClick(item.itemId)}
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(item.itemId)}
                        style={{ marginLeft: "10px" }}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div>
          {items.length === 0 ? (
            <p>상품이 없습니다.</p>
          ) : (
            items.map((item) => {
              const selectable = canSelectItem(item, false);

              return (
                <div key={item.itemId} style={{ marginBottom: "30px" }}>
                  {!isAdmin && (
                    <input
                      type="checkbox"
                      checked={isSelected(item.itemId)}
                      disabled={!selectable}
                      onChange={() => handleSelectItem(item)}
                    />
                  )}

                  {item.itemImgUrl ? (
                    <img
                      src={`http://localhost:8080${item.itemImgUrl}`}
                      alt={item.itemName}
                      width="200"
                    />
                  ) : (
                    <p>이미지 없음</p>
                  )}

                <div>
                  <Link to={`/item/${item.itemId}`}>
                    <h2>{item.itemName}</h2>
                  </Link>

                  <p>카테고리: {item.itemCategory}</p>
                  <p>상품 설명: {item.itemDetail}</p>
                  <p>상품 색상: {item.itemColor}</p>
                  <p>상품 가격: {item.itemPrice}</p>
                  <p>상품 할인가격: {formatPrice(item.itemDiscountPrice)}원</p>
                  <p>상품 최종가격: {formatPrice(getFinalPrice(item))}원</p>
                  <p>상품 재고: {item.itemStock}</p>
                  <p>판매 상태: {item.itemSellStatus}</p>

                  {!selectable && (
                    <p style={{ color: "red" }}>
                      현재 선택할 수 없는 상품입니다.
                    </p>
                  )}

                  {!isAdmin && (
                    <button
                      type="button"
                      onClick={()=>handleToggleBookmark(item.itemId)}
                      style={{
                        border:"none",
                        background:"transparent",
                        fontSize:"26px",
                        cursor:"pointer",
                        color:isBookmarked(item.itemId) ? "red" : "black",
                      }}
                     >
                      {isBookmarked(item.itemId) ?"♥" : "♡"} 
                    </button>
                  )}
                 </div> 
                  {!isAdmin && (
                    <div>
                      <button
                        type="button"
                        disabled={!selectable}
                        onClick={() => handleAddOneCart(item)}
                      >
                        장바구니 담기
                      </button>

                      <button
                        type="button"
                        disabled={!selectable}
                        onClick={() => handleBuyNow(item)}
                        style={{ marginLeft: "10px" }}
                      >
                        구매하기
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {!isAdmin && selectedItems.length > 0 && (
        <div
          style={{
            border: "2px solid black",
            padding: "20px",
            marginTop: "30px",
          }}
        >
          <h2>선택한 상품</h2>

          <table
            border="1"
            cellPadding="10"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
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
                      <Link to={`/item/${item.itemId}`}>
                      {item.itemName}
                    </Link>  
                    </td>
                  <td>{item.itemFinalPrice}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max={item.itemStock}
                      value={item.count}
                      onChange={(e) =>
                        handleCountChange(item.itemId, e.target.value)
                      }
                    />
                    <span> / 재고 {item.itemStock}</span>
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

          <h3>총 가격: {formatPrice(getTotalPrice())}원</h3>

          <button type="button" onClick={handleClearSelectedItems} style={{marginBottom:"10px"}}>
            선택 상품 전체 삭제
          </button>
          <button type="button" onClick={handleAddSelectedCart}>
            선택 상품 장바구니 담기
          </button>

          <button
            type="button"
            onClick={handleBuySelectedItems}
            style={{ marginLeft: "10px" }}
          >
            선택 상품 구매하기
          </button>
        </div>
      )}
    </div>
  );
}

export default Item;