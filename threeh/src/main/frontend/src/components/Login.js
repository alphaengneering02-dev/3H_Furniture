import React, { useState } from 'react';

const Login = () => {

    const [form, setForm] = useState({
        id: "", password: ""
    })
    const {id, password} = form


    return (
        <div>
            Login 페이지
            
            <h1>로고</h1>

            <h2>회원 로그인</h2>


            <article>
                {/* 아이디 */}
                <div>
                    <input type='text' value={id} id='id' name='id' placeholder='아이디'/>
                </div>

                {/* 비밀번호 */}
                <div>
                    <input type='password' value={password} id='password1' name='password1' placeholder='비밀번호'/>
                </div>
            </article>


            <article>
                <p> <input type='checkbox'/>로그인 상태 유지 </p>
                <p> 아이디 찾기 | 비밀번호 찾기 </p>
            </article>


            <button>로그인</button>


            
            {/* oauth2 소셜 로그인 */}
            <div>
                <p> 구글 </p>
                <p> 네이버 </p>
                <p> 카카오 </p>
            </div>



            <article>
                <p>계정이 없으신가요? 지금 바로 만들어 보세요.</p>
                <button>회원가입</button>
            </article>

            
        </div>
    );
};

export default Login;