import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../css/itemPageCss/itemUpdate.css";

const ItemUpdate = () => {

    const{itemId} = useParams();
    const navigate = useNavigate();

    //세션유지용(어드민 구현 전)
     const user = JSON.parse(sessionStorage.getItem("user"));

    const[item, setItem] = useState({
        itemCategory: "",
        itemName: "",
        itemDetail: "",
        itemColor: "",
        itemPrice: "",
        itemDiscountPrice: "",
        itemPriceCurrency: "",
        itemSellStatus: "",
        itemStock: "",

    });

    const [itemImgs, setItemImgs] = useState([]);
    const [deleteImgIds, setDeleteImgIds] = useState([]);

    const [newMainImgFile, setNewMainImgFile] = useState(null);
    const[newSubImgFiles,setNewSubImgFiles] = useState([]);

    useEffect(()=>{
        getItem();
        getItemImgs();
    },[itemId]);

    //수정할 아이템 가져오기
    const getItem = async()=>{
        try{
            const res = await axios.get(`http://localhost:8080/api/item/${itemId}`,
            {withCredentials:true,});

            setItem({
                itemCategory: res.data.itemCategory || "",
                itemName: res.data.itemName || "",
                itemDetail: res.data.itemDetail || "",
                itemColor: res.data.itemColor || "",
                itemPrice: res.data.itemPrice || "",
                itemDiscountPrice: res.data.itemDiscountPrice || "",
                itemPriceCurrency : res.data.itemPriceCurrency || "KRW",
                itemSellStatus: res.data.itemSellStatus || "SELL",
                itemStock: res.data.itemStock || "",
            });
        } catch (error){
            console.error(error);
            alert("상품 정보를 불러오지 못했습니다.");
        }
    };
    
    const getItemImgs =async() =>{
        try{
            const res = await axios.get(
                `http://localhost:8080/api/itemImgs/${itemId}`,{withCredentials:true,});

            setItemImgs(res.data);
        }catch(error){
            console.error(error);
            alert("상품 이미지를 불러오지 못했습니다.");
        }
    };

    //상품설명 수정
    const handleItemChange = (e) => {
        const {name, value} = e.target;

        if(name === "itemDetail" && value.length > 255){
            alert("상품 설명은 255자 이내로 입력해주세요.");
            return;
        }

        setItem({
            ...item,
            [name]: value,
        });
    };

    //상품삭제

        const toggleDeleteImg = (itemImgId) => {
        if(deleteImgIds.includes(itemImgId)){
            setDeleteImgIds(
                deleteImgIds.filter((id)=> id !== itemImgId)
            );
        }else{
            setDeleteImgIds([
                ...deleteImgIds,itemImgId
            ]);
        }
    };

    //상품이미지 변경
    const uploadImage = async (itemId, file, thumbnailYn) => {
        const formData = new FormData();

        formData.append("itemId",itemId);
        formData.append("file",file);
        formData.append("thumbnailYn", thumbnailYn);
        
        await axios.post(
            "http://localhost:8080/api/itemImgs/uploadItemImg",
            formData,
            {
                withCredentials: true,
                headers:{
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    };

    //상품 변경사항 저장
    const handleUpdateSubmit  = async (e) => {
        e.preventDefault();

        const user = JSON.parse(sessionStorage.getItem("user"));

        if(!user){
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        if(Number(item.itemDiscountPrice || 0) > Number(item.itemPrice)) {
            alert("할인 가격은 원가보다 클 수 없습니다.");
            return;
        }

        try{

            const itemPayload = {
                itemCategory: item.itemCategory,
                itemName: item.itemName,
                itemDetail: item.itemDetail,
                itemColor: item.itemColor,
                itemPrice: Number(item.itemPrice),
                itemDiscountPrice: Number(item.itemDiscountPrice || 0),
                itemPriceCurrency:item.itemPriceCurrency||"KRW",
                itemSellStatus:item.itemSellStatus,
                itemStock: Number(item.itemStock),
                
            };

            console.log("상품수정 payload:",itemPayload);

            await axios.put(
                `http://localhost:8080/api/admin/item/${itemId}`,
                itemPayload,
                {
                      withCredentials:true,
                }
            );

            for(const itemImgId of deleteImgIds) {
                await axios.delete(`http://localhost:8080/api/itemImgs/${itemImgId}`, {withCredentials:true,});
            }
 
            if(newMainImgFile){
                const oldMainImgs = itemImgs.filter(
                (img) => img.thumbnailYn === "Y"
                );
            
                for(const img of oldMainImgs) {

                    await axios.delete(`http://localhost:8080/api/itemImgs/${img.itemImgId}`, {withCredentials:true,});
                }
                await uploadImage(itemId,newMainImgFile,"Y");
            }

            for(const file of newSubImgFiles){
                await uploadImage(itemId,file,"N");
            }

            alert("상품 수정 완료");
            navigate("/admin/item");
            
        }catch(error){
            console.error(error);
        
            if(error.response){
                console.log("상품 수정 실패 상태코드:",error.response.status);
                console.log("상품 수정 실패 응답:, error.response.data");
                console.log(error.response.data);
            }

            if(error.response?.status===401||error.response?.status===403){
                alert("관리자 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                sessionStorage.removeItem("user");
                navigate("/login");
                return;
            }

            alert("상품 수정 실패");
        }
    };

    return (
        <div className="itemUpdate-page">
            <h2 className="itemUpdate-title">상품 수정</h2>

            <form className="itemUpdate-form" onSubmit={handleUpdateSubmit}>
                <div className="itemUpdate-formRow">
                    <label className="itemUpdate-label">카테고리</label>
                    <select 
                        className="itemUpdate-select"
                        name="itemCategory"
                        value={item.itemCategory}
                        onChange={handleItemChange}
                        required>

                    <option value="">카테고리 선택</option>
                    <option value="거실">거실</option>
                    <option value="욕실">욕실</option>
                    <option value="주방">주방</option>
                    <option value="침실">침실</option>
                    </select>
                </div>

                <div className="itemUpdate-formRow">
                    <label className="itemUpdate-label">상품명</label>
                    <input 
                    className="itemUpdate-input"
                    type="text"
                    name="itemName"
                    value={item.itemName}
                    onChange={handleItemChange}
                    required/>
                </div>
                
                <div className="itemUpdate-formRow">
                    
                    <label className="itemUpdate-label">상품 설명</label>
                    <textarea 
                    className="itemUpdate-textarea"
                    name="itemDetail"
                    value={item.itemDetail}
                    onChange={handleItemChange}
                    maxLength={255}
                    rows={5}
                    style={{resize:"none", width:"400px",height:"120px",}}/>
                
                <p className="itemUpdate-count">{item.itemDetail.length}/255</p>
                </div>

                <div className="itemUpdate-formRow">
                    <label className="itemUpdate-label">상품 색상</label>
                    <input className="itemUpdate-input" type="text" name="itemColor" value={item.itemColor} onChange={handleItemChange}/>
                </div>

                <div className="itemUpdate-formRow">
                    <label className="itemUpdate-label">가격</label>
                    <input className="itemUpdate-input" type="number" name="itemPrice" value={item.itemPrice} onChange={handleItemChange} required/>
                </div>

                <div className="itemUpdate-formRow">
                    <label className="itemUpdate-label">할인 가격</label>
                    <input className="itemUpdate-input" type="number" name="itemDiscountPrice" value={item.itemDiscountPrice} onChange={handleItemChange}/>
                </div>

                <div className="itemUpdate-formRow">
                    <label className="itemUpdate-label">상품 재고</label>
                    <input className="itemUpdate-input" type="number" name="itemStock" value={item.itemStock} onChange={handleItemChange} required/>
                </div>
                <div className="itemUpdate-formRow">
                    <label className="itemUpdate-label">판매상태</label>
                    <select className="itemUpdate-select" name="itemSellStatus" value={item.itemSellStatus}
                    onChange={handleItemChange} required>
                        <option value="">판매 상태 선택</option>
                        <option value="SELL">SELL</option>
                        <option value="SOLD_OUT">SOLD_OUT</option>
                        <option value="STOP">STOP</option>
                        <option value="COMING_SOON">COMING_SOON</option>

                    </select>
                </div>

                <div className="itemUpdate-formRow">
                    <label className="itemUpdate-label">통화</label>
                    <input className="itemUpdate-input" type="text" name="itemPriceCurrency" value={item.itemPriceCurrency} onChange={handleItemChange}/>
                </div>
                <hr className="itemUpdate-divider"/>

                <h3 className="itemUpdate-sectionTitle">기존 이미지</h3>
                
                {itemImgs.map((img) => (
                    <div className="itemUpdate-imageList" key={img.itemImgId}>
                        <img className="itemUpdate-image" src={`http://localhost:8080${img.itemImgUrl}`}
                            alt={img.itemImgName} width="120"/>
                        <span className="itemUpdate-imageBadge">
                            {img.thumbnailYn === "Y" ? "대표 이미지" : "서브 이미지"}
                        </span>

                        <label className="itemUpdate-checkLabel">
                            <input className="itemUpdate-checkbox" type="checkbox" checked={deleteImgIds.includes(img.itemImgId)} onChange={()=>toggleDeleteImg(img.itemImgId)}/>
                            삭제
                        </label>
                    </div>
                ))}

            <hr className="itemUpdate-divider"/>

            <h3 className="itemUpdate-sectionTitle">새 이미지 추가</h3>

            <div className="itemUpdate-formRow">
                <label className="itemUpdate-label">새 대표 이미지</label>
                <input className="itemUpdate-fileInput" type="file" accept="image/*" onChange={(e)=>setNewMainImgFile(e.target.files[0])}/>
            </div>

                <div className="itemUpdate-formRow">
                <label className="itemUpdate-label">새 서브 이미지</label>
                <input className="itemUpdate-fileInput" type="file" accept="image/*" multiple onChange={(e)=> {
                    const selectedFiles = Array.from(e.target.files);

                    const currentSubImgCount = itemImgs.filter(
                        (img) => img.thumbnailYn === "N"&&!deleteImgIds.includes(img.itemImgId)
                    ).length;

                    const totalSubImgCount = currentSubImgCount + newSubImgFiles.length + selectedFiles.length;

                    if(totalSubImgCount >10){
                        alert("서브 이미지는 최대 10장까지 등록할 수 있습니다.");
                        return;
                    }

                    setNewSubImgFiles([...newSubImgFiles,...selectedFiles]);
                    e.target.value = "";
                }}/>

                <p className="itemUpdate-fileCount">새 서브 이미지 {newSubImgFiles.length}장 선택</p>
                <ul>
                    {newSubImgFiles.map((file,index)=>(
                        <li className="itemUpdate-fileItem" key={index}>
                            <span className="itemUpdate-fileName">
                            {file.name}
                            </span>
                            <button className="itemUpdate-dangerButton" type="button" onClick={()=>{
                                setNewSubImgFiles(newSubImgFiles.filter((_,i)=>i !==index));
                            }}>
                            삭제
                            </button>
                        </li>
                        ))}
                    </ul>
                </div>
                <div className="itemUpdate-buttonArea">
                <button className="itemUpdate-button" type="submit">수정 완료</button>
                </div>
            </form>
        </div>
    );
};

export default ItemUpdate;