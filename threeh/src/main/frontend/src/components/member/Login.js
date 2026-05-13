import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import icon_google from '../../assets/icon_google.png';
import icon_kakao from '../../assets/icon_kakao.png';
import icon_naver from '../../assets/icon_naver.png';

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



    //제출
    const onSubmit = async(evt) => {

        //브라우저의 기본 폼 제출(새로고침) 방지
        evt.preventDefault();


        //백엔드 서버로 전송할 데이터 (Form data 형태)
        const params = new URLSearchParams();
        params.append('id', form.id);
        params.append('password', form.password);  //예: id=user2&password=a123 형태의 Form Data
        

        console.log("서버로 보내는 데이터: " + params.toString())


        //데이터 전송 및 sessionStorage 저장
        try {
            //데이터 전송
            const res = await axios.post(`http://localhost:8080/api/member/login`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                withCredentials: true // 세션 쿠키를 유지하기 위해 필요합니다.
            })

            setLoginResultMsg(res.data.message);  //"message": "로그인에 성공하였습니다"
            console.log("사이트 회원 데이터 전송 성공!", res)


            //sessionStorage 저장
            await setSession(form.id)

            //메인으로 리다이렉트
            navigate("/")

        } catch (error) {
            //백엔드의 LoginFailHandler가 보낸 JSON 응답을 받음
            if (error.response && error.response.data) {
                setLoginResultMsg(error.response.data.message);  //"잠긴 계정입니다.", "비밀번호가 만료되었습니다." 등의 텍스트
            } else {
                setLoginResultMsg("서버와 연결할 수 없습니다.");
            }

            console.error("사이트 회원 데이터 전송 실패!", error)
        }

    }



    //sessionStorage 저장
    const setSession = async(id) => {
        try {
            //DB에서 아이디가 같은 사이트 회원 데이터 검색
            let res;

            if(form.id.indexOf("admin") != -1) {  //어드민 유저  **어드민 회원정보를 가져오는 코드가 만들어져야 함
                res = await axios.get(`http://localhost:8080/admin/${id}`)
            } else {  //일반 유저
                res = await axios.get(`http://localhost:8080/api/member/${id}`)
            }
            
            console.log("사이트 회원 데이터 가져오기 성공!", res.data)

            
            // 2. 프론트엔드 sessionStorage에 사용자 정보를 저장
            //(* 백엔드 HttpSession은 MemberSecurityService.java에서 저장)
            const now = new Date()
            const expireTime = 600 * 1000  //세션 만료시간(밀리초 단위, 10분)

            const user = {
                ...res.data,
                expiry: now.getTime() + expireTime
            }
            
            sessionStorage.setItem("user", JSON.stringify(user))

            console.log("[프론트엔드 sessionStorage에 올라간 사이트 회원정보]"  + "\n"
            	+ sessionStorage.getItem("user")
            )

            // debugger;  //디버깅 모드 on

        } catch (error) {
            console.error("사이트 회원 데이터 가져오기 실패!", error)
        }
    }



    return (
        <div>
            Login 페이지
            
            <h1> <Link to="/">로고</Link> </h1>

            <h2>회원 로그인</h2>


            <form>
                {/* 아이디 */}
                <div>
                    <input type='text' value={id} id='id' name='id' placeholder='아이디' onChange={changeInput}/>
                </div>

                {/* 비밀번호 */}
                <div>
                    <input type='password' value={password} id='password' name='password' placeholder='비밀번호' onChange={changeInput}/>
                </div>
            </form>


            <article>
                <p> <input type='checkbox' checked={isChecked} onChange={changeChecked}/>로그인 상태 유지 </p>
                <p> 
                    <span onClick={() => navigate("/findId")}>아이디 찾기</span>
                    <span onClick={() => navigate("/changePw")}>비밀번호 찾기</span>
                </p>
            </article>


            {/* 로그인 성공/실패 메세지 */}
            <div>
                {loginResultMsg && <p>{loginResultMsg}</p>}
            </div>


            <button onClick={onSubmit}>로그인</button>


            
            {/* oauth2 소셜 로그인 */}
            <div>
                <p> 
                    <Link to="http://localhost:8080/oauth2/authorization/google">
                        <img src={icon_google} alt='구글' style={{width: 70}}/>
                    </Link>
                </p>
                <p> 
                    <Link to="http://localhost:8080/oauth2/authorization/naver">
                        <img src={icon_naver} alt='네이버'/>
                    </Link>
                </p>
                <p> 
                    <Link to="http://localhost:8080/oauth2/authorization/kakao">
                        <img src={icon_kakao} alt='카카오'/>
                    </Link>
                </p>
            </div>



            <article>
                <p>계정이 없으신가요? 지금 바로 만들어 보세요.</p>
                <button onClick={() => navigate("/signup")}>회원가입</button>  {/* Link */}
            </article>

        </div>
    );
};

export default Login;