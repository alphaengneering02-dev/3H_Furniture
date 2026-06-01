import axios from 'axios';
import React from 'react';
import { useToast } from '../../hook/useToast';

const CartItem = ({itemId, count}) => {

    const { success, error, warn, info } = useToast();

    const handleAddToCart = () => {
        const params = new URLSearchParams();
        params.append('itemId', itemId)
        params.append('count',count);

        //api주소 수정_오현옥
        axios.post('http://localhost:8080/api/cartItem/add',params, {withCredentials:true})
        .then(res => {
            success("장바구니에 상품이 담겼습니다!")
        })
        .catch(err => error("담기 실패"));
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