import axios from 'axios';
import React from 'react';

const CartItem = ({itemId, count}) => {

    const handleAddToCart = () => {
        const params = new URLSearchParams();
        params.append('itemId', itemId)
        params.append('count',count);

        axios.post('http://localhost:8080/cartItem/add',params, {withCredentials:true})
        .then(res => {
            alert("장바구니에 상품이 담겼습니다!")
        })
        .catch(err => alert("담기 실패"));
    };

        return (
            <div className="cart-item-action">
                {/*수량 조절 버튼 추가*/}
                <button onClick={handleAddToCart}
                style={{padding:'10px 20px', backgroundColor:'#333',color:'#fff',cursor:'pointer'}}>
                    장바구니 담기
                </button>
            </div>
        )
};

export default CartItem;