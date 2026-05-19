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

        //브라우저의 기본 폼 제출(새로고침) 방지
        evt.preventDefault();

        //모든 필드의 null 검사
        if(name=="" || phoneORemail=="") {
            alert("모든 항목을 입력해주세요!")
            return
        }

        console.log("서버로 보내는 데이터: ", name, phoneORemail);


        try {
            //아이디 찾기 실행
            //경로 형식을 서버와 맞춥니다: /member/findUserId/이름/연락처
            const res = await axios.get(`http://localhost:8080/api/member/findUserId/${name}/${phoneORemail}`)
            
            console.log("[아이디 찾기 성공]", res.data)
            setResultId(res.data)
            setShowResult(true)

        } catch (error) {
            //백엔드의 컨트롤러가 보낸 JSON 응답을 받음
            if (error.response && error.response.data) {
                // 1. 글로벌 핸들러가 보낸 표준 형식이면 errorData.message 사용
                // 2. 컨트롤러가 직접 보낸 Map 형식이면 Object.values(errorData)[0] 사용
                const errorData = error.response.data
                const errorMessage =error.response.data.message || Object.values(errorData)[0] || "알 수 없는 오류가 발생했습니다."

                alert("[아이디 찾기 실패]\n" + errorMessage)
                console.log("[아이디 찾기 실패]\n" + errorMessage)
            } else {
                alert("[아이디 찾기 실패]\n" + "서버와 연결할 수 없습니다.")
                console.log("[아이디 찾기 실패]\n" + "서버와 연결할 수 없습니다.")
            }
        }

    }



    return (
        <div>
            FindId 페이지
            
            <h1> <Link to="/">로고</Link> </h1>

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

                    <Link to="/login">로그인</Link>
                </div>
            }
            

            {/* 아이디 찾기 클릭 시, FindId_result 화면으로 전환 (모듈화) */}
            {
                showResult===true &&
                <FindId_result resultId={resultId}/>
            }
        </div>
    );
};

export default FindId;