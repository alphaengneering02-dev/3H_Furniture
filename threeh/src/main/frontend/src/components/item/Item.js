import React from "react";
import {useEffect,useState} from "react";
import {useNavigate,Link} from "react-router-dom";
import axios from "axios";


function Item(){

    
    const [items, setItem] = useState([]);
    const [user, setUser] = useState({});
;

    const getLoginUser = () => {

        setUser (JSON.parse(sessionStorage.getItem("user")));
        return 
    };

    useEffect(()=> {
        axios.get("api/item")
            .then((response) => {
                console.log(response.data);
                setItem(response.data);
            })
            .catch((error)=>{
                console.error("뭐 잘못했나봐..",error);
            });

            getLoginUser();
    },[]);

    const navigate = useNavigate();

    

    const handleAddCart  = async (itemId) => {
        
        console.log(user);

        if(!user){
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        try{
            const formdata = new FormData();
            formdata.append("itemId",itemId);
            formdata.append("count",1);

            await axios.post(
                "/api/cartItem/add", formdata,{
                    withCredentials: true,
                }
            );

            alert("장바구니에 담겼습니다.");
        }catch(error){
            console.error("장바구니 담기 실패",error);

            if(error.response?.status === 401){
                alert("인증되지 않은 회원입니다.");
                navigate("/login");
                return;
            }

            alert("장바구니 담기 실패");
        }
    };

    const handleBuyNow = (itemId) => {

        const user = getLoginUser();

        if(!user){
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        navigate(`/order/${itemId}`);
    };

    return (
            <div>
            <h1>상품 목록</h1>

            {items.length === 0 ? (
                <p>상품이 없습니다.</p>
            ) : (
                items.map((item) => (
                <div key={item.itemId}>
                    {item.itemImgUrl ? (
                    <img
                        src={`http://localhost:8080${item.itemImgUrl}`}
                        alt={item.itemName}
                        width="200"
                    />
                    ) : (
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

                    <button type="button" onClick={()=>handleAddCart(item.itemId)}>장바구니 담기</button>

                    <button type="button" onClick={()=>handleBuyNow(item.itemId)}style={{marginLeft:"10px"}}>구매하기</button>
                </div>
                ))
            )}
            </div>
        );
        }

export default Item;