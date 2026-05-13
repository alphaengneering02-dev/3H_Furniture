import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import icon_google from '../../assets/icon_google.png';
import icon_kakao from '../../assets/icon_kakao.png';
import icon_naver from '../../assets/icon_naver.png';

// 회원가입 선택 페이지
const Signup = () => {

    const navigate = useNavigate();


    return (
        <div>
            Signup 페이지

            <h1> <Link to="/">로고</Link> </h1>

            <h2>회원가입 방법을 선택하세요.</h2>


            {/* 자체 회원가입 */}
            <button onClick={() => navigate("/signup_site")}>사이트 회원가입</button>


            {/* oauth2 소셜 로그인 */}
            <article>
                <hr/>
                or
                <hr/>
                
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

                <hr/>
            </article>


            <p>
                이미 쇼핑몰 회원이세요? 
                <Link to="/login">로그인</Link>
            </p>

        </div>
    );
};

export default Signup;