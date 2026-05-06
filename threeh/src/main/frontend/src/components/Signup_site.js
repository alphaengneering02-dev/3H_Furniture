import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const Signup_site = () => {

    //member 데이터 보내기(request)
    const { register, handleSubmit, setError, formState: {errors} } = useForm();  //유효성 검사(validation) 활성화 : 각 입력 필드 등록, 폼 제출 함수 정의, 에러 객체, 외부 validation form 사용시 추가

    /*
    const [form, setForm] = useState({
        id: "", password1: "", password2: "", name: "", phone: "", regNo: ""
    })
    const {id, password1, password2, name, phone, regNo} = form

    const changeInput = (evt) => {
        const {value, name} = evt.target
        setForm({
            ...form,
            [name]: value
        })
        //emailId, emailSite도 같이 변경됨
    }
     */

    const [emailId, setEmailId] = useState("")
    const [emailSite, setEmailSite] = useState("")

    const changeEmailId = (evt) => {setEmailId(evt.target.value)}
    const changeEmailSite = (evt) => {setEmailSite(evt.target.value)}


    const onSubmit = async(member) => {
        alert("test1")

        //백엔드 서버로 전송할 데이터
        const req = {
            ...member,
            email: `${emailId}@${emailSite}`  //emailId와 emailSite를 조합하여 email 변수 생성
        }
        console.log("서버로 보내는 데이터: " + JSON.stringify(req))


        //데이터 전송
        try {
            alert("test3")
            const res = await axios.post(`http://localhost:8080/member/signup`, req, {
                headers: {
                    'Content-Type': 'application/json' // 명시적으로 지정 (보통 axios가 자동으로 해줌)
                }
            });
            console.log("전송 성공!", res);
            alert("test4")
        } catch (error) {
            //백엔드에서 온 Validation 에러 처리
            alert("testA")
            if (error.response && error.response.data) {
                const validationErrors = error.response.data; //예: {id: "아이디는 필수입니다."}
                Object.keys(validationErrors).forEach(  //validationErrors를 error 객체로 변환
                    key => {setError(key, {message: validationErrors[key]});
                });
            }
            alert("testB")

            console.error("전송 실패!", error);
        }

    }







    //member 데이터 가져오기(response)
    const [data, setData] = useState({})
    const getData = async() => {
        try {
            //DB에서 아이디가 같은 회원 데이터 검색
            const res = await axios.get(`http://localhost:8080/member/user2`)
            console.log(res.data)
            setData(res.data)
            
            return true
        } catch (error) {
            console.error("사용자 데이터 가져오기 실패", error)
            alert("사용자 데이터 가져오기 실패")
            return false
        }
    }


    useEffect(() => {
        getData();
    }, [])




    return (
        <div>
            Signup_site 페이지
            
            <h1>로고</h1>

            <h2>사이트 회원가입(request)</h2>


            <form>  {/* onChange={changeInput} */}
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
                        <input type='text' value={emailSite} id='emailSite' name='emailSite' onChange={changeEmailSite} placeholder='사이트'/>
                    </div>
                    
                    <select onChange={changeEmailSite}>
                        <option disabled selected>사이트</option>
                        <option value="gmail.com">gmail</option>
                        <option value="naver.com">naver</option>
                        <option>직접입력</option>
                    </select>

                    {errors.email && <p>{errors.email.message}</p>}
                </div>

                {/* 주민등록번호 */}
                <div>
                    <input type='text' {...register('regNo')} placeholder='주민등록번호'/>
                    {errors.regNo && <p>{errors.regNo.message}</p>}
                </div>
            </form>


            
            <article>
                <button>취소</button>
                <button onClick={handleSubmit(onSubmit)}>회원가입</button>
            </article>



            {/* =================================================== */}
            {/* member 데이터 뿌려주기 */}
            <h4>백엔드 서버에서 넘어온 데이터(response)</h4>
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
            </ul>


            
        </div>
    );
};

export default Signup_site;