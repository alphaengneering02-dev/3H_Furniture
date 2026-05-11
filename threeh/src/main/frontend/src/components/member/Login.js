import axios from 'axios';
import React, { useState } from 'react';

const Login = () => {
    
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


    const [successLogin, setSuccessLogin] = useState({  //json 형태의 성공 메세지
        status: false,
        message: "로그인에 실패하였습니다."
    });






    //제출
    const onSubmit = async() => {

        //백엔드 서버로 전송할 데이터 (Form data 형태)
        // const formData = new FormData();
        // formData.append(id, form[id])
        // formData.append(password, form[password])
        const params = new URLSearchParams();
        params.append('id', form.id);
        params.append('password', form.password);  //예: id=user2&password=a123 형태의 Form Data
        

        // console.log("서버로 보내는 데이터: " + formData)
        console.log("서버로 보내는 데이터: " + params.toString())


        //데이터 전송
        try {
            alert("test1")
            const res = await axios.post(`http://localhost:8080/member/login`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                withCredentials: true // 세션 쿠키를 유지하기 위해 필요합니다.
            })

            setSuccessLogin({
                ...successLogin,
                status: true,
                message: "로그인에 성공하였습니다. 메인페이지로 이동합니다."
            })
            console.log("member 데이터 전송 성공!", res)
        } catch (error) {
            /*
            //백엔드에서 온 Validation 에러 처리
            if (error.response && error.response.data) {
                const validationErrors = error.response.data; //예: {id: "아이디는 필수입니다."}
                Object.keys(validationErrors).forEach(  //validationErrors를 error 객체로 변환
                    key => {setError(key, {message: validationErrors[key]})
                })
                console.error("member 데이터 전송 실패!", validationErrors)
                return
            }
            */

            //기타 에러 처리
            console.error("member 데이터 전송 실패!", error)
            
        }

    }



    return (
        <div>
            Login 페이지
            
            <h1>로고</h1>  {/* Link */}

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

                {/* csrf 토큰 */}
                <input type="hidden" name="${_csrf.parameterName }" value="${_csrf.token }"></input>
            </form>


            <article>
                <p> <input type='checkbox'/>로그인 상태 유지 </p>
                <p> 아이디 찾기 | 비밀번호 찾기 </p>
            </article>


            {/* 로그인 성공 메세지 */}
            {/* <div>
                {successLogin.status===true && <p>{successLogin.message}</p>}
            </div> */}


            <button onClick={onSubmit}>로그인</button>


            
            {/* oauth2 소셜 로그인 */}
            <div>
                <p> 구글 </p>  {/* <Link to="/oauth2/authorization/google"></Link> */}
                <p> 네이버 </p>  {/* <Link to="/oauth2/authorization/kakao"></Link> */}
                <p> 카카오 </p>  {/* <Link to="/oauth2/authorization/naver"></Link> */}
            </div>



            <article>
                <p>계정이 없으신가요? 지금 바로 만들어 보세요.</p>
                <button>회원가입</button>  {/* Link */}
            </article>

            
        </div>
    );
};

export default Login;