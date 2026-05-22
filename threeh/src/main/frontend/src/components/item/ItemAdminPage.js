import React,{useEffect,useState} from 'react';
import axios from "axios";
import{useNavigate} from "react-router-dom";

const ItemAdminPage = () => {

    const navigate = useNavigate();

    const[items, setItems] =useState([]);
    const[activeTab, setActiveTab] = useState("items");

    const[selectedItemId,setSelectedItemId] = useState("");
    const[reviews, setReviews] = useState([]);
    const[reviewSummary, setReviewSummary] = useState(null);

    const getLoginUser = () => {
        try{
            return JSON.parse(sessionStorage.getItem("user"));

        } catch(error){
            
            console.error("user 파싱 실패", error);
            sessionStorage.removeItem("user");
            return null;
        }
    };

    //로그인한 유저의 역할 확인하기
    //일반 유저면, 접근 안되게
    const getUserRole =(user)=>{
        if(!user)return null;

        if(typeof user.role === "string"){
            return user.role;
        }
        
        if(user.role?.key){
            return user.role.key;
        }

        return null;
    };

    const isAdminRole = (user)=>{
        const role = getUserRole(user);
        return role === "ADMIN" || role === "ROLE_ADMIN";
    };

   

    useEffect(()=>{
        const user = getLoginUser();
        
        if(!user || !isAdminRole(user)){
            alert("관리자만 접근할 수 있습니다.");
            navigate("/");
            return;
        }

        getItems();
    },[]);
    
    //상품 목록 불러오기.
    const getItems = async() =>{
            try{
                const response = await axios.get("http://localhost:8080/api/item",{
                    withCredentials: true,
                });

                setItems(response.data || []);
            }catch(error){
                console.error("상품 목록 조회 실패",error);
                alert("상품 목록을 불러오지 못했습니다.");
            }
        };

    const getItemImgs = async(itemId)=>{
        const response = await axios.get(
            `http://localhost:8080/api/itemImgs/${itemId}`,
            {
                withCredentials: true,
            }
        );

        return response.data || [];
    };

    //상품 삭제_ 관리자
    const handleAdminDeleteItem = async(itemId)=>{
        const confirmDelete = window.confirm("정말 이 상품을 삭제하시겠습니까?");

        if(!confirmDelete){
            return;
        }
        try{
            //상품이미지가 상품아이디를 FK하고 있어서, 이미지 먼저 지워야 됌.
            const itemImgs = await getItemImgs(itemId);

            for(const img of itemImgs){
                await axios.delete(
                    `http://localhost:8080/api/itemImgs/${img.itemImgId}`,
                    {
                        withCredentials: true,
                    }
                );
            }
            await axios.delete(`http://localhost:8080/api/admin/item/${itemId}`,{
                withCredentials:true,
            });

            alert("상품이 삭제되었습니다.");

            getItems();

            if(Number(selectedItemId)===Number(itemId)){
                setSelectedItemId("");
                setReviews([]);
                setReviewSummary(null);
            }
        }catch(error){
            console.error("상품 삭제 실패",error);

            if(error.response){
                console.log("상품 삭제 상태코드:",error.response.status);
                console.log("상품 삭제 응답:", error.response.data);
            }
            alert(error.response?.data || "상품 삭제 실패");
        }
    };

    //리뷰 관리_관리자
    const handleAdminSelectReviewItem = async(itemId)=>{
        if(!itemId){
            setSelectedItemId("");
            setReviews([]);
            setReviewSummary(null);
            return;
        }
        setSelectedItemId(itemId);
        setActiveTab("reviews");

        try{
            const reviewResponse = await axios.get(
                `http://localhost:8080/api/reviews/item/${itemId}`,
                {
                    withCredentials: true,
                }
            );

            const summaryResponse = await axios.get(
                `http://localhost:8080/api/reviews/summary/${itemId}`,
                {
                    withCredentials: true,
                }
            );
            setReviews(reviewResponse.data || []);
            setReviewSummary(summaryResponse.data);
        }catch(error){
            console.error("리뷰 조회 실패", error);

            if(error.response){
                console.log("리뷰 조회 상태코드:", error.response.status);
            }
        }
    }
    



    return (
        <div>
            
        </div>
    );
};

export default ItemAdminPage;