import React, { useState } from 'react';
import FindId_result from './FindId_result';

const FindId = () => {

    const [form, setForm] = useState({
        name: "", telORemail: ""
    })
    const {name, telORemail} = form


    return (
        <div>
            FindId 페이지
            
            <h1>로고</h1>

            <h2>아이디 찾기</h2>
            <h2>비밀번호 재설정</h2>


            <div>
                {/* 이름 */}
                <div>
                    <input type='text' value={name} id='name' name='name' placeholder='이름'/>
                </div>

                {/* 전화번호 또는 이메일 */}
                <div>
                    <input type='text' value={telORemail} id='telORemail' name='telORemail' placeholder='전화번호 또는 이메일'/>
                </div>
            

                <button>아이디 찾기</button>
            </div>

            {/* 비밀번호 재설정 클릭 시, FindId_result 화면으로 전환 (ajax) */}
            {/* <FindId_result/> */}

            
        </div>
    );
};

export default FindId;