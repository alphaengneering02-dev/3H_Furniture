import React, { useState } from 'react';
import FindId_result from './FindId_result';
import { Link, Route, Switch } from "react-router-dom";

const FindId = () => {

    const [form, setForm] = useState({
        name: "", telORemail: ""
    })
    const {name, telORemail} = form


    //아이디 찾기 화면(FindId_result.js) 띄우기
    const [showResult, setShowResult] = useState(false)

    const onSubmit = (evt) => {
        setShowResult(true)
    }





    return (
        <div>
            FindId 페이지
            
            <h1>로고</h1>

            <h2>아이디 찾기</h2>
            <h2>비밀번호 재설정</h2>


            {
                showResult===false &&
                <div>
                    {/* 이름 */}
                    <div>
                        <p>이름</p>
                        <input type='text' value={name} id='name' name='name' placeholder='이름'/>
                    </div>

                    {/* 전화번호 또는 이메일 */}
                    <div>
                        <p>전화번호 또는 이메일</p>
                        <input type='text' value={telORemail} id='telORemail' name='telORemail' placeholder='전화번호 또는 이메일'/>
                    </div>
                

                    <button onClick={onSubmit}>아이디 찾기</button>
                </div>
            }
            

            {/* 아이디 찾기 클릭 시, FindId_result 화면으로 전환 (ajax) */}
            {
                showResult===true &&
                <FindId_result/>
            }

            
        </div>
    );
};

export default FindId;