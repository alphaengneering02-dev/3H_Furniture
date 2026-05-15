import React, { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

//상품 등록
const ItemCreate = () => {

    const navigate = useNavigate();

    useEffect(()=>{
        //세션 유지용
        const user = JSON.parse(sessionStorage.getItem("user"));
        
        //어드민만 해당 페이지에 접근 가능하도록.
        const isAdmin =
            user && (
                user.role === "ADMIN"||
                user.role === "ROLE_ADMIN"||
                user.role?.key === "ADMIN"||
                user.role?.key === "ROLE_ADMIN"
            );

        //로그인이 안되었을 때
        if(!user){
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        //로그인한 계정이 관리자 계정이 아닌 일반 유저일 때.

        if(!isAdmin){
            alert("관리자 계정만 접근이 가능한 페이지입니다.");
            navigate("/");
            return;
        }
    },[navigate]);


    //상품 정보 입력(Item table)
    const[item,setItem] = useState({
        itemCategory:"",
        itemName:"",
        itemDetail:"",
        itemColor:"",
        itemPrice:"",
        itemDiscountPrice:"",
        itemPriceCurrency: "KRW",
        itemSellStatus:"",
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

    const uploadImage = async (itemId,file,thumbnailYn) => {
        const formData = new FormData();

        formData.append("itemId",itemId);
        formData.append("file",file);
        formData.append("thumbnailYn",thumbnailYn);

        await axios.post(
            "http://localhost:8080/api/itemImgs/uploadItemImg",
            formData,
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    };


    //상품등록

    const handleItemSubmit =async(e)=>{
        e.preventDefault();

        //제출 전에 로그인 여부 확인
        const user = JSON.parse(sessionStorage.getItem("user"));

        const isAdmin =
            user &&
            (
                user.role === "ADMIN"||
                user.role === "ROLE_ADMIN"||
                user.role?.key === "ADMIN" ||
                user.role?.key === "ROLE_ADMIN"
            );

        if(!user){
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        if(!isAdmin){
            alert("관리자만 상품을 등록할 수 있습니다.");
            navigate("/");
            return;
        }

        console.log("로그인한 사용자:",user);
    
        if(!mainImgFile){
            alert("대표 이미지를 선택해주세요.");
            return;
        }

        if(Number(item.itemDiscountPrice || 0)>Number(item.itemPrice)){
            alert("할인 가격은 원가보다 클 수 없습니다.");
            return;
        }

        try{
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
                "http://localhost:8080/api/admin/item",
                itemPayload,
                { 
                       withCredentials:true,
                }
            );

            const createdItemId = itemRes.data.itemId;

            await uploadImage(createdItemId, mainImgFile,"Y");

            for(const file of subImgFiles){
                await uploadImage(createdItemId,file,"N");
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
                    <option value="">카테고리 선택</option>
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
                    <textarea name="itemDetail" value={item.itemDetail} onChange={handleItemChange} maxLength={255}
                    rows={5}
                    style={{resize:"none",width:"400px",height:"120px",}}/>
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
                        <option value="">판매상태 선택</option>
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

                <h3>===상품 이미지===</h3>

                {/*대표 이미지 */}

                <div>
                <label>대표 이미지</label>
                <input type="file" accept="image/*" onChange={(e) => setMainImgFile(e.target.files[0])} required/>
                </div>
                
                {/*서브 이미지*/}

                <div>
                    <label>서브 이미지</label>
                    <input type="file" accept="image/*" multiple onChange={(e)=>{
                        const selectedSubFiles = Array.from(e.target.files);

                        const totalFiles = subImgFiles.length + selectedSubFiles.length;

                        if(totalFiles>10){
                            alert("서브 이미지는 최대 10장까지 등록할 수 있습니다.");
                        e.target.value ="";
                        return;
                        }

                        setSubImgFiles([...subImgFiles, ...selectedSubFiles]);
                        e.target.value ="";
                    }}
                    />
                    <p>{subImgFiles.length}/10</p>
                    
                    <ul>
                        {subImgFiles.map((file,index)=>(
                            <li key={index}>{file.name}
                            <button type='button' onClick={()=> {
                                const newFiles =subImgFiles.filter((_,i)=> i !== index);
                                setSubImgFiles(newFiles);
                            }}> 
                            삭제 
                            </button></li>
                        ))}
                    </ul>
                </div>

                <button type="submit">
                    상품 등록
                </button>
            </form>
        </div>
    );
};

export default ItemCreate;