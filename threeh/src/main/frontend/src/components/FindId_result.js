import React, { useState } from 'react';

const FindId_result = () => {

    const [resultId, setResultId] = useState()


    return (
        <div>
            <h3>아이디 찾기가 완료되었습니다.</h3>

            <input type='text' value={resultId} id='resultId' name='resultId' placeholder='사용자 ID'/>


            <article>
                <button>로그인</button>
                <button>비밀번호 찾기</button>
            </article>
        </div>
    );
};

export default FindId_result;