import React, { useState } from 'react';

const ChangePw_result = () => {

    const [resultPw, setResultPw] = useState()


    return (
        <div>
            <h3>아이디 찾기가 완료되었습니다.</h3>

            <input type='text' value={resultPw} id='resultPw' name='resultPw' placeholder='사용자 비밀번호'/>


            <button>로그인</button>
        </div>
    );
};

export default ChangePw_result;