import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ItemCreate = () => {

    const navigate = useNavigate();

    //상품 정보 입력
    const[item,setItem] = useState({
        itemCategory:"카테고리 선택",
        itemName:"",
        itemDetail:"",
        itemColor:"",
        itemPrice:"",
        itemDiscountPrice:"",
        itemPriceCurrency: "KRW",
        itemSellStatus:"판매상태 선택",
        itemStock:"",
    });

    const [mainImgFile,setMainImgFile] = useState(null);
    const [subImgFiles,setSubImgFiles] = useState([]);

    //상품 입력값 변경
    const handleItemChange=(e)=>{
        const{name,value} = e.target;
        
     if(name === "itemDetail"&& value.length >255){
        alert("상품 설명은 255자 이내로 입력해주세요.");
        return;
     }   
        setItem({
            ...item,
            [name]:value,
        });
    };


    /*const addSubImgInput = () =>{
        if(subImgs.length >=10){
            alert("서브 이미지는 최대 10장까지 등록할 수 있습니다.");
            return;
        }
        setSubImgs([...subImgs,""]);
    };

    const removeSubImgInput =(index)=>{
        const newSubImgs = subImgs.filter((_,i)=> i !==index);
        setSubImgs(newSubImgs);
    }
    <input type="file" multiple/>이 여러 파일 선택들 자동 지원함.
    */

    const uploadImage = async (itemId,file,thumbnailYn,token) => {
        const formData = new FormData();

        formData.append("itemId",itemId);
        formData.append("file",file);
        formData.append("thumbnailYn",thumbnailYn);

        await axios.post(
            "http://localhost:8080/itemImgs/uploadItemImg",
            formData,
            {
                headers:{
                    Authorization:  `Bearer ${token}`,
                    "Content-Type":"multipart/form-data",
                },
            }
        );
    };


    //상품등록

    const handleItemSubmit =async(e)=>{
        e.preventDefault();
    
        if(!mainImgFile){
            alert("대표 이미지를 선택해주세요.");
            return;
        }

        if(Number(item.itemDiscountPrice || 0)>Number(item.itemPrice)){
            alert("할인 가격은 원가보다 클 수 없습니다.");
            return;
        }

        try{
            const token = localStorage.getItem("token");

            const itemPayload = {
                itemCategory: item.itemCategory,
                itemName: item.itemName,
                itemDetail: item.itemDetail,
                itemColor: item.itemColor,
                itemPrice:Number(item.itemPrice),
                itemDiscountPrice: Number(item.itemDiscountPrice || 0),
                itemPriceCurrency: item.itemPriceCurrency || "KRW",
                itemSellStatus: item.itemSellStatus,
                itemStock: Number(item.itemStock),
            };

            const itemRes = await axios.post(
                "http://localhost:8080/admin/item",
                itemPayload,
                {
                    headers:{
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const createdItemId = itemRes.data.itemId;

            await uploadImage(createdItemId, mainImgFile,"Y",token);

            for(const file of subImgFiles){
                await uploadImage(createdItemId,file,"N",token);
            }

            alert("상품 등록 완료");

            navigate("/item");
        } catch(error){
            console.error(error);

            if(error.response){
                console.log(error.response.data);
            }
            alert("상품등록 실패");
        }
    };

    return (
        <div>
            <h2>상품 등록</h2>

            <form onSubmit={handleItemSubmit}>
                {/*카테고리*/}
                <div>
                    <label>카테고리</label>
                    <select  name="itemCategory" value={item.itemCategory} onChange={handleItemChange} required>
                    <option value="거실">거실</option>    
                    <option value="욕실">욕실</option>    
                    <option value="주방">주방</option>    
                    <option value="침실">침실</option>    
                    </select>
                </div>

                {/*상품명*/}
                <div>
                    <label>상품명</label>
                    <input type='text' name="itemName" value={item.itemName} onChange={handleItemChange} required/>
                </div>
                
                {/*상품 설명*/}
                <div>
                    <label>상품 설명</label>
                    <textarea name="itemDetail" value={item.itemDetail} onChange={handleItemChange} maxLength={255}/>
                    <p>{item.itemDetail.length}/255</p>
                </div>

                {/*상품 색상*/}
                <div>
                    <label>상품 색상</label>
                    <input type='text' name="itemColor" value={item.itemColor} onChange={handleItemChange}/>
                </div>

                {/*상품 가격*/}
                <div>
                    <label>가격</label>
                    <input type='number' name="itemPrice" value={item.itemPrice} onChange={handleItemChange} required/>
                </div>
                {/*할인 가격*/}
                <div>
                    <label>할인 가격</label>
                    <input type="number" name="itemDiscountPrice" value={item.itemDiscountPrice} onChange={handleItemChange}/>
                </div>
                
                {/*상품 재고*/}
                <div>
                    <label>상품 재고</label>
                    <input type="number" name="itemStock" value={item.itemStock} onChange={handleItemChange} required/>
                </div>
                {/*판매상태 */}
                <div>
                    <label>판매 상태</label>
                    <select name="itemSellStatus" value={item.itemSellStatus} onChange={handleItemChange} required>

                        <option value="SELL">SELL</option>
                        <option value="READY">READY</option>
                        <option value="NON_SELL">NON_SELL</option>
                    </select>
                </div>

                {/*통화*/}
                <div>
                    <label>통화</label>
                    <input type="text" name="itemPriceCurrency" value={item.itemPriceCurrency} onChange={handleItemChange}/>
                </div>

                <hr/>
                <h3>상품 이미지</h3>

                {/*대표 이미지 */}

                <div>
                <label>대표 이미지</label>
                <input type="file" accept="image/*" onChange={(e) => setMainImgFile(e.target.files[0])} required/>
                </div>
                
                {/*서브 이미지*/}

                <div>
                    <label>서브 이미지</label>
                    <input type="file" accept="image/*" multiple onChange={(e)=>{
                        const files = Array.from(e.target.files);

                        if(files.length>10){
                            alert("서브 이미지는 최대 10장까지 등록할 수 있습니다.");
                        e.target.value ="";
                        return;
                        }

                        setSubImgFiles(files);
                    }}
                    />
                    <p>{subImgFiles.length}/10</p>
                </div>

                <button type="submit">
                    상품 등록
                </button>
            </form>
        </div>
    );
};

export default ItemCreate;