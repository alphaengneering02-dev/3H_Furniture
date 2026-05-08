import React, { useState } from 'react';
import FindId_result from './FindId_result';
import ChangePw_result from './ChangePW_result';

const ChangePw = () => {

    const [form, setForm] = useState({
        id: "", oldPassword: "", newPassword: ""
    })
    const {id, oldPassword, newPassword} = form


    return (
        <div>
            ChangePW 페이지
            
            <h1>로고</h1>

            <h2>아이디 찾기</h2>
            <h2>비밀번호 재설정</h2>


            <div>
                {/* 아이디 */}
                <div>
                    <input type='text' value={id} id='id' name='id' placeholder='아이디'/>
                </div>

                {/* 기존 비밀번호 */}
                <div>
                    <input type='password' value={oldPassword} id='oldPassword' name='oldPassword' placeholder='기존 비밀번호'/>
                </div>

                {/* 새 비밀번호 */}
                <div>
                    <input type='password' value={newPassword} id='newPassword' name='newPassword' placeholder='새로운 비밀번호'/>
                </div>
            

                <button>비밀번호 재설정</button>
            </div>

            {/* 비밀번호 재설정 클릭 시, ChangePw_result 화면으로 전환 (ajax) */}
            {/* <ChangePw_result/> */}

            
        </div>
    );
};

export default ChangePw;