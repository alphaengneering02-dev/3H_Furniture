import React, { useState } from 'react';
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

        try {
            console.log("서버로 보내는 데이터: ", id, oldPassword, newPassword);

            //DB에서 이름, 전화번호가 같은 사이트 회원 데이터 검색 (일반 유저)
            //경로 형식을 서버와 맞춥니다: /member/findUserId/이름/연락처
            const res = await axios.get(`http://localhost:8080/member/changeUserPassword/${id}/${oldPassword}&${newPassword}`)
            setResultPw(res.data)
            setShowResult(true)

            console.log("비밀번호 재설정 성공!", res.data)

        } catch (error) {
            console.error("비밀번호 재설정 실패!", error)
        }

    }


    return (
        <div>
            ChangePW 페이지
            
            <h1>로고</h1>

            <h2> <Link to="/findId">아이디 찾기</Link> </h2>
            <h2>비밀번호 재설정</h2>


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
            </div>

            {/* 비밀번호 재설정 클릭 시, ChangePw_result 화면으로 전환 (ajax) */}
            {
                showResult===true &&
                <ChangePw_result resultPw={resultPw}/>
            }

            
        </div>
    );
};

export default ChangePw;