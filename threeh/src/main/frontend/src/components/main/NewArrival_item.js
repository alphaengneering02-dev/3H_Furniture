import React from 'react';

const NewArrival_item = ({prod, prodImgs}) => {

    const mainImg = prodImgs.find((img)=> img.thumbnailYn === "Y");
    const subImgs = prodImgs.filter((img)=> img.thumbnailYn === "N");


    return (
        <div>
            <div>
                <img src={`http://localhost:8080${mainImg.itemImgUrl}`} alt={mainImg.itemImgName}/>    {/* 상품 이미지 */}
                <button>♡</button>
            </div>
            <p>{prod.itemName}</p>  {/* 상품명 */}
            <h4>{prod.itemPrice}</h4>    {/* 가격 */}
        </div>
    );
};

export default NewArrival_item;