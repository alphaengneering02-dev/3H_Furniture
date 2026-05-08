import React, { useState, useEffect } from 'react';
import './ProductPage.css';

const ItemProduct = ({
    initialData = {},
    onSubmit,
    buttonText
}) => {

    const [form, setForm] = useState({
        itemName: '',
        itemDetail: '',
        price: 0,
        discountRate: 0,
        discountPrice: 0,
        color1: '',
        color2: '',
        color3: '',
        category: ''
    });

    const [previews, setPreviews] = useState([]);
    const [images, setImages] = useState([]);

    // ✅ 초기 데이터 세팅 (Add / Edit 공용 핵심)
    useEffect(() => {

        if (!initialData || Object.keys(initialData).length === 0) return;

        setForm({
            itemName: initialData.itemName || '',
            itemDetail: initialData.itemDetail || '',
            price: initialData.price || 0,
            discountRate: initialData.discountRate || 0,
            discountPrice: initialData.discountPrice || 0,
            color1: initialData.color1 || '',
            color2: initialData.color2 || '',
            color3: initialData.color3 || '',
            category: initialData.category || ''
        });

        // ✅ 기존 이미지가 있을 경우 (Edit용)
        if (initialData.images) {
            setPreviews(initialData.images.map(img => img.url));
        }

    }, [initialData]);

    const handleChange = (e) => {

        const { name, value } = e.target;

        let nextForm = {
            ...form,
            [name]: value
        };

        if (name === "price" || name === "discountRate") {

            const price =
                name === "price"
                    ? Number(value)
                    : Number(form.price);

            const rate =
                name === "discountRate"
                    ? Number(value)
                    : Number(form.discountRate);

            nextForm.discountPrice =
                rate > 0
                    ? Math.floor(price * (1 - rate / 100))
                    : price;
        }

        setForm(nextForm);
    };

    const onFileChange = (e) => {

        const files = Array.from(e.target.files);

        setImages(files);

        const urls = files.map(file =>
            URL.createObjectURL(file)
        );

        setPreviews(prev => [...prev, ...urls]);
    };

    const setMainImage = (index) => {

        if (index === 0) return;

        setImages((prev) => {
            const newImages = [...prev];
            const [selected] = newImages.splice(index, 1);
            newImages.unshift(selected);
            return newImages;
        });

        setPreviews((prev) => {
            const newPreviews = [...prev];
            const [selected] = newPreviews.splice(index, 1);
            newPreviews.unshift(selected);
            return newPreviews;
        });
    };

    const removeImage = (indexToRemove) => {

        setImages((prevImages) =>
            prevImages.filter((_, index) => index !== indexToRemove)
        );

        setPreviews((prevPreviews) => {
            URL.revokeObjectURL(prevPreviews[indexToRemove]);
            return prevPreviews.filter((_, index) => index !== indexToRemove);
        });
    };

    const submitHandler = (e) => {

        e.preventDefault();

        onSubmit({
            ...form,
            images
        });
    };

    return (

        <div className="product-container">

            <h1 className="product-title">
                {buttonText === "상품 수정" ? "상품 수정" : "상품 등록"}
            </h1>

            <form onSubmit={submitHandler} className="product-form">

                {/* 상품명 */}
                <div className="form-card">
                    <label className="form-label">상품명</label>
                    <input
                        name="itemName"
                        value={form.itemName}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                {/* 설명 */}
                <div className="form-card">
                    <label className="form-label">상품 설명</label>
                    <textarea
                        name="itemDetail"
                        value={form.itemDetail}
                        onChange={handleChange}
                        className="form-textarea"
                    />
                </div>

                {/* 가격 */}
                <div className="form-card">
                    <label className="form-label">정가</label>
                    <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        className="form-input"
                    />

                    <label className="form-label margin-top">
                        할인율 (%)
                    </label>

                    <input
                        name="discountRate"
                        type="number"
                        value={form.discountRate}
                        onChange={handleChange}
                        className="form-input"
                    />

                    <div className="price-box">
                        최종가
                        <span className="price-value">
                            {form.discountPrice?.toLocaleString()}원
                        </span>
                    </div>
                </div>

                {/* 색상 */}
                <div className="form-card">
                    <label className="form-label">색상</label>

                    <div className="color-group">
                        <input name="color1" value={form.color1} onChange={handleChange} className="form-input" />
                        <input name="color2" value={form.color2} onChange={handleChange} className="form-input" />
                        <input name="color3" value={form.color3} onChange={handleChange} className="form-input" />
                    </div>
                </div>

                {/* 카테고리 */}
                <div className="form-card">
                    <label className="form-label">카테고리</label>

                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="form-input"
                    >
                        <option value="">선택</option>
                        <option value="거실">거실</option>
                        <option value="침실">침실</option>
                        <option value="욕실">욕실</option>
                        <option value="주방">주방</option>
                    </select>
                </div>

                {/* 이미지 */}
                <div className="form-card">
                    <label className="form-label">상품 이미지</label>

                    <input
                        type="file"
                        multiple
                        onChange={onFileChange}
                        className="file-input"
                    />

                    <div className="preview-container">

                        {previews.map((url, i) => (

                            <div key={i} className="preview-box">

                                <img
                                    src={url}
                                    onClick={() => setMainImage(i)}
                                    className={
                                        i === 0
                                            ? "preview-image main-image"
                                            : "preview-image"
                                    }
                                />

                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeImage(i)}
                                >
                                    ×
                                </button>

                            </div>

                        ))}

                    </div>
                </div>

                <button type="submit" className="submit-btn">
                    {buttonText}
                </button>

            </form>

        </div>
    );
};

export default ItemProduct;