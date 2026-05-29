import React, { useEffect, useState } from 'react';
import ChangePw_result from './ChangePW_result';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../main/Header';
import { useToast } from '../../hook/useToast';

//ChangePW 전용 CSS 임포트
import '../../css/memberPageCss/changePW.css';
import Footer from '../main/Footer';

const ChangePw = () => {

    const { success, error: err, warn, info } = useToast();

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
            warn("모든 항목을 입력해주세요.")
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

                err("[비밀번호 재설정 실패]\n" + errorMessage)
                console.log("[비밀번호 재설정 실패]\n" + errorMessage)
            } else {
                err("[비밀번호 재설정 실패]\n" + "서버와 연결할 수 없습니다.")
                console.log("[비밀번호 재설정 실패]\n" + "서버와 연결할 수 없습니다.")
            }
        }

    }


    return (
        <div>
            {/* Header 영역 */}
            <div className="main-header">
                <Header/>
            </div>


            <div className="change-pw-container">
                {/* 네비게이션 탭 영역 (현재 탭 활성화) */}
                <div className="change-pw-nav-tabs">
                    <Link to="/findId">아이디 찾기</Link>
                    <Link to="/changePw" className="tab-active">비밀번호 재설정</Link>
                </div>


                
                {
                    showResult===false
                    ? (
                        <form className="change-pw-form">
                            {/* 아이디 필드 */}
                            <div className="change-pw-input-group">
                                <p>아이디</p>
                                <input 
                                    type='text' 
                                    value={id} id='id' name='id' placeholder='🆔 아이디를 입력해주세요' 
                                    className="change-pw-input-field"
                                    onChange={changeInput}
                                />
                            </div>

                            {/* 기존 비밀번호 필드 */}
                            <div className="change-pw-input-group">
                                <p>기존 비밀번호</p>
                                <input 
                                    type='password' 
                                    value={oldPassword} id='oldPassword' name='oldPassword' 
                                    placeholder='🔒 현재 비밀번호를 입력해주세요' 
                                    className="change-pw-input-field"
                                    onChange={changeInput}
                                />
                            </div>

                            {/* 새 비밀번호 필드 */}
                            <div className="change-pw-input-group">
                                <p>새로운 비밀번호</p>
                                <input 
                                    type='password' 
                                    value={newPassword} id='newPassword' name='newPassword' 
                                    placeholder='🔒 새롭게 변경할 비밀번호를 입력해주세요' 
                                    className="change-pw-input-field"
                                    onChange={changeInput}
                                />
                            </div>
                        

                            {/* 재설정 제출 / 로그인으로 돌아가기 버튼 컴포넌트 군 */}
                            <button onClick={onSubmit} className="change-pw-submit-btn">비밀번호 재설정</button>
                            <Link to="/login" className="change-pw-footer-link">로그인</Link>
                        </form>
                    )
                    : (
                        //결과 화면으로 전환
                        <ChangePw_result resultPw={resultPw}/>
                    )
                }
            </div>


            {/* Footer 영역 */}
            <div className="main-mypage-footer">
                <Footer/>
            </div>
        </div>
    );
};

export default ChangePw;