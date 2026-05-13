import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Signup_site = () => {

    const navigate = useNavigate();


    //회원가입 member 보내기(request)
    const { register, handleSubmit, setError, clearErrors, formState: {errors} } = useForm();  //유효성 검사(validation) 활성화 : 각 입력 필드 등록, 폼 제출 함수 정의, 에러 setter, validation 에러 객체

    const [emailId, setEmailId] = useState("")  //입력값 상태
    const [emailSite, setEmailSite] = useState("")
    const [isReadOnly, setIsReadOnly] = useState(true); // readOnly 상태

    const changeEmailId = (evt) => {
        setEmailId(evt.target.value)
        clearErrors("email")
    }

    const inputYourself = (evt) => {
        setEmailSite(evt.target.value)
        clearErrors("email")
    }
    const changeEmailSite = (evt) => {
        const value = evt.target.value;

        if (value === "inputYourself") {  // '직접입력'을 선택한 경우
            setIsReadOnly(false)
            setEmailSite("")
        } else {  // 나머지 특정 사이트를 선택한 경우
            setIsReadOnly(true)
            setEmailSite(value)
        }

        clearErrors("email")
    };



    const onSubmit = async(member) => {

        //기존 에러 모두 제거
        clearErrors()


        //백엔드 서버로 전송할 데이터 (JSON 형태)
        const req = {
            ...member,
            email: `${emailId}@${emailSite}`  //emailId와 emailSite를 조합하여 email 변수 생성
        }
        console.log("서버로 보내는 데이터: " + JSON.stringify(req))


        //데이터 전송
        try {
            const res = await axios.post(`http://localhost:8080/api/member/signup`, req)

            console.log("member 데이터 전송 성공!", res)
            navigate("/")  //메인으로 리다이렉트
        } catch (error) {
            //백엔드 컨트롤러에서 보낸 errorMap(JSON) 데이터 세팅 (예: {id: "아이디는 필수입니다."})
            if (error.response && error.response.data) {
                const errorData = error.response.data; 

                //error 객체에 Key(필드명)와 Value(에러메세지)를 넣어줌
                Object.keys(errorData).forEach(key => {
                    setError(key, { type: "server", message: errorData[key] })
                })
                console.error("member 데이터 전송 실패!", errorData)
                return
            }

            //기타 통신 에러
            setError("global", { type: "server", message: "서버와 연결할 수 없습니다." })
            console.error("서버와 연결할 수 없습니다.", error)
        }

    }


    //유효성 검사에 실패한 필드를 찾음
    const onInvalid = (errors) => {
        console.error("유효성 검사 실패 필드: ", errors);
        Object.keys(errors).forEach((key) => {
            console.log(`필드명: ${key}, 에러종류: ${errors[key].type}, 메시지: ${errors[key].message}`)
        })
    }



    return (
        <div>
            Signup_site 페이지
            
            <h1> <Link to="/">로고</Link> </h1>

            <h2>사이트 회원가입</h2>


            <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
                {/* 아이디 */}
                <div>
                    <input type='text' {...register('id')} placeholder='아이디'/>
                    {errors.id && <p>{errors.id.message}</p>}
                </div>

                {/* 비밀번호 */}
                <div>
                    <input type='password' {...register('password1')} placeholder='비밀번호'/>
                    {errors.password1 && <p>{errors.password1.message}</p>}
                </div>

                {/* 비밀번호 재확인 */}
                <div>
                    <input type='password' {...register('password2')} placeholder='비밀번호 재확인'/>
                    {errors.password2 && <p>{errors.password2.message}</p>}
                </div>


                {/* 이름 또는 회사명 */}
                <div>
                    <input type='text' {...register('name')} placeholder='이름 또는 회사명'/>
                    {errors.name && <p>{errors.name.message}</p>}
                </div>

                {/* 전화번호 또는 사업장 전화번호 */}
                <div>
                    <input type='tel' {...register('phone')} placeholder='전화번호 또는 사업장 전화번호'/>
                    {errors.phone && <p>{errors.phone.message}</p>}
                </div>
                
                {/* 이메일 */}
                <div>
                    <div>
                        <input type='text' value={emailId} id='emailId' name='emailId' onChange={changeEmailId} placeholder='이메일'/>
                    </div>
                    @
                    <div>
                        <input type='text' value={emailSite} id='emailSite' name='emailSite' onChange={inputYourself} placeholder='사이트' readOnly={isReadOnly}/>
                    </div>
                    
                    <select onChange={changeEmailSite}>
                        <option selected disabled>사이트</option>
                        <option id="gmail" name="gmail" value="gmail.com">gmail</option>
                        <option id="naver" name="naver" value="naver.com">naver</option>
                        <option value="inputYourself">직접입력</option>
                    </select>

                    {errors.email && <p>{errors.email.message}</p>}
                </div>

                {/* 주민등록번호 */}
                <div>
                    <input type='text' {...register('regNo')} placeholder='주민등록번호'/>
                    {errors.regNo && <p>{errors.regNo.message}</p>}
                </div>


                <article>
                    <button onClick={() => navigate("/signup")}>취소</button>
                    <button type='submit'>회원가입</button>
                </article>
            </form>
            

            {/* 기타 에러 메세지 */}
            <div>
                <p>기타 에러가 있을 경우 아래에 보여집니다.</p>
                {errors.global && <p>{errors.global.message}</p>}
                {errors.others && <p>{errors.others.message}</p>}
            </div>


            
        </div>
    );
};

export default Signup_site;