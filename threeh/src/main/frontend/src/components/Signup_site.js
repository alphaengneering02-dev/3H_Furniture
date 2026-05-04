import React, { useState } from 'react';

const Signup_site = () => {

    const [form, setForm] = useState({
        id: "", password1: "", password2: "", name: "", phone: "", email: "", regNo: ""
    })
    const {id, password1, password2, name, phone, email, regNo} = form

    const [emailId, setEmailId] = useState()
    const [emailSite, setEmailSite] = useState()
    setForm({
        ...form,
        email: emailId + "@" + setEmailSite
    });


    return (
        <div>
            Signup_site 페이지
            
            <h1>로고</h1>

            <h2>사이트 회원가입</h2>


            <article>
                {/* 아이디 */}
                <div>
                    <input type='text' value={id} id='id' name='id' placeholder='아이디'/>
                </div>

                {/* 비밀번호 */}
                <div>
                    <input type='password' value={password1} id='password1' name='password1' placeholder='비밀번호'/>
                </div>

                {/* 비밀번호 재확인 */}
                <div>
                    <input type='password' value={password2} id='password2' name='password2' placeholder='비밀번호 재확인'/>
                </div>


                {/* 이름 또는 회사명 */}
                <div>
                    <input type='text' value={name} id='name' name='name' placeholder='이름 또는 회사명'/>
                </div>

                {/* 전화번호 또는 사업장 전화번호 */}
                <div>
                    <input type='tel' value={phone} id='phone' name='phone' placeholder='전화번호 또는 사업장 전화번호'/>
                </div>
                
                {/* 이메일 */}
                <div>
                    <div>
                        <input type='text' value={emailId} id='emailId' name='emailId' placeholder='이메일'/>
                    </div>
                    @
                    <div>
                        <input type='text' value={emailSite} id='emailSite' name='emailSite' placeholder='사이트'/>
                    </div>
                    
                    <select>
                        <option disabled>사이트</option>
                        <option>gmail</option>
                        <option>naver</option>
                    </select>
                </div>

                {/* 주민등록번호 */}
                <div>
                    <input type='text' value={regNo} id='regNo' name='regNo' placeholder='주민등록번호'/>
                </div>
            </article>


            
            <article>
                <button>취소</button>
                <button>회원가입</button>
            </article>


            
        </div>
    );
};

export default Signup_site;