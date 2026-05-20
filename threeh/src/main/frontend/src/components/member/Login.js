import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import icon_google from '../../assets/icon_google.png';
import icon_kakao from '../../assets/icon_kakao.png';
import icon_naver from '../../assets/icon_naver.png';

//Login 전용 CSS 임포트
import '../../css/memberPageCss/login.css';
import Header from '../main/Header';

const Login = () => {

    const navigate = useNavigate();

    
    //로그인 member 보내기(request)
    // const { register, handleSubmit, setError, formState: {errors} } = useForm();  //유효성 검사(validation) 활성화 : 각 입력 필드 등록, 폼 제출 함수 정의, 에러 객체, 외부 validation form 사용시 추가

    //입력값 받기
    const [form, setForm] = useState({
        id: "", password: ""
    })
    const {id, password} = form

    const changeInput = (evt) => {
        const {value, name} = evt.target

        setForm({
            ...form,
            [name]: value
        })
    }


    //로그인 상태 유지 기능
    const [isChecked, setIsChecked] = useState(false);
    const changeChecked = (evt) => {
        setIsChecked(!isChecked)
        
    };

    const [loginResultMsg, setLoginResultMsg] = useState("");
    const expireTime = 30 * 60 * 1000  //세션 만료시간(밀리초 단위, 30분)


    //제출 처리
    const onSubmit = async(evt) => {

        //브라우저의 기본 폼 제출(새로고침) 방지
        evt.preventDefault();

        //모든 필드의 null 검사
        if(id=="" || password=="") {
            alert("모든 항목을 입력해주세요!")
            return
        }


        //백엔드 서버로 전송할 데이터 (Form data 형태)
        const params = new URLSearchParams();
        params.append('id', id);
        params.append('password', password);  //예: id=user2&password=a123 형태의 Form Data
        
        console.log("서버로 보내는 데이터: " + params.toString())


        //데이터 전송 및 sessionStorage 저장
        try {
            //데이터 전송 (어드민, 일반 유저)
            const res = await axios.post(`http://localhost:8080/api/member/login`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                withCredentials: true // 세션 쿠키를 유지하기 위해 필요합니다.
            })

            console.log("사이트 회원 데이터 전송 성공!", res)


            // Spring Boot에서 보내준 JSON 응답(status: true) 확인
            if (res.data.status === true) {
                //"message": "로그인에 성공하였습니다"
                const passMessage = res.data.message
                setLoginResultMsg(passMessage);
                alert(passMessage)
                console.log(passMessage)

                //sessionStorage 저장
                await setSession(res.data.id);

                // 세션 만료시간 타이머(30분): 세션 삭제+로그인 페이지로 이동
                setTimeout(() => {
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                    sessionStorage.removeItem("user"); //세션 삭제
                    navigate('/login'); //로그인 페이지로 이동
                }, expireTime)

                // 메인 페이지로 이동
                navigate('/')
            }

        } catch (error) {
            //백엔드의 LoginFailHandler가 보낸 JSON 응답을 받음
            if (error.response && error.response.data) {
                const errorMessage = error.response.data.message
                setLoginResultMsg(errorMessage);  //"잠긴 계정입니다.", "비밀번호가 만료되었습니다." 등의 에러메세지
                alert(errorMessage)
                console.log(errorMessage)
            } else {
                setLoginResultMsg("서버와 연결할 수 없습니다.");
                alert("서버와 연결할 수 없습니다.")
                console.log("서버와 연결할 수 없습니다.")
            }

            console.error("로그인 시도 중 오류 발생: ", error)
        }
    }



    //sessionStorage 저장
    const setSession = async(id) => {
        try {
            //DB에서 아이디가 같은 사이트 회원 데이터 검색
            let res;

            if(form.id.indexOf("admin") != -1) {  //어드민 유저
                res = await axios.get(`http://localhost:8080/admin/${id}`,{
                    withCredentials:true,
                });
            } else {  //일반 유저
                res = await axios.get(`http://localhost:8080/api/member/${id}`, {
                    withCredentials:true,
                });
            }
            
            console.log("사이트 회원 데이터 가져오기 성공!", res.data)

            
            // 2. 프론트엔드 sessionStorage에 사용자 정보를 저장
            //(* 백엔드 HttpSession은 MemberSecurityService.java에서 저장)
            const now = new Date()

            const user = {
                ...res.data,
                expiry: now.getTime() + expireTime
            }
            
            sessionStorage.setItem("user", JSON.stringify(user))  //객체 ---> JSON 형태

            console.log("[프론트엔드 sessionStorage에 올라간 사이트 회원정보]"  + "\n"
            	+ sessionStorage.getItem("user")
            )

            // debugger;  //디버깅 모드 on

        } catch (error) {
            console.error("사이트 회원 데이터 가져오기 실패!", error);

            if(error.response){
                console.log("세션 저장 실패 응답", error.response.data);
            }
        }
    };



    return (
        <div>
            {/* Header 영역 */}
            <div className="main-header">
                <Header/>
            </div>


            <div className="login-container">
                {/* 상단 타이틀 */}
                <h2 className="login-title">회원 로그인</h2>


                {/* 로그인 입력 폼 */}
                <form className="login-form">
                    {/* 아이디 */}
                    <div className="login-input-group">
                        <input 
                            type='text' 
                            value={id} id='id' name='id' 
                            placeholder='아이디' 
                            onChange={changeInput}
                            className="login-input-field"
                        />
                    </div>

                    {/* 비밀번호 */}
                    <div className="login-input-group">
                        <input 
                            type='password' 
                            value={password} id='password' name='password' 
                            placeholder='비밀번호' 
                            onChange={changeInput}
                            className="login-input-field"
                        />
                    </div>
                </form>


                {/* 아이디 / 비밀번호 찾기 */}
                <article className="login-utility-box">
                    <p> <input type='checkbox' checked={isChecked} onChange={changeChecked}/>로그인 상태 유지 </p>
                    <p> 
                        <span className="login-utility-link" onClick={() => navigate("/findId")}>아이디 찾기</span>
                        <span className="login-utility-divider">|</span>
                        <span className="login-utility-link" onClick={() => navigate("/changePw")}>비밀번호 찾기</span>
                    </p>
                </article>

                {/* 로그인 버튼 */}
                <button onClick={onSubmit}>로그인</button>

                

                {/* ===================oauth2 소셜 로그인=================== */}
                <div>
                    <hr className="login-social-divider"/>

                    {/* 소셜 로그인 간편 아이콘 */}
                    <div className="login-social-group">
                        <p> 
                            <Link to="http://localhost:8080/oauth2/authorization/google">
                                <img src={icon_google} alt='구글' className="login-social-icon"/>
                            </Link>
                        </p>
                        <p> 
                            <Link to="http://localhost:8080/oauth2/authorization/naver">
                                <img src={icon_naver} alt='네이버' className="login-social-icon"/>
                            </Link>
                        </p>
                        <p> 
                            <Link to="http://localhost:8080/oauth2/authorization/kakao">
                                <img src={icon_kakao} alt='카카오' className="login-social-icon"/>
                            </Link>
                        </p>
                    </div>

                    <hr className="login-social-divider"/>
                </div>


                {/* 하단 회원가입 유도 가이드 박스 */}
                <article className="login-signup-notice-box">
                    <p className="login-signup-desc">계정이 없으신가요? 지금 바로 만들어 보세요.</p>
                    <button 
                        onClick={() => navigate("/signup")} 
                        className="login-signup-link-btn"
                    >
                        회원가입
                    </button>
                </article>

            </div>
        </div>
    );
};

export default Login;