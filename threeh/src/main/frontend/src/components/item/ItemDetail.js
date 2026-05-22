import React, { useEffect, useState } from 'react';
import axios from 'axios';
import{useNavigate,useParams}from "react-router-dom";
import Review from './Review';

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

    const handleUpdateClick = () =>{
        navigate(`/item/update/${itemId}`);
    };



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
            <p>상품 가격: {formatPrice(item.itemPrice)}원</p>
            <p>상품 할인가격: {formatPrice(item.itemDiscountPrice)}원</p>
            <p>상품 최종가격: {formatPrice(item.itemFinalPrice)}원</p>
            <p>상품 판매상태: {item.itemSellStatus}</p>
            <p>상품 재고: {item.itemStock}</p>

            {isAdmin &&(
                <div style={{marginTop:"20px"}}>
                    <button type="button" onClick={handleUpdateClick}>상품 수정</button>

                    <button type="button" onClick={handleDeleteClick} style={{marginLeft:"10px"}}>상품 삭제</button>

                </div>
            )}
            {/*관리자 모드일 때는 장바구니 구매하기 안보이게 */}
            {!isAdmin && (
            <div style={{marginTop:"20px"}}>

                <button type="button" onClick={handleAddCart}>장바구니 담기</button>

                <button type="button" onClick={handleBuyNow} style={{marginLeft:"10px"}}>구매하기</button>
            </div>
            )}

            <Review itemId={itemId} isAdmin={isAdmin}/>
        </div>
    );
};

export default ItemDetail;