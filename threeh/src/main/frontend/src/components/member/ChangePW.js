import React, { useEffect, useState } from 'react';
import FindId_result from './FindId_result';
import ChangePw_result from './ChangePW_result';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ChangePw = () => {

    const [form, setForm] = useState({
        id: "", oldPassword: "", newPassword: ""
    })
    const {id, oldPassword, newPassword} = form


    const changeInput = (evt) => {
        const { name, value } = evt.target;
        setForm({
            ...form,
            [name]: value
        });
    };



    //비밀번호 재설정 결과(ChangePW_result.js) 띄우기
    const [resultPw, setResultPw] = useState()
    const [showResult, setShowResult] = useState(false)

    const onSubmit = async(evt) => {

        //브라우저의 기본 폼 제출(새로고침) 방지
        evt.preventDefault();

        //모든 필드의 null 검사
        if(id=="" || oldPassword=="" || newPassword=="") {
            alert("모든 항목을 입력해주세요.")
            return
        }

        console.log("서버로 보내는 데이터: ", id, oldPassword, newPassword);


        try {
            //비밀번호 재설정 실행
            //경로 형식을 서버와 맞춥니다: /member/changeUserPassword/아이디/기존비번/새비번
            const res = await axios.get(`http://localhost:8080/api/member/changeUserPassword/${id}/${oldPassword}/${newPassword}`, {
                withCredentials: true //요청에 로그인 세션 쿠키를 포함하겠다는 설정
            })
            
            console.log("[비밀번호 재설정 성공]", res.data)
            setResultPw(res.data)
            setShowResult(true)

        } catch (error) {
            //백엔드의 컨트롤러가 보낸 JSON 응답을 받음
            if (error.response && error.response.data) {
                // 1. 글로벌 핸들러가 보낸 표준 형식이면 errorData.message 사용
                // 2. 컨트롤러가 직접 보낸 Map 형식이면 Object.values(errorData)[0] 사용
                const errorData = error.response.data
                const errorMessage =error.response.data.message || Object.values(errorData)[0] || "알 수 없는 오류가 발생했습니다."

                alert("[비밀번호 재설정 실패]\n" + errorMessage)
                console.log("[비밀번호 재설정 실패]\n" + errorMessage)
            } else {
                alert("[비밀번호 재설정 실패]\n" + "서버와 연결할 수 없습니다.")
                console.log("[비밀번호 재설정 실패]\n" + "서버와 연결할 수 없습니다.")
            }
        }

    }


    return (
        <div>
            ChangePW 페이지
            
            <h1> <Link to="/">로고</Link> </h1>

            <h2> <Link to="/findId">아이디 찾기</Link> </h2>
            <h2>비밀번호 재설정</h2>


            {
                showResult===false &&
                <div>
                    {/* 아이디 */}
                    <div>
                        <input type='text' value={id} id='id' name='id' placeholder='아이디' onChange={changeInput}/>
                    </div>

                    {/* 기존 비밀번호 */}
                    <div>
                        <input type='password' value={oldPassword} id='oldPassword' name='oldPassword' placeholder='기존 비밀번호' onChange={changeInput}/>
                    </div>

                    {/* 새 비밀번호 */}
                    <div>
                        <input type='password' value={newPassword} id='newPassword' name='newPassword' placeholder='새로운 비밀번호' onChange={changeInput}/>
                    </div>
                

                    <button onClick={onSubmit}>비밀번호 재설정</button>

                    <Link to="/login">로그인</Link>
                </div>
            }


            {/* 비밀번호 재설정 클릭 시, ChangePw_result 화면으로 전환 (모듈화) */}
            {
                showResult===true &&
                <ChangePw_result resultPw={resultPw}/>
            }
        </div>
    );
};

export default ChangePw;