import React from 'react';
import ItemProduct from './ItemProduct';

import axios from 'axios';

const AddProduct = () => {

    const handleAdd = async (data) => {
    try {
        const res = await axios.post(
            "http://localhost:8080/admin/products",
            data,
            {
                withCredentials: true
            }
        );

        console.log("등록 성공:", res.data);

    } catch (error) {
        console.error("등록 실패:", error);
    }
};



    return (
        <div>
        <ItemProduct
            onSubmit={handleAdd}
            buttonText="상품 등록"
        />
        <button>등록 취소</button>
        </div>
    );
};

export default AddProduct;