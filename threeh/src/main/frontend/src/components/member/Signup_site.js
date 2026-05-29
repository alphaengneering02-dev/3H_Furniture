import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../main/Header';

//Signup_site 전용 CSS 임포트
import '../../css/memberPageCss/signup_site.css';

const Signup_site = () => {

    const navigate = useNavigate();


    //회원가입 전송용 react-hook-form 세팅
    const { register, handleSubmit, setError, clearErrors, formState: {errors}, setValue } = useForm();  //각 입력 필드, 폼 제출 함수 정의, 에러 setter, validation 에러 객체


    //이메일+사이트 주소 입력창
    const [emailId, setEmailId] = useState("")  //입력값 상태
    const [emailSite, setEmailSite] = useState("")
    const [isReadOnly, setIsReadOnly] = useState(true); // readOnly 상태

    const changeEmailId = (evt) => {
        setEmailId(evt.target.value)
        clearErrors("email")
    }

    const inputYourself = (evt) => {
        const cleanValue = formatInput("emailSite", evt.target.value)
        setEmailSite(cleanValue)
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



    //입력값 필터링, 길이제한, 포맷팅
    const formatInput = (name, value) => {
        let cleanValue = ""

        //1) 사이트 주소
        if(name==='emailSite') {
            //영문만 남기기
            cleanValue = value.replace(/[^a-zA-Z.]/g, "")
            return cleanValue;
        }


        //2) 주민등록번호 (XXXXXX-XXXXXXX 형식)
        if(name==='regNo') {
            //숫자만 남기기
            cleanValue = value.replace(/[^0-9]/g, "")

            //13자리 제한 (13자리까지만 자름)
            if (cleanValue.length > 13) {
                cleanValue = cleanValue.substring(0, 13)
            }

            //XXXXXX-XXXXXXX 형식으로 포맷팅
            if (cleanValue.length > 6) {
                return `${cleanValue.substring(0, 6)}-${cleanValue.substring(6)}`;
            }

            return cleanValue
        }

        return value
    }



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
            {/* Header 영역 */}
            <div className="main-header">
                <Header/>
            </div>


            <div className="signup-container">
                <h2 className="signup-title">사이트 회원가입</h2>


                <form className="signup-form" onSubmit={handleSubmit(onSubmit, onInvalid)}>
                    {/* 아이디 필드 */}
                    <div className="signup-input-group">
                        <input 
                            type='text' 
                            {...register('id')} 
                            placeholder='아이디' 
                            className="signup-input-field"
                        />
                        {errors.id && <p className="signup-error-msg">{errors.id.message}</p>}
                    </div>

                    {/* 비밀번호 필드 */}
                    <div className="signup-input-group">
                        <input 
                            type='password' 
                            {...register('password1')} 
                            placeholder='비밀번호' 
                            className="signup-input-field"
                        />
                        {errors.password1 && <p className="signup-error-msg">{errors.password1.message}</p>}
                    </div>

                    {/* 비밀번호 재확인 필드 */}
                    <div className="signup-input-group">
                        <input 
                            type='password' 
                            {...register('password2')} 
                            placeholder='비밀번호 재확인' 
                            className="signup-input-field"
                        />
                        {errors.password2 && <p className="signup-error-msg">{errors.password2.message}</p>}
                    </div>


                    {/* 이름 또는 회사명 필드 */}
                    <div className="signup-input-group">
                        <input 
                            type='text' 
                            {...register('name')} 
                            placeholder='이름 또는 회사명' 
                            className="signup-input-field"
                        />
                        {errors.name && <p className="signup-error-msg">{errors.name.message}</p>}
                    </div>

                    {/* 전화번호 필드 */}
                    <div className="signup-input-group">
                        <input 
                            type='tel' 
                            {...register('phone')} 
                            placeholder='전화번호 또는 사업장 전화번호' 
                            className="signup-input-field"
                        />
                        {errors.phone && <p className="signup-error-msg">{errors.phone.message}</p>}
                    </div>
                    
                    {/* 이메일 주소 결합형 필드 */}
                    <div className="signup-input-group">
                        <div className="signup-email-row">
                            <div className="signup-email-cell cell-id">
                                <input 
                                    type='text' 
                                    value={emailId} 
                                    id='emailId' 
                                    name='emailId' 
                                    onChange={changeEmailId} 
                                    placeholder='이메일' 
                                    className="signup-email-field"
                                />
                            </div>
                            <div className="signup-email-cell cell-at">@</div>
                            <div className="signup-email-cell cell-site">
                                <input 
                                    type='text' 
                                    value={emailSite} id='emailSite' name='emailSite' 
                                    onChange={inputYourself} 
                                    placeholder='사이트 주소' 
                                    readOnly={isReadOnly}
                                    className="signup-email-field"
                                />
                            </div>
                            
                            <div className="signup-email-cell cell-select">
                                <select onChange={changeEmailSite} className="signup-email-select">
                                    <option selected disabled>사이트</option>
                                    <option id="gmail" name="gmail" value="gmail.com">gmail</option>
                                    <option id="naver" name="naver" value="naver.com">naver</option>
                                    <option value="inputYourself">직접입력</option>
                                </select>
                            </div>
                        </div>

                        {errors.email && <p>{errors.email.message}</p>}
                    </div>

                    {/* 주민등록번호 필드 */}
                    <div className="signup-input-group">
                        <input 
                            type='text' 
                            {...register('regNo')} 
                            placeholder='주민등록번호' 
                            className="signup-input-field"
                            maxLength={14} //13자리+하이픈 제한 지정
                            onChange={(evt) => {
                                const formattedValue = formatInput('regNo', evt.target.value)  //1. 입력된 값을 포맷팅 함수에 통과시킴
                                setValue('regNo', formattedValue)  //2. 포맷팅된 값을 react-hook-form 상태와 input value에 덮어씌움
                            }}
                        />
                        {errors.regNo && <p className="signup-error-msg">{errors.regNo.message}</p>}
                    </div>


                    {/* 취소 / 회원가입 하단 버튼 컴포넌트군 */}
                    <article className="signup-action-group">
                        <button onClick={() => navigate("/signup")} className="signup-btn-cancel">취소</button>
                        <button type='submit' className="signup-btn-submit">회원가입</button>
                    </article>
                </form>
                

                {/* 글로벌 핸들러 혹은 서버 네트워크 통신 예외 에러메세지 */}
                {(errors.global || errors.others) && (
                    <div className="signup-global-error-box">
                        {errors.global && <p>{errors.global.message}</p>}
                        {errors.others && <p>{errors.others.message}</p>}
                    </div>
                )}
            </div>

        </div>

    );
};

export default Signup_site;