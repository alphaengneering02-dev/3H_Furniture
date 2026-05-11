import React, { useEffect, useState } from 'react';
import ItemProduct from './ItemProduct';
import axios from 'axios';


const EditProduct = ({ itemId }) => {

    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. 기존 상품 조회
    useEffect(() => {

        const fetchProduct = async () => {

            try {

                setLoading(true);

                const res = await axios.get(
                    `http://localhost:8080/admin/products/${itemId}`,
                    {
                        withCredentials: true
                    }
                );

                setInitialData(res.data);

            } catch (error) {

                console.error("상품 조회 실패:", error);

            } finally {
                setLoading(false);
            }
        };

        if (itemId) {
            fetchProduct();
        }

    }, [itemId]);

    // 2. 수정 요청
    const handleUpdate = async (data) => {

        try {

            const formData = new FormData();

            formData.append(
                "item",
                new Blob(
                    [JSON.stringify({
                        itemId: itemId,
                        itemName: data.itemName,
                        itemDetail: data.itemDetail,
                        price: data.price,
                        discountRate: data.discountRate,
                        discountPrice: data.discountPrice,
                        color1: data.color1,
                        color2: data.color2,
                        color3: data.color3,
                        category: data.category
                    })],
                    { type: "application/json" }
                )
            );

            // 새 이미지 있을 때만 전송
            if (data.images && data.images.length > 0) {
                data.images.forEach(file => {
                    formData.append("images", file);
                });
            }

            const res = await axios.put(
                `http://localhost:8080/admin/products/${itemId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    withCredentials: true
                }
            );

            console.log("수정 성공:", res.data);

            alert("상품이 수정되었습니다.");

        } catch (error) {

            console.error("수정 실패:", error);
            alert("수정 실패");
        }
    };

    // 로딩 처리 (UX 개선)
    if (loading) {
        return (
            <div className="product-page">
                <div className="product-container">
                    <h2>로딩 중...</h2>
                </div>
            </div>
        );
    }

    return (

        <div className="product-page">

            <ItemProduct
                initialData={initialData || {}}
                onSubmit={handleUpdate}
                buttonText="상품 수정"
            />

            <div className="cancel-wrap">

                <button
                    className="cancel-btn"
                    onClick={() => window.history.back()}
                >
                    수정 취소
                </button>

            </div>

        </div>
    );
};

export default EditProduct;