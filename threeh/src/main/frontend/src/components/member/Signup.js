import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import icon_google from '../../assets/icon_google.png';
import icon_kakao from '../../assets/icon_kakao.png';
import icon_naver from '../../assets/icon_naver.png';
import Header from '../main/Header';

//Signup 전용 CSS 임포트
import '../../css/memberPageCss/signup.css';

// 회원가입 선택 페이지
const Signup = () => {

    const navigate = useNavigate();


    return (
        <div>
            {/* Header 영역 */}
            <div className="main-header">
                <Header/>
            </div>


            <div className="signup-select-container">
                {/* 안내 타이틀 */}
                <h2 className="signup-select-title">회원가입 방법을 선택하세요.</h2>


                {/* 자체 회원가입 실행 블록 */}
                <div className="signup-method-box">
                    <button 
                        className="signup-btn-site" 
                        onClick={() => navigate("/signup_site")}
                    >
                        사이트 회원가입
                    </button>
                </div>


                {/* ===================oauth2 소셜 회원가입=================== */}
                <article>
                    {/* 시안의 수평 분할 라인 존 - 상단 ( —— OR —— ) */}
                    <div className="signup-divider-zone">
                        <hr className="signup-divider-line1"/>
                        <span className="signup-divider-text">OR</span>
                        <hr className="signup-divider-line1"/>
                    </div>
                    
                    {/* OAuth2 연동 소셜 회원가입 아이콘 그룹 */}
                    <div className="signup-social-wrapper">
                        <Link to="http://localhost:8080/oauth2/authorization/google" className="signup-social-item">
                            <img src={icon_google} alt='구글 회원가입' className="signup-social-img" />
                        </Link>
                        
                        <Link to="http://localhost:8080/oauth2/authorization/naver" className="signup-social-item">
                            <img src={icon_naver} alt='네이버 회원가입' className="signup-social-img" />
                        </Link>
                        
                        <Link to="http://localhost:8080/oauth2/authorization/kakao" className="signup-social-item">
                            <img src={icon_kakao} alt='카카오 회원가입' className="signup-social-img" />
                        </Link>
                    </div>

                    {/* 시안의 수평 분할 라인 존 - 하단 ( ——--—— ) */}
                    <div className="signup-divider-zone">
                        <hr className="signup-divider-line1"/>
                    </div>
                </article>


                {/* 하단 푸터 영역: 기존 회원 로그인 리다이렉션 라인 */}
                <p className="signup-select-footer">
                    이미 쇼핑몰 회원이세요? 
                    <Link to="/login" className="signup-select-footer-link">로그인</Link>
                </p>

            </div>
        </div>
    );
};

export default Signup;