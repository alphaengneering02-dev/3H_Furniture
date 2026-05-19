import React, { useEffect, useState } from 'react';
import axios from 'axios';
import{useNavigate,useParams}from "react-router-dom";

const ItemDetail = () => {

    //URL에서 Item 가져오기
    const {itemId} = useParams();
    const navigate = useNavigate();

    //로그인 확인
    const getLoginUser = () => {
        return JSON.parse(sessionStorage.getItem("user"))
    };

    const handleAddCart =async()=>{
        const user = getLoginUser();

        if(!user){
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        try{
            const formData = new FormData();
            formData.append("itemId", itemId);
            formData.append("count", 1);

            await axios.post(
                "http://localhost:8080/api/cartItem/add",
                formData,
                {
                    withCredentials:true,
                }
            );

            alert("장바구니에 담겼습니다.");
        }catch(error){
            console.error("장바구니 담기 실패", error);

            if(error.response?.status === 401){
                alert("로그인이 필요합니다.");
                navigate("/login");
                return;
            }
            alert("장바구니 담기 실패");
        }
    };

    const handleBuyNow = () =>{
        const user =getLoginUser();

        if(!user){
            alert("로그인이 필요합니다.")
            navigate("/login");
            return;
        }
        navigate(`/order/${itemId}`);
    }
    
    //상품 상태 관리
    const [item,setItem] = useState(null);
    //이미지 상태 관리
    const [itemImgs,setItemImgs] = useState([]);
    
    //상품 리뷰 상태 관리
    const[reviews, setReviews] = useState([]);
    //리뷰 평균 평점, 리뷰 개수
    const[reviewSummary, setReviewSummary] = useState(null);
    //리뷰 작성용 별점
    const[reviewScore,setReviewScore] = useState(5);
    //리뷰 작성용 내용
    const[reviewText,setReviewText] = useState("");

    
    //admin 판별 코드
    const user = JSON.parse(sessionStorage.getItem("user"));

    const isAdmin = user && (
        user.role ==="ADMIN"||
        user.role ==="ROLE_ADMIN"||
        user.role?.key === "ROLE_ADMIN"||
        user.role?.key === "ADMIN"
    );

    useEffect(()=>{
        if(!itemId){
            console.error("itemId가 없습니다.");
            return;
        }

        getItem();
        getItemImgs();
        getReviews();
        getReviewsSummary();
    },[itemId]);


    //상품정보 동기화
    const getItem = async() =>{
        try{
            const response = await axios.get(
                `http://localhost:8080/api/item/${itemId}`,{
                    withCredentials:true,
                }
            );
            console.log("상품 상세:", response.data);
            setItem(response.data);
        }catch(error){
            console.error("상품 상세조회 실패", error);
        }
    };

    //상품이미지 정보 동기화

    const getItemImgs = async() =>{
        try{
            const response = await axios.get(
                `http://localhost:8080/api/itemImgs/${itemId}`
            );
            console.log("상품 이미지: ", response.data);
            setItemImgs(response.data);
        }catch(error){
            console.error("상품 이미지 조회 실패", error);
        }
    };

    const handleUpdateClick = () =>{
        navigate(`/item/update/${itemId}`);
    };

    //리뷰조회 함수 추가
    const getReviews = async()=>{
        try{
            const response = await axios.get(
                `http://localhost:8080/api/reviews/item/${itemId}`,
                {
                    withCredentials:true,
                }
            );

            console.log("리뷰 목록:",response.data);
            setReviews(response.data);
        }catch(error){
            console.error("리뷰 조회 실패", error);

            if(error.response){
                console.log("리뷰 조회 상태코드:",error.response.status);
                console.log("리뷰 조회 응답:",error.response.data);
            }
        }
    };

    //리뷰 평균 평점 조회 함수 추가
    const getReviewsSummary = async()=>{
        try{
            const response = await axios.get(
                `http://localhost:8080/api/reviews/summary/${itemId}`,
                {
                    withCredentials: true,
                }
            );
            console.log("리뷰 평점 요약:", response.data);
            setReviewSummary(response.data);
        }catch(error){
            console.error("리뷰 평점 조회 실패",error);
            if(error.response){
                console.log("리뷰 평점 상태코드:",error.response.status);
                console.log("리뷰 평점 응답:",error.response.data);
            }
        }
    };

    //리뷰 등록 함수 추가
    const handleSubmitReview = async()=>{
        const user = JSON.parse(sessionStorage.getItem("user"));

        if(!user){
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        if(!reviewScore|| reviewScore<1 || reviewScore>5){
            alert("별점은 1점 이상 5점 이하로 선택해주세요.");
            return;
        }

        if(!reviewText.trim()){
            alert("리뷰 내용을 입력해주세요.");
            return;
        }

        if(reviewText.length>255){
            alert("리뷰 내용은 255자를 초과할 수 없습니다.");
            return;
        }

        try{
            await axios.post(
                `http://localhost:8080/api/reviews/${itemId}`,
                {
                    reviewScore:reviewScore,
                    reviewText: reviewText,
                },
                {
                    withCredentials: true,
                }
            );
            alert("리뷰가 등록되었습니다.");
            
            setReviewScore(5);
            setReviewText("");

            getReviews();
            getReviewsSummary();
        }catch(error){
            console.error("리뷰 등록 실패",error);
            
            if(error.response){
                console.log("리뷰 등록 상태코드:",error.response.status);
                console.log("리뷰 등록 응답:",error.response.data);
                alert(error.response.data);
                return;
            }
            alert("리뷰 등록 실패");
        }
    }


    //삭제 관리......(admin에서)
    const handleDeleteClick = async () => {
        const confirmDelete = window.confirm("정말 이 상품을 삭제하시겠습니까?");

        if(!confirmDelete){
            return;
        }

        try{
            /*아이템이미지가 아이템을 참조하고 있어서, 이미지가 있는 상품은 이미지 먼저 삭제하고
            상품을 삭제하도록 순서를 맞춰야 함. 알았지? */

            for(const img of itemImgs){
                await axios.delete(
                    `http://localhost:8080/api/itemImgs/${img.itemImgId}`,{
                        withCredentials: true,
                    }
                );
            }

        await axios.delete(
            `http://localhost:8080/api/admin/item/${itemId}`,{
                withCredentials:true,
            }
        );

        alert("상품이 삭제되었습니다.");
        navigate("/item");
    }catch(error){
        console.error("상품 삭제 실패", error);

        if(error.response){
            console.log(error.response.data);
        }
        alert("상품 삭제 실패");
    }
    };

    if(!item){
        return <p>상품 불러오는 중....</p>;
    }

    const mainImg = itemImgs.find((img)=> img.thumbnailYn === "Y");
    const subImgs = itemImgs.filter((img)=> img.thumbnailYn === "N");

    const renderStars = (score) => {
        
        const full = "★".repeat(score || 0);
        const empty = "☆".repeat(5 - (score || 0));

        return full + empty;
    };

   
    //=================================JSX구역===========================

    return (
        <div>
            <button type="button" onClick={()=>navigate("/item")}>
                상품 목록
            </button>
            
            <h1>상품 상세 페이지</h1>

            <h2>{item.itemName}</h2>

            {mainImg ? (
                <div>
                    <h3>대표 이미지</h3>
                    <img src={`http://localhost:8080${mainImg.itemImgUrl}`} alt={mainImg.itemImgName} width="300"/>
                </div>
            ) : (
                <p>대표 이미지가 없습니다.</p>
            )}

            {subImgs.length>0 &&(
                <div>
                    <h3>서브 이미지</h3>

                    {subImgs.map((img)=>(
                        <img key={img.itemImgId}src={`http://localhost:8080${img.itemImgUrl}`}alt={img.itemImgName} width="150" style={{marginRight: "10px", marginBottom:"10px",}}/>
                    ))}
                </div>
            )}
            <hr/>

            <p>카테고리: {item.itemCategory}</p>
            <p>상품 설명: {item.itemDetail}</p>
            <p>상품 색상: {item.itemColor}</p>
            <p>상품 가격: {item.itemPrice}</p>
            <p>상품 할인가격: {item.itemDiscountPrice}</p>
            <p>상품 최종가격: {item.itemFinalPrice}</p>
            <p>상품 재고: {item.itemStock}</p>

            {isAdmin &&(
                <div style={{marginTop:"20px"}}>
                    <button type="button" onClick={handleUpdateClick}>상품 수정</button>

                    <button type="button" onClick={handleDeleteClick} style={{marginLeft:"10px"}}>상품 삭제</button>

                </div>
            )}

            <div style={{marginTop:"20px"}}>

                <button type="button" onClick={handleAddCart}>장바구니 담기</button>

                <button type="button" onClick={handleBuyNow} style={{marginLeft:"10px"}}>구매하기</button>
            </div>
            
            <div style={{ marginTop: "40px", borderTop: "1px solid #ddd", paddingTop: "30px" }}>
            <h2>상품 리뷰</h2>

            {reviewSummary && (
                <div style={{ marginBottom: "20px" }}>
                <p>
                    평균 평점:{" "}
                    {Number(reviewSummary.averageScore || 0).toFixed(1)} / 5
                </p>
                <p>리뷰 수: {reviewSummary.reviewCount || 0}</p>
                </div>
            )}

        {user&&!isAdmin &&(
            <div style={{ marginBottom: "30px" }}>
                <h3>리뷰 작성</h3>

                <div>
                <label>별점: </label>
                <select
                    value={reviewScore}
                    onChange={(e) => setReviewScore(Number(e.target.value))}
                >
                    <option value={5}>★★★★★ 5점</option>
                    <option value={4}>★★★★☆ 4점</option>
                    <option value={3}>★★★☆☆ 3점</option>
                    <option value={2}>★★☆☆☆ 2점</option>
                    <option value={1}>★☆☆☆☆ 1점</option>
                </select>
                </div>

                <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="상품 리뷰를 작성해주세요. 구매한 상품만 리뷰 작성이 가능합니다."
                rows={5}
                maxLength={255}
                style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "10px",
                }}
                />

                <p>{reviewText.length} / 255</p>

                <button type="button" onClick={handleSubmitReview}>
                리뷰 등록
                </button>
            </div>
        )}
            <div>
                {reviews.length === 0 ? (
                <p>아직 작성된 리뷰가 없습니다.</p>
                ) : (
                reviews.map((review) => (
                    <div
                    key={review.reviewId}
                    style={{
                        borderBottom: "1px solid #ddd",
                        padding: "15px 0",
                    }}
                    >
                    <strong>
                        {review.memberName || review.memberLoginId || "회원"}
                    </strong>

                    <p style={{ color: "#f5a623", fontSize: "20px" }}>
                        {renderStars(review.reviewScore)}
                    </p>

                    <p>{review.reviewText}</p>

                    <small>
                        작성일:{" "}
                        {review.createdAt
                        ? String(review.createdAt).substring(0, 10)
                        : ""}
                    </small>
                    </div>
                ))
                )}
            </div>
            </div>

        </div>
    );
};

export default ItemDetail;