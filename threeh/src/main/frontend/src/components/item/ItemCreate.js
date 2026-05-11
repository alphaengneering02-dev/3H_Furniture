import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ItemCreate = () => {

    const navigate = useNavigate();

    //상품상태

    const[item,setItem] = useState({
        itemCategory:"",
        itemName:"",
        itemDetail:"",
        itemColor:"",
        itemPrice:"",
        itemDiscountPrice:"",
        itemPriceCurrency: "KRW",
        itemStock:"",
    });

    //이미지 상태
    const[img,setImg] = useState({
        itemImgName:"",
        itemImgUrl:"",
        itemSubImgUrl:"",
        thumbnailYn:"Y",
    });

    //상품 입력값 변경
    const handleItemChange=(e)=>{
        const{name,value} = e.target;
        
        setItem({
            ...item,
            [name]:value,
        });
    };

    //이미지 입력값 변경

    const handleImgChange=(e)=>{
        const{name,value}=e.target;

        setImg({
            ...img,
            [name]:value,
        });
    };

    //상품등록

    const handleItemSubmit =async(e)=>{
        e.preventDefault();
    

    //할인 가격 검증
    if(
        Number(item.itemDiscountPrice||0)>
        Number(item.itemPrice)
    ){
        alert("할인 가격은 원가보다 클 수 없습니다.");
        return;
    }

    try{
        const token = localStorage.getItem("token");

    //상품 데이터
        const itemPayload = {
            itemCategory: item.itemCategory,
            itemName: item.itemName,
            itemDetail: item.itemDetail,
            itemColor: item.itemColor,
            itemPrice: item.itemPrice,
            itemDiscountPrice:Number(item.itemDiscountPrice||0),
            itemPriceCurrency: item.itemPriceCurrency||"KRW",
            itemStock: Number(item.itemStock),
        };

    //상품 등록

    const itemRes = await axios.post(
       "http://localhost:8080/admin/item",
        itemPayload,
        {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        }
    );

    //생성된 상품 ID
    const createdItemId = itemRes.data.itemId;

    //이미지 데이터

    const imgPayload = {
        itemId: createdItemId,
        itemImgName: img.itemImgName,
        itemImgUrl: img.itemImgUrl,
        itemSubImgUrl: img.itemSubImgUrl,
        thumbnailYn: img.thumbnailYn,
    };

    //이미지 등록

    await axios.post(
        "http//localhost:8080/itemImgs/createItemImg",
        imgPayload,
        {
            headers:{
                Authorization:`Bearer ${token}`,
            },
        }
    );

    alert("상품 등록 완료");

    navigate("/item");
    }catch(error){
        console.error(error);

        if(error.response){
            console.log(error.response.data);
        }

        alert("상품등록 실패");
    }

}

    return (
        <div>
            <h2>상품 등록</h2>

            <form onSubmit={handleItemSubmit}>
                {/*카테고리*/}
                <div>
                    <label>카테고리</label>
                    <input type='text' name="itemCategory" value={item.itemCategory} onChange={handleItemChange} required/>
                </div>

                {/*상품명*/}
                <div>
                    <label>상품명</label>
                    <input type='text' name="itemName" value={item.itemName} onChange={handleItemChange} required/>
                </div>
                
                {/*상품 설명*/}
                <div>
                    <label>상품 설명</label>
                    <textarea name="itemDetail" value={item.itemDetail} onChange={handleItemChange}/>
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

                {/*통화*/}
                <div>
                    <label>통화</label>
                    <input type="text" name="itemPriceCurrency" value={item.itemPriceCurrency} onChange={handleItemChange}/>
                </div>

                <hr/>
                <h3>상품 이미지</h3>

                {/*이미지 이름*/}
                <div>
                    <label>이미지 이름</label>
                    <input type="text" name="itemImgName" value={img.itemImgName} onChange={handleImgChange} required/>
                </div>

                {/*대표 이미지 URL*/}
                <div>
                    <label>대표 이미지 URL</label>
                    <input type="text" name="itemImgUrl" value={img.itemImgUrl} onChange={handleImgChange} required/>
                </div>

                {/*서브 이미지 URL*/}
                <div>
                    <label>서브 이미지 URL</label>
                    <input type="text" name="itemSubImgUrl" value={img.itemSubImgUrl} onChange={handleImgChange}/>
                </div>

                {/*대표 이미지 여부*/}
                <div>
                    <label>대표 이미지 여부</label>

                    <select name="thumbnailYn" value={img.thumbnailYn}
                    onChange={handleImgChange}>
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                    </select>
                </div>

                <button type="submit">
                    상품 등록
                </button>
            </form>
        </div>
    );
};

export default ItemCreate;