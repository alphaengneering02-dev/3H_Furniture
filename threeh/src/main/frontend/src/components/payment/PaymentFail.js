import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/paymentCss/payment.css'; // 아까 작성한 CSS 파일 같이 공유

function PaymentFail({ failReason }) {
    const navigate = useNavigate();

    // 💡 failReason이 없을 때 보여줄 품격 있는(?) 기본 에러 메시지 세팅
    const displayMessage = failReason || "결제 처리 중 일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

    return (
        <div className='payment-wrapper' style={{ borderColor: '#f1f1f1' }}>
            
            {/* 💡 실패를 알리는 경고 아이콘 (까사미아 무드에 맞춘 얇은 느낌의 X) */}
            <div className='payment-checklogo' style={{ color: '#c94c4c', borderColor: '#c94c4c' }}>
                ✕
            </div>
            
            {/* 메인 타이틀 */}
            <h2 className='payment-headline'>결제에 실패하였습니다</h2>
            
            {/* 💡 에러 사유가 담기는 정갈한 인포 박스 */}
            <div className='payment-info-box' style={{ textAlign: 'center', backgroundColor: '#fdfdfd' }}>
                <p className='payment-label' style={{ 
                    justifyContent: 'center', 
                    color: '#666666', 
                    fontSize: '15px',
                    lineHeight: '1.6',
                    margin: '10px 0'
                }}>
                    {displayMessage}
                </p>
            </div>
            
            {/* 하단 버튼 그룹 (가로 배치 및 까사미아 차콜 스타일 매칭) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button 
                    className='payment-btn' 
                    onClick={() => navigate("/cart")} // 보통 장바구니나 이전 상품페이지로 보냅니다.
                    style={{ backgroundColor: '#ffffff', color: '#2b2b2b', border: '1px solid #2b2b2b' }}
                >
                    다시 시도
                </button>
                
                <button 
                    className='payment-btn' 
                    onClick={() => navigate("/")}
                >
                    홈으로
                </button>
            </div>
        </div>
    );
}

export default PaymentFail;