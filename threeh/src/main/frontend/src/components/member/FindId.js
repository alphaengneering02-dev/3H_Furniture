import React, { useState } from 'react';
import FindId_result from './FindId_result';
import { Link, Route, Switch } from "react-router-dom";
import axios from 'axios';

const FindId = () => {

    const [form, setForm] = useState({
        name: "", phoneORemail: ""
    })
    const {name, phoneORemail} = form


    const changeInput = (evt) => {
        const { name, value } = evt.target;
        setForm({
            ...form,
            [name]: value
        });
    };



    //아이디 찾기 결과(FindId_result.js) 띄우기
    const [resultId, setResultId] = useState()
    const [showResult, setShowResult] = useState(false)

    const onSubmit = async(evt) => {

        try {
            console.log("서버로 보내는 데이터: ", name, phoneORemail);

            //DB에서 이름, 전화번호가 같은 사이트 회원 데이터 검색 (일반 유저)
            //경로 형식을 서버와 맞춥니다: /member/findUserId/이름/연락처
            const res = await axios.get(`http://localhost:8080/member/findUserId/${name}/${phoneORemail}`)
            setResultId(res.data)
            setShowResult(true)

            console.log("아이디 찾기 성공!", res.data)

        } catch (error) {
            console.error("아이디 찾기 실패!", error)
        }

    }



    return (
        <div>
            FindId 페이지
            
            <h1>로고</h1>

            <h2>아이디 찾기</h2>
            <h2> <Link to="/changePw">비밀번호 재설정</Link> </h2>


            {
                showResult===false &&
                <div>
                    {/* 이름 */}
                    <div>
                        <p>이름</p>
                        <input type='text' value={name} id='name' name='name' placeholder='이름' onChange={changeInput}/>
                    </div>

                    {/* 전화번호 또는 이메일 */}
                    <div>
                        <p>전화번호 또는 이메일</p>
                        <input type='text' value={phoneORemail} id='phoneORemail' name='phoneORemail' placeholder='전화번호 또는 이메일' onChange={changeInput}/>
                    </div>
                

                    <button onClick={onSubmit}>아이디 찾기</button>
                </div>
            }
            

            {/* 아이디 찾기 클릭 시, FindId_result 화면으로 전환 (ajax) */}
            {
                showResult===true &&
                <FindId_result resultId={resultId}/>
            }

            
        </div>
    );
};

export default FindId;