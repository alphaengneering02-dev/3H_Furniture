import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { useToast } from '../../hook/useToast';
import Footer from "../main/Footer";
import Header from '../main/Header';

const Schedule = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    const { success, error, warn, info } = useToast();

    // 반품 리펀드 페이지로 이동
    const moveToRefund = (orderId) => {
        navigate(`/refund?orderId=${orderId}`);
    };

    // 주문 목록 가져오기
    useEffect(() => {
        axios.get('http://localhost:8080/Member/order/list', { withCredentials: true })
            .then(res => setOrders(res.data))
            .catch(err => console.error("데이터 로드 실패:", err));
    }, []);

    // 구매 확정 API 호출
    const handleConfirm = (orderId) => {
        axios.post(`http://localhost:8080/purchase/confirm?orderId=${orderId}`, {}, { withCredentials: true })
            .then(() => {
                alert('구매가 확정되었습니다.');
                window.location.reload(); // 새로고침으로 상태 업데이트
            })
            .catch(err => alert('확정 실패: ' + err.message));
    };

    // 반품 신청 API 호출 (이 로직은 필요 없으면 지워도 됩니다)
    const handleRefund = (orderId) => {
        if (!window.confirm('정말 반품하시겠습니까?')) return;
        
        axios.post(`http://localhost:8080/refund/process?orderId=${orderId}`, {}, { withCredentials: true })
            .then(() => {
                alert('반품 처리가 완료되었습니다.');
                window.location.reload();
            })
            .catch(err => alert('반품 실패: ' + err.message));
    };

     console.log(orders)

        return (
        // [아침 규격 통일] 페이지 전체 최상위 루트 가동
        <div className="order-page-global-root">
            
            {/* 1. 상단 공용 헤더 영역 */}
            <div className='main-header'>
                <Header/>
            </div>

            {/* 토스트 알림 컨테이너 시스템 안전 상주 */}
            <ToastContainer
                position="top-center"
                autoClose={1800}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnHover
                theme="light"
            />

            {/* 2. 중앙 컨텐츠 메인 랩퍼 (가로폭 960px 한계선 잠금) */}
            <div className="schedule-container" style={{ padding: '40px 20px 80px 20px', maxWidth: '960px', margin: '0 auto', boxSizing: 'border-box' }}>
                
                {/* 섹션 대제목 */}
                <h2 className='mypage-schedule-title' style={{ fontSize: '20px', fontWeight: '700', color: 'var(--black-brown)', marginBottom: '25px', letterSpacing: '-0.5px' }}>
                    구매 확정된 내역
                </h2>
                
                {/* [구조 개혁 핵심] 상자들을 세로로 쌓지 않고, 가로(row) 방향으로 나란히 정렬시키는 가로 흐름 플렉스 트랙 가동 */}
                <div className='mypage-schedule-lis' style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
                    {orders
                        // [하이브리드 필터 가드]: 데이터가 영어('PURCHASED') 또는 한글('구매확정') 어떤 이름표로 오든 누락 없이 100% 잡아냅니다!
                        .filter(order => order.orderState === 'PURCHASED' || order.orderState === '구매확정')
                        .map(order => (
                        
                            /* [너비 고정] 상자가 화면 전체를 먹지 않고 가로로 나란히 붙을 수 있도록 딱 이쁜 290px 너비로 컴팩트하게 축소 조정 */
                            <div key={order.orderId} className='mypage-schedule-card' style={{ margin: '0', width: '290px', minWidth: '290px', backgroundColor: 'var(--content-bg)', border: '1px solid var(--soft-border)', borderRadius: '12px', padding: '20px', boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(74, 51, 36, 0.02)' }}>
                                <div className='mypage-schedule-header' style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--soft-border)', paddingBottom: '10px', marginBottom: '15px' }}>
                                    <p className='mypage-schedule-order-id' style={{ margin: '0', fontWeight: '700', color: 'var(--brown)', fontFamily: "'Playfair Display', serif" }}>주문번호: {order.orderId}</p>
                                    <p style={{ margin: '0', fontSize: '13px' }}>상태: <strong style={{ color: 'var(--caramel)' }}>구매확정</strong></p>
                                </div>
                                <div className='mypage-schedule-card-body' style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    
                                    {/* [원본 100% 싱크 복원]: orderItems[0] 인덱스 참조 기법 복귀 완료! */}
                                    <div className='schedule-row' style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <p className='mypage-schedule-label' style={{ margin: '0', color: '#888888', fontSize: '13px' }}>상품명</p>
                                        <span className='mypage-schedule-value' style={{ fontWeight: '700', color: 'var(--black-brown)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                                            {order.orderItems && order.orderItems[0] ? order.orderItems[0].itemName : "상품 정보 없음"}
                                        </span>
                                    </div>
                                
                                    <div className='schedule-row' style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <p className='mypage-schedule-label' style={{ margin: '0', color: '#888888', fontSize: '13px' }}>수량</p>
                                        <span className='mypage-schedule-value' style={{ color: 'var(--black-brown)' }}>
                                            {order.orderItems && order.orderItems[0] ? order.orderItems[0].count : 0}개
                                        </span>
                                    </div>
                                    <div className='schedule-row' style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <p className='mypage-schedule-label' style={{ margin: '0', color: '#888888', fontSize: '13px' }}>가격</p>
                                        <span className='mypage-schedul-price' style={{ fontWeight: '700', color: 'var(--caramel)' }}>
                                            {order.orderItems && order.orderItems[0] ? order.orderItems[0].orderPrice.toLocaleString() : 0}원
                                        </span>
                                    </div>
                                    
                                    <p style={{ color: '#B8783E', fontWeight: '700', margin: '8px 0 0 0', fontSize: '13px', textAlign: 'right' }}>✓ 구매가 확정된 상품입니다.</p>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {/* 데이터 예외 처리 구역 */}
                {orders.filter(o => o.orderState === 'PURCHASED' || o.orderState === '구매확정').length === 0 && (
                    <div style={{ padding: '80px 0', textAlign: 'center', backgroundColor: 'var(--content-bg)', border: '1px solid var(--soft-border)', borderRadius: '12px', width: '100%' }}>
                        <p className="mypage-schedule-empty" style={{ margin: '0', color: '#999', fontSize: '14px' }}>구매 확정된 내역이 없습니다.</p>
                    </div>
                )}
            </div> {/* [종료] schedule-container */}

            {/* 3. 하단 공용 푸터 영역 */}
            <div className="main-mypage-footer">
                <Footer/>
            </div>

        </div> // [종료] order-page-global-root
    );
};

export default Schedule;
