import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangePw_result = ({resultPw}) => {

    const navigate = useNavigate();


    return (
        <div>
            <h3>비밀번호 재설정이 완료되었습니다.</h3>

            <input type='text' value={resultPw} id='resultPw' name='resultPw' placeholder='사용자 비밀번호'/>


            <button onClick={() => navigate("/login")}>로그인</button>
        </div>
    );
};

export default ChangePw_result;