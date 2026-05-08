import React, { useState, useEffect } from 'react';

const ItemProduct = ({ initialData = {}, onSubmit, buttonText }) => {

    const [form, setForm] = useState({
        itemName: '',
        itemDetail: '',
        price: 0,
        discountRate: 0,
        discountPrice: 0,
        color1: '',
        color2: '',
        color3: '',
        category: '',
        ...initialData
    });

    const [previews, setPreviews] = useState([]);
    const [images, setImages] = useState([]);
    

    // 수정일 때 초기 데이터 세팅
    useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
        setForm(prev => ({ ...prev, ...initialData }));
    }
}, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        let nextForm = { ...form, [name]: value };

        if (name === "price" || name === "discountRate") {
            const price = name === "price" ? Number(value) : Number(form.price);
            const rate = name === "discountRate" ? Number(value) : Number(form.discountRate);

            nextForm.discountPrice =
                rate > 0 ? Math.floor(price * (1 - rate / 100)) : price;
        }

        setForm(nextForm);
    };

    const onFileChange = (e) => {
        const files = Array.from(e.target.files);
         setImages(files);
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviews(urls);
    };

    // 메인 사진 설정 함수 (클릭한 인덱스의 사진을 0번 인덱스로 이동)
const setMainImage = (index) => {
    if (index === 0) return; // 이미 메인이면 무시

    // 1. 이미지 파일 배열 순서 교체
    setImages((prev) => {
        const newImages = [...prev];
        const [selected] = newImages.splice(index, 1);
        newImages.unshift(selected);
        return newImages;
    });

    // 2. 미리보기 URL 배열 순서 교체
    setPreviews((prev) => {
        const newPreviews = [...prev];
        const [selected] = newPreviews.splice(index, 1);
        newPreviews.unshift(selected);
        return newPreviews;
    });
};


    const removeImage = (indexToRemove) => {
        setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
        setPreviews((prevPreviews) => {
            URL.revokeObjectURL(prevPreviews[indexToRemove]);
            return prevPreviews.filter((_, index) => index !== indexToRemove);
        });
    };


    const submitHandler = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            images});
    };

    return (
        <form onSubmit={submitHandler}>


            <div>상품등록 페이지</div>

            <div>
                <label>상품명: </label>
                <input name="itemName" value={form.itemName} onChange={handleChange} />
            </div>

            <div>
                <label>상품설명: </label>
                <input name="itemDetail" value={form.itemDetail} onChange={handleChange} />
            </div>

            {/* 가격 */}
            <div>
                <div>
                    <label>정가: </label>
                    <input name="price" type="number" value={form.price} onChange={handleChange} />
                </div>

                <div>
                    <label>할인율: </label>
                    <input name="discountRate" type="number" value={form.discountRate} onChange={handleChange} />
                </div>

                <div>
                    최종가: <b>{form.discountPrice?.toLocaleString()}</b>
                </div>
            </div>

            {/* 색상 */}
            <div>
                <input name="color1" value={form.color1} onChange={handleChange} placeholder="색상1" />
                <input name="color2" value={form.color2} onChange={handleChange} placeholder="색상2" />
                <input name="color3" value={form.color3} onChange={handleChange} placeholder="색상3" />
            </div>

            {/* 카테고리 */}
            <select name="category" value={form.category} onChange={handleChange}>
                <option value="">선택</option>
                <option value="거실">거실</option>
                <option value="침실">침실</option>
                <option value="욕실">욕실</option>
                <option value="주방">주방</option>
            </select><br/>

            {/* 이미지 */}
            <input type="file" multiple onChange={onFileChange} />

            <div style={{ display: "flex", gap: "10px" }}>
    {previews.map((url, i) => (
        <div key={i} style={{ position: "relative" }}>

            {/* 이미지 클릭 → 메인 변경 */}
            <img
                src={url}
                width="80"
                height="80"
                onClick={() => setMainImage(i)}   
                style={{
                   border: i === 0 ? "3px solid #2ecc71" : "1px solid #ccc", cursor: "pointer"
                }}
            />

            {/* 삭제 버튼 */}
            <button
                type="button"
                onClick={() => removeImage(i)}   
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0
                }}
            >
                X
            </button>

        </div>
    ))}
</div>
            <button type="submit">
                {buttonText}
            </button>

        </form>
    );
};

export default ItemProduct;