import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const Refund = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]); //반품 가능한 주문 목록

    //페이지가 열리자마자 반품 가능한 목록을 서버에서 가져옴
    useEffect(() => {
        axios.get('http://localhost://8080/Member/order/refund-list',{withCredentials:true})
        .then(res => {
            setOrders(res.data || []);
        })
        .catch(err => {
            console.error("목록 로드 실패",err);
            alert("주문 내역을 불러오는데 실패했습니다");
        })
    },[]);

    //DB로 수량 롤백 및 주문 삭제
    const handleRefundProcess = (orderId) => {
        if(window.confirm(`주문번호 ${orderId}번을 정말 교환/반품 하기겠습니까?\n이 작업은 되돌릴 수 없으며 재고가 복구됩니다.`)) {
            const params = new URLSearchParams();
            params.append('orderId', orderId);

            axios.post('http://localhost:8080/Member/refund/process',params,{withCredentials:true})
                .then(res => {
                    alert(res.data);
                    setOrders(orders.filter(order => order.id != orderId));
                })
                .catch(err => {
                    alert("처리 중 오류가 발생했습니다");
                })
        }
    };

    return (
        <div style={{padding:'30px',maxWidth:'800px',margin:'0 auto'}}>
            <button onClick={() => navigate('/mypage')} style={{marginBottom:'20px'}}>
                마이페이지로 돌아가기
            </button>

        <h1>교환 및 반품 신청</h1>
        <p style={{color:'#666'}}>반품 신청 시 즉시 주문이 취소되며 해당 상품의 재고가 복구됩니다.</p>
        <hr/>

        <div style={{ marginTop: '20px' }}>
            {/* 1. 여기서부터 자바스크립트 시작이므로 { 를 엽니다. */}
            {orders.map(order => (
                /* 2. 개별 주문을 감싸는 전체 박스 시작 */
                <div key={order.id} style={{
                    border: '1px solid #ddd',
                    padding: '15px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <p><strong>주문번호:</strong> {order.id}</p>
                        <p><strong>상품명:</strong> {order.productName || "주문 상품"}</p>
                    </div>

                    <div>
                        <button onClick={() => handleRefundProcess(order.id)}>
                            반품신청
                        </button>
                    </div>
        </div>
            ))}
            </div>
            </div>
    
        );
};

export default Refund;