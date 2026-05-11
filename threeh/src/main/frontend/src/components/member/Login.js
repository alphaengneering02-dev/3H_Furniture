import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'

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


        //데이터 전송
        try {
            const res = await axios.post(`http://localhost:8080/member/login`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                withCredentials: true // 세션 쿠키를 유지하기 위해 필요합니다.
            })

            setLoginResultMsg(res.data.message);  //"message": "로그인에 성공하였습니다"
            console.log("member 데이터 전송 성공!", res)

            //메인으로 리다이렉트
            navigate("/")
        } catch (error) {
            //백엔드의 LoginFailHandler가 보낸 JSON 응답을 받음
            if (error.response && error.response.data) {
                setLoginResultMsg(error.response.data.message);  //"잠긴 계정입니다.", "비밀번호가 만료되었습니다." 등의 텍스트
            } else {
                setLoginResultMsg("서버와 연결할 수 없습니다.");
            }

            console.error("member 데이터 전송 실패!", error)
        }

    }



    return (
        <div>
            Login 페이지
            
            <h1> <Link to="/">로고</Link> </h1>

            <h2>회원 로그인</h2>


            <form onChange={changeInput}>
                {/* 아이디 */}
                <div>
                    <input type='text' value={id} id='id' name='id' placeholder='아이디'/>
                </div>

                {/* 비밀번호 */}
                <div>
                    <input type='password' value={password} id='password' name='password' placeholder='비밀번호'/>
                </div>
            </form>


            <article>
                <p> <input type='checkbox' checked={isChecked} onChange={changeChecked}/>로그인 상태 유지 </p>
                <p> 
                    <span onClick={() => navigate("/")}>아이디 찾기</span>
                    <span onClick={() => navigate("/")}>비밀번호 찾기</span>
                </p>
            </article>


            {/* 로그인 성공/실패 메세지 */}
            <div>
                {loginResultMsg && <p>{loginResultMsg}</p>}
            </div>


            <button onClick={onSubmit}>로그인</button>


            
            {/* oauth2 소셜 로그인 */}
            <div>
                <p> <Link to="http://localhost:8080/oauth2/authorization/google">구글</Link> </p>
                <p> 네이버 </p>  {/* <Link to="/oauth2/authorization/kakao"></Link> */}
                <p> 카카오 </p>  {/* <Link to="/oauth2/authorization/naver"></Link> */}
            </div>



            <article>
                <p>계정이 없으신가요? 지금 바로 만들어 보세요.</p>
                <button onClick={() => navigate("/singup")}>회원가입</button>  {/* Link */}
            </article>

        </div>
    );
};

export default Login;