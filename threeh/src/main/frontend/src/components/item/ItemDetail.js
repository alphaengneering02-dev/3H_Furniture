import React, { useEffect, useState } from 'react';
import axios from 'axios';
import{useNavigate,useParams}from "react-router-dom";
import Review from './Review';
import "../../css/itemPageCss/itemDetail.css";

const ItemDetail = () => {

    //URL에서 Item 가져오기
    const {itemId} = useParams();
    const navigate = useNavigate();

    //상품 상태 관리
    const [item,setItem] = useState(null);
    //이미지 상태 관리
    const [itemImgs,setItemImgs] = useState([]);
    //가격 정형화.
    const formatPrice = (price) =>{
        return Number(price || 0).toLocaleString();
    };


    //로그인 확인
    const getLoginUser = () => {
        return JSON.parse(sessionStorage.getItem("user"))
    };

    //판매상태 확인_상태랑 재고에 따라 구매 가능 여부 
    const getSellStatusInfo = (item)=>{
        if(!item){
            return{
                text:"-",
                buyable:false,
                message:"상품 정보가 없습니다.",
            };
        }
        if(Number(item.itemStock || 0)<=0){
            return{
                text:"품절",
                buyable:false,
                message:"품절된 상품입니다."
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

    //장바구니 담기
    const handleAddCart =async()=>{
        const user = getLoginUser();

        if(!user){
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        if(!getSellStatusInfo(item).buyable){
            alert(getSellStatusInfo(item).message);
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

    //바로 구매하기
    const handleBuyNow = () =>{
        const user =getLoginUser();

        if(!user){
            alert("로그인이 필요합니다.")
            navigate("/login");
            return;
        }
        if(!getSellStatusInfo(item).buyable){
            alert(getSellStatusInfo(item).message);
            return;
        }
        navigate(`/order/${itemId}`);
    }   
    
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

    if(!item){
        return <p className="itemDetail-loading">상품 불러오는 중....</p>;
    }

    const mainImg = itemImgs.find((img)=> img.thumbnailYn === "Y");
    const subImgs = itemImgs.filter((img)=> img.thumbnailYn === "N");
   
    //=================================JSX구역===========================

    return (
        <div className="itemDetail-page">
            <div className="itemDetail-topArea">
                <button type="button" className="itemDetail-button itemDetail-subButton" onClick={()=>navigate("/item")}>
                    상품 목록
                </button>
            </div>
            <h1 className="itemDetail-title">상품 상세 페이지</h1>

            <h2 className="itemDetail-name">{item.itemName}</h2>

            {mainImg ? (
                <div className="itemDetail-mainImageArea">
                    <h3 className="itemDetail-sectionTitle">대표 이미지</h3>
                    <img  className="itemDetail-mainImage" src={`http://localhost:8080${mainImg.itemImgUrl}`} alt={mainImg.itemImgName} width="300"/>
                </div>
            ) : (
                <p className="itemDetail-emptyImageText">대표 이미지가 없습니다.</p>
            )}

            {subImgs.length>0 &&(
                <div className="itemDetail-subImageArea">
                    <h3 className="itemDetail-sectionTitle">서브 이미지</h3>

                    {subImgs.map((img)=>(
                        <img key={img.itemImgId} className="itemDetail-subImage" src={`http://localhost:8080${img.itemImgUrl}`}alt={img.itemImgName} width="150" style={{marginRight: "10px", marginBottom:"10px",}}/>
                    ))}
                </div>
            )}
            <hr className="itemDetail-divider"/>
            
            <div className="itemDetail-info">
            <p className="itemDetail-text">카테고리: {item.itemCategory}</p>
            <p className="itemDetail-text">상품 설명: {item.itemDetail}</p>
            <p className="itemDetail-text">상품 색상: {item.itemColor}</p>
            <p className="itemDetail-text">상품 가격: {formatPrice(item.itemPrice)}원</p>
            <p className="itemDetail-text">상품 할인가격: {formatPrice(item.itemDiscountPrice)}원</p>
            <p className="itemDetail-text itemDetail-price">상품 최종가격: {formatPrice(item.itemFinalPrice)}원</p>
            <p className="itemDetail-text">상품 판매상태:{" "} 
                <span  className="itemDetail-status">
                {getSellStatusInfo(item).text}
                </span>
            </p>
            <p>상품 재고: {item.itemStock}</p>
            </div>
            {!getSellStatusInfo(item).buyable &&(
                <p className="itemDetail-warning">{getSellStatusInfo(item).message}</p>
            )}

            {/*관리자는 상품 상세에서 직접 수정/삭제하지 않고, 관리자 상품/리뷰 관리 페이지로 이동 */}
            {isAdmin &&(
                <div className="itemDetail-adminArea">
                    <button type="button" className="itemDetail-button" onClick={()=>navigate("/admin/item")}>
                        관리자 상품/리뷰 관리로 이동
                    </button>
                </div>
            )}

            {/*관리자 모드일 때는 장바구니 구매하기 안보이게 */}
            {!isAdmin && (
            <div className="itemDetail-buttonArea">

                <button type="button"  className="itemDetail-button" onClick={handleAddCart} disabled={!getSellStatusInfo(item).buyable}>
                    장바구니 담기</button>

                <button type="button" className="itemDetail-button itemDetail-subButton" onClick={handleBuyNow} disabled={!getSellStatusInfo(item).buyable}>
                    구매하기</button>
            </div>
            )}
            <div className="itemDetail-reviewWrap">
            <Review itemId={itemId} isAdmin={isAdmin}/>
            </div>
        </div>
    );
};

export default ItemDetail;