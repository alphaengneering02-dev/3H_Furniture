import React, { useState } from 'react';
import FindId_result from './FindId_result';
import { Link, Route, Switch } from "react-router-dom";
import axios from 'axios';
import Header from '../main/Header';
import { useToast } from '../../hook/useToast';

//FindId 전용 CSS 임포트
import '../../css/memberPageCss/findId.css';
import Footer from '../main/Footer';

const FindId = () => {

    const { success, error: err, warn, info } = useToast();

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
            warn("모든 항목을 입력해주세요!")
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

                err("[아이디 찾기 실패]\n" + errorMessage)
                console.log("[아이디 찾기 실패]\n" + errorMessage)
            } else {
                err("[아이디 찾기 실패]\n" + "서버와 연결할 수 없습니다.")
                console.log("[아이디 찾기 실패]\n" + "서버와 연결할 수 없습니다.")
            }
        }

    }


    return (
        <div>
            {/* Header 영역 */}
            <div className="main-header">
                <Header/>
            </div>


            <div className="find-id-container">
                {/* 상단 탭 메뉴 형태 네비게이션 */}
                <div className="find-id-nav-tabs">
                    <Link to="/findId" className="tab-active">아이디 찾기</Link>
                    <Link to="/changePw">비밀번호 재설정</Link>
                </div>


                {
                    showResult===false
                    ? (
                        <form className="find-id-form">
                            {/* 이름 필드 */}
                            <div className="find-id-input-group">
                                <p>이름</p>
                                <input 
                                    type='text' 
                                    id='name' name='name' value={name}
                                    placeholder='📝 이름을 입력해주세요'
                                    onChange={changeInput}
                                    className="find-id-input-field"
                                />
                            </div>

                            {/* 연락처 필드 */}
                            <div className="find-id-input-group">
                                <p>전화번호 또는 이메일</p>
                                <input 
                                    type='text'
                                    id='phoneORemail' name='phoneORemail' value={phoneORemail}
                                    placeholder='📞 전화번호 또는 이메일을 입력해주세요' 
                                    onChange={changeInput}
                                    className="find-id-input-field"
                                />
                            </div>
                        

                            {/* 찾기 제출 / 로그인으로 돌아가기 버튼 컴포넌트군 */}
                            <button onClick={onSubmit} className="find-id-submit-btn">아이디 찾기</button>
                            <Link to="/login" className="find-id-footer-link">로그인</Link>
                        </form>
                    ) 
                    : (
                        //결과 화면으로 전환
                        <FindId_result resultId={resultId}/>
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

export default FindId;