import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

const Login = () => {

    const history = useHistory()


    //로그인 member 보내기(request)
    // const { register, handleSubmit, setError, formState: {errors} } = useForm();  //유효성 검사(validation) 활성화 : 각 입력 필드 등록, 폼 제출 함수 정의, 에러 객체, 외부 validation form 사용시 추가

    const [successLogin, setSuccessLogin] = useState({  //json 형태의 성공 메세지
        status: false,
        message: "로그인에 실패하였습니다."
    });


    const [member, setMember] = useState({
        id: "", password: ""
    })
    const {id, password} = member


    const changeInput = (evt) => {
        const {name, value} = evt.target

        setMember({
            ...member,
            [name]: value
        })
    }


    const onSubmit = async() => {

        //백엔드 서버로 전송할 데이터 (JSON 대신 Form Data 사용)
        const params = new URLSearchParams();
        params.append('id', member.id);
        params.append('password', member.password);  //예: id=user2&password=a123 형태의 Form Data

        console.log("서버로 보내는 데이터: " + params.toString())


        //데이터 전송
        try {
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


        //-----------------------------------------


        // try {
        //     // 1. DB에서 id가 일치하는 데이터 가져오기
        //     const res = await axios.get(`http://localhost:8080/member/${id}`)
        //     const dbUser = res.data.data

        //     // 2. 존재하지 않는 회원인 경우
        //     if (!dbUser || Object.keys(dbUser).length === 0) {
        //         alert("존재하지 않는 회원입니다.");
        //         return
        //     }

        //     // 3. 비밀번호 체크
        //     if(dbUser.password !== password) {
        //         alert("비밀번호가 일치하지 않습니다.")
        //         return
        //     }
            
        //     // 5. 세션 저장
        //     setForm(dbUser)  //user 상태 업데이트
        //     console.log(form)
        //     localStorage.setItem('user', JSON.stringify(dbUser));

        //     alert(`${id} 로그인에 성공하였습니다.`, res.data.data)
        //     console.log(`${id} 로그인 및 토큰 저장 완료`, res.data.data)
        //     history.push("/"); // 메인 페이지로 강제 이동
        // } catch (error) {
        //     // 존재하지 않는 회원인 경우 (404)
        //     if (error.response && error.response.status === 404) {
        //         alert("존재하지 않는 회원입니다.");
        //     } else {
        //         alert("로그인 중 서버 오류가 발생했습니다.");
        //     }
        //     console.error(`${id} 로그인 및 토큰 저장 실패`, error);
        // }

    }
    


    // //로그인 member 가져오기(session)
    // const [data, setData] = useState({})
    // const getData = async() => {
    //     try {
    //         //DB에서 아이디가 같은 회원 데이터 검색
    //         const res = await axios.get(`http://localhost:8080/member/user2`)
    //         console.log(res.data)
    //         setData(res.data)
            
    //         return true
    //     } catch (error) {
    //         console.error("member 데이터 가져오기 실패", error)
    //         alert("member 데이터 가져오기 실패")
    //         return false
    //     }
    // }


    // useEffect(() => {
    //     getData();
    // }, [])



    return (
        <div>
            Login 페이지
            
            <h1>로고</h1>  {/* Link */}

            <h2>회원 로그인</h2>


            <form>
                {/* 아이디 */}
                <div>
                    <input type='text' value={id} id='id' name='id' placeholder='아이디' onChange={changeInput}/>
                    {/* <input type='text' {...register('id')} placeholder='아이디'/>
                    {errors.id && <p>{errors.id.message}</p>} */}
                </div>

                {/* 비밀번호 */}
                <div>
                    <input type='password' value={password} id='password' name='password' placeholder='비밀번호' onChange={changeInput}/>
                    {/* <input type='password' {...register('password')} placeholder='비밀번호'/>
                    {errors.password && <p>{errors.password.message}</p>} */}
                </div>
            </form>


            <article>
                <p> <input type='checkbox'/>로그인 상태 유지 </p>
                <p>
                    <span>아이디 찾기</span>
                    <span>비밀번호 찾기</span>
                </p>  {/* Link */}
            </article>

            {/* 기타 에러 메세지 */}
            {/* <div>
                <p>기타 에러가 있을 경우 아래에 보여집니다.</p>
                {errors.errorMsg && <p>{errors.errorMsg.message}</p>}
            </div> */}


            {/* 로그인 성공 메세지 */}
            {/* <div>
                {successLogin.status===true && <p>{successLogin.message}</p>}
            </div> */}


            <button onClick={onSubmit}>로그인</button>
            {/* <button onClick={handleSubmit(onSubmit)}>로그인</button> */}


            
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




            {/* =================================================== */}
            {/* 로그인한 member 데이터 뿌려주기 (session) */}
            {/* <h4>로그인한 member 데이터 (session)</h4>
            <ul>
                <li>memberId: {data.memberId}</li>
                <li>id: {data.id}</li>
                <li>password: {data.password}</li>
                <li>name: {data.name}</li>
                <li>email: {data.email}</li>
                <li>phone: {data.phone}</li>
                <li>role: {data.role}</li>
                <li>regNo: {data.regNo}</li>
                <li>createdAt: {data.createdAt}</li>
                <li>updatedAt: {data.updatedAt}</li>
            </ul> */}


            <button onClick={() => history.push("/member/logout")}>로그아웃</button>  {/* <Link to="/oauth2/authorization/naver"></Link> */}


            
        </div>
    );
};

export default Login;