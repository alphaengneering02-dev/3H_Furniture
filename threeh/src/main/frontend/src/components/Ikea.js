import React, { useState } from 'react';

const Ikea = ({ onSubmit, buttonText }) => {

    const [form, setForm] = useState({
        itemName: '',
        itemDetail: '',
        price: 0,
        discountRate: 0,
        discountPrice: 0,
        category: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        let next = { ...form, [name]: value };

        if (name === "price" || name === "discountRate") {
            const price = name === "price" ? Number(value) : Number(form.price);
            const rate = name === "discountRate" ? Number(value) : Number(form.discountRate);

            next.discountPrice = rate > 0
                ? Math.floor(price * (1 - rate / 100))
                : price;
        }

        setForm(next);
    };

    const submitHandler = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div style={styles.page}>

            <div style={styles.header}>
                상품 등록
            </div>

            <form onSubmit={submitHandler} style={styles.form}>

                {/* 상품명 */}
                <div style={styles.card}>
                    <label style={styles.label}>상품명</label>
                    <input
                        name="itemName"
                        value={form.itemName}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="상품명을 입력하세요"
                    />
                </div>

                {/* 설명 */}
                <div style={styles.card}>
                    <label style={styles.label}>상품 설명</label>
                    <input
                        name="itemDetail"
                        value={form.itemDetail}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="설명을 입력하세요"
                    />
                </div>

                {/* 가격 */}
                <div style={styles.card}>
                    <label style={styles.label}>가격</label>
                    <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <label style={styles.label}>할인율 (%)</label>
                    <input
                        name="discountRate"
                        type="number"
                        value={form.discountRate}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <div style={styles.priceBox}>
                        최종가: <b>{form.discountPrice?.toLocaleString()}원</b>
                    </div>
                </div>

                {/* 카테고리 */}
                <div style={styles.card}>
                    <label style={styles.label}>카테고리</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        style={styles.input}
                    >
                        <option value="">선택</option>
                        <option value="거실">거실</option>
                        <option value="침실">침실</option>
                        <option value="주방">주방</option>
                        <option value="욕실">욕실</option>
                    </select>
                </div>

                {/* 버튼 */}
                <button type="submit" style={styles.button}>
                    {buttonText || "등록하기"}
                </button>

            </form>
        </div>
    );
};

const styles = {
    page: {
        backgroundColor: "#fff",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial, sans-serif"
    },

    header: {
        fontSize: "28px",
        fontWeight: "bold",
        marginBottom: "30px",
        color: "#0058A3"
    },

    form: {
        maxWidth: "600px"
    },

    card: {
        backgroundColor: "#fff",
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
    },

    label: {
        display: "block",
        fontSize: "14px",
        marginBottom: "8px",
        color: "#333",
        fontWeight: "bold"
    },

    input: {
        width: "100%",
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        outline: "none"
    },

    priceBox: {
        marginTop: "10px",
        fontSize: "16px",
        color: "#0058A3",
        fontWeight: "bold"
    },

    button: {
        width: "100%",
        padding: "15px",
        backgroundColor: "#0058A3",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "bold",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    }
};

export default Ikea;