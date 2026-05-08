import React from 'react';

// 회원가입 선택 페이지
const Signup = () => {


    return (
        <div>
            Signup 페이지

            <h1>로고</h1>

            <h2>회원가입 방법을 선택하세요.</h2>


            {/* 자체 회원가입 */}
            <button>사이트 회원가입</button>


            {/* oauth2 소셜 로그인 */}
            <article>
                <hr/>
                or
                <hr/>

                <div>
                    <p> 구글 </p>
                    <p> 네이버 </p>
                    <p> 카카오 </p>
                </div>

                <hr/>
            </article>


            <p>이미 쇼핑몰 회원이세요? 로그인</p>

        </div>
    );
};

export default Signup;