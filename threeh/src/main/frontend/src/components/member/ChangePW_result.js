import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangePw_result = ({resultPw}) => {

    const navigate = useNavigate();


    return (
        <div className="change-pw-result-box">
            <h3 className="change-pw-result-title">비밀번호 재설정이 완료되었습니다.</h3>

            {/* 변경 완료된 정보 필드 */}
            <input 
                type='text' 
                value={resultPw} id='resultPw' name='resultPw' 
                placeholder='사용자 비밀번호'
                readOnly
                className="change-pw-result-field"
            />


            {/* 로그인으로 가기 버튼 */}
            <button 
                className="change-pw-btn-primary"
                onClick={() => navigate("/login")}
            >
                로그인
            </button>
        </div>
    );
};

export default ChangePw_result;