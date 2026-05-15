import React from "react";
import {useEffect,useState} from "react";
import {useNavigate,Link} from "react-router-dom";
import axios from "axios";


function Item(){
    const navigate = useNavigate();
    
    const [items, setItems] = useState([]);
    const[adminMode, setAdminMode] = useState(false);

    const getLoginUser = () => {

       return JSON.parse(sessionStorage.getItem("user"));
    };

    //admin인지 확인
    const isAdminRole = (user)=>{
        return(
            user &&
            (
                user.role ==="ADMIN"||
                user.role ==="ROLE_ADMIN"||
                user.role?.key === "ADMIN"||
                user.role?.key === "ROLE_ADMIN"
            )
        );
    };

    const isUserRole = (user)=>{
        return(
            user && (
                user.role === "USER"||
                user.role === "ROLE_USER"||
                user.role?.key === "USER"||
                user.role?.key === "ROLE_USER"
            )
        );
    };

    //일반 유저가 상품을 선택했을 때, 선택한 상품의 총 가격이랑, 상품 재고와 판매상태에 따른 선택 가능여부
    const getFinalPrice = (item) => {
        if(item.itemFinalPrice !==null && item.itemFinalPrice !==undefined){
            return Number(item.itemFinalPrice);
        }
        return Number(item.itemPrice || 0 ) - Number(item.itemDiscountPrice || 0);
    };

    const canSelectItem =(item) => {
        if(item.itemStock<=0){
            alert("품절된 상품입니다.")
            return false;
        }

        if(
            item.itemSellStatus && item.itemSellStatus !=="SELL"
        ){
            alert("판매중인 상품만 선택이 가능합니다.")
            return false;
        }
        return true
    };

    
    useEffect(()=>{
        getItems();
    },[]);

    const getItems =async()=>{
        try{
            const response = await axios.get("api/item",{
                withCredentials:true,
            });
            console.log("상품 목록:",response.data);
            setItems(response.data);
        }catch(error){
            console.log("상품 목록 조회 실패", error);
            alert("상품 목록을 불러오지 못했습니다.");
        }
    };


    //선택된 상품
    //const isSelected = (itemId) => {
        //return selectedItems.some((selected)=> selected.itemId === itemId);
    //};


    
    //어드민 계정으로 로그인해서 상품목록에 접근했을 때
    const handleCreateClick = () => {
        navigate("/item/create");
    };

    const handleAdminCreateClick = ()=>{
        navigate("/item/create");
    }

    const handleAdminListClick = () =>{
        setAdminMode(true);
    };

    const handleNormalListClick = () => {
        setAdminMode(false);
    };

    const handleUpdateClick = (itemId) => {
        navigate(`/item/update/${itemId}`);
    };

    const handleDeleteClick = async(itemId)=>{
        const confirmDelete = window.confirm("정말 이 상품을 삭제하시겠습니까?");

        if(!confirmDelete){
            return;
        }

        try{

            //이미지를 먼저 지워야 상품을 지우니까(fk)
            const imgRes = await axios.get(
                `http://localhost:8080/api/itemImgs/${itemId}`,
                {
                    withCredentials: true,
                }
            );

            const itemImgs =imgRes.data;

            for(const img of itemImgs){
                await axios.delete(
                    `http://localhost:8080/api/itemImgs/${img.itemId}`,
                    {
                        withCredentials:true,
                    }
                );
            }

            await axios.delete(`/api/admin/item/${itemId}`,{
                withCredentials: true,
            });

            alert("상품이 삭제 되었습니다.");

            setItems(items.filter((item)=> item.itemId !== itemId));
            
        }catch(error){
            console.error("상품 삭제 실패", error)

            if(error.response){
                console.log(error.response.data);
            }

            alert("상품 삭제 실패");
        }
    };

    //비로그인이면 로그인을 하도록하고, 일반 유저면 장바구니/구매 가능하고, 관리자는 장바구니/구매 불가
    const handleAddCart  = async (itemId) => {
        
        const loginUser = getLoginUser();

        console.log("로그인 유저:", loginUser);

        if(!loginUser){
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        if(!isUserRole(loginUser)){
            alert("일반 회원만 장바구니를 이용할 수 있습니다.");
            return;
        }

        try{
            const formdata = new FormData();
            formdata.append("itemId",itemId);
            formdata.append("count",1);

            await axios.post(
                "/api/cartItem/add", formdata,
                {
                    withCredentials: true,
                }
            );

            alert("장바구니에 담겼습니다.");
        }catch(error){
            console.error("장바구니 담기 실패",error);

            if(error.response){
                console.log("상태코드:", error.response.status);
                console.log("응답메시지:", error.response.data);
            }
            
            if(error.response?.status === 401){
                alert("로그인이 필요합니다.");
                navigate("/login");
                return;
            }

            alert("장바구니 담기 실패");
        }
    };

    const handleBuyNow = (itemId) => {

        const loginUser = getLoginUser();

        if(!loginUser){
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        if(!isUserRole(loginUser)){
            alert("일반 회원만 구매할 수 있습니다.");
            return;
        }

        navigate(`/order/${itemId}`);
    };

    const user = getLoginUser();
    const isAdmin = isAdminRole(user);

    return (
            <div>
            <h1>상품 목록</h1>

            {isAdmin && (
                <div style={{marginBottom:"20px"}}>
                    <button type="button" onClick={handleAdminCreateClick}>
                        상품 등록하기
                    </button>
                    <button type="button" onClick={handleAdminListClick} style={{marginLeft:"10px"}}>
                        상품수정 및 삭제하기
                    </button>
                {adminMode && (
                    <button type="button" onClick={handleNormalListClick} style={{marginLeft:"10px"}}>
                        일반상품 목록 보기
                    </button>
                )}
                </div>
            )}

            {adminMode && isAdmin ? (
                <div>
                    <h2>관리자 상품 관리</h2>

                    {items.length === 0 ?(
                        <p>등록된 상품이 없습니다.</p>
                    ):(
                        <table border="1" cellPadding="10" style={{borderCollapse:"collapse"}}>
                            <thead>
                                <tr>
                                    <th>itemId</th>
                                    <th>제품 카테고리</th>
                                    <th>제품명</th>
                                    <th>가격</th>
                                    <th>재고</th>
                                    <th>판매상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>

                        <tbody>
                            {items.map((item)=>(
                                <tr key={item.itemId}>
                                    <td>{item.itemId}</td>
                                    <td>{item.itemCategory}</td>
                                    <td>{item.itemName}</td>
                                    <td>{item.itemPrice}</td>
                                    <td>{item.itemStock}</td>
                                    <td>{item.itemSellStatus}</td>
                                    <td>
                                        <button type="button" onClick={()=>handleUpdateClick(item.itemId)}>
                                         수정
                                        </button>
                                        <button type="button" onClick={()=>handleDeleteClick(item.itemId)}
                                            style={{marginLeft:"10px"}}>
                                         삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    )}
                </div>
            ):(
                <div>
                    {items.length ===0 ?(
                        <p>상품이 없습니다.</p>
                    ):(
                        items.map((item)=>(
                            <div key={item.itemId} style={{marginBottom:"30px"}}>

                                {item.itemImgUrl ? (
                                    <img src={`http://localhost:8080${item.itemImgUrl}`} alt={item.itemName} width="200"/>
                                ):(
                                    <p>이미지 없음</p>
                                )}

                                <Link to={`/item/${item.itemId}`}>
                                    <h2>{item.itemName}</h2>
                                </Link>

                                <p>카테고리: {item.itemCategory}</p>
                                <p>상품 설명: {item.itemDetail}</p>
                                <p>상품 색상: {item.itemColor}</p>
                                <p>상품 가격: {item.itemPrice}</p>
                                <p>상품 할인가격: {item.itemDiscountPrice}</p>
                                <p>상품 최종가격: {item.itemFinalPrice}</p>
                                <p>상품 재고: {item.itemStock}</p>
                            
                            {!isAdmin &&(
                                <div>
                                    <button type="button" onClick={()=>handleAddCart(item.itemId)}>
                                        장바구니 담기
                                    </button>

                                    <button type="button" onClick={()=>handleBuyNow(item.itemId)} style={{marginLeft:"10px"}}>
                                        구매하기
                                    </button>
                                </div>
                            )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Item;