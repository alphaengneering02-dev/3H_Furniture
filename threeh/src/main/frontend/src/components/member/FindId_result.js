import React from 'react';
import { useNavigate } from 'react-router-dom';

const FindId_result = ({resultId}) => {

    const navigate = useNavigate();


    return (
        <div>
            <h3>아이디 찾기가 완료되었습니다.</h3>

            <input type='text' value={resultId} id='resultId' name='resultId' placeholder='사용자 ID'/>
            <div id="resultDiv"></div>


            <article>
                <button onClick={() => navigate("/login")}> 로그인 </button>
                <button onClick={() => navigate("/changePw")}> 비밀번호 찾기 </button>
            </article>
        </div>
    );
};

export default FindId_result;