import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import icon_facebook_brown from '../../assets/icon_facebook_brown.png';
import icon_instagram_brown from '../../assets/icon_instagram_brown.png';
import icon_kakao_brown from '../../assets/icon_kakao_brown.png';
import icon_kakao2 from '../../assets/icon_kakao2.png';

const Footer = () => {
    return (
        // <footer>
        //     <div className="main-footer-content">
        //         <p className="main-footer-logo">PROJECT CMYK</p>
        //         <p className="main-footer-info">주식회사 씨엠와이케이 | 공동 프로젝트 팀 | 경기도 수원시 팔달구</p>
        //         <p className="main-footer-copy">© 2026 PROJECT CMYK. All Rights Reserved.</p>
        //     </div>
        // </footer>


        <footer>
            <section className="main-footer-content">
                <article className='main-footer-content-top'>
                    <div className="main-footer-content-left main-footer-logo">
                        <Link to="/">
                            <img src={logo} alt="CMYK logo"/>
                        </Link> 
                    </div>

                    <div className="main-footer-content-center main-footer-menu">
                        <ul className='menus menu1'>
                            <li>ABOUT</li>
                            <li> 회사소개 </li>
                            <li> 매장안내 </li>
                            <li> 인재채용 </li>
                        </ul>

                        <ul className='menus menu2'>
                            <li>SUPPORT</li>
                            <li> 고객지원 </li>
                            <li> 서비스센터 </li>
                        </ul>

                        <ul className='menus menu3'>
                            <li>INFO</li>
                            <li> 이용약관 </li>
                            <li className='strong'> 개인정보 처리방침 </li>
                            <li> 윤리신고센터 </li>
                        </ul>
                    </div>

                    <div className='main-footer-content-right main-footer-cs'>
                        <div className='csmenus csmenu1'>
                            <p>빠른 상담문의</p>
                            <button>AI 챗봇</button>
                        </div>
                        <div className='csmenus csmenu2'>
                            <p>서비스 문의 및 신청</p>
                            <button>3H 서비스센터 바로가기</button>
                        </div>
                        <div className='csmenus csmenu3'>
                            <p>고객센터 전화문의</p>
                            <div className='csmenu3-info'>
                                <span>
                                    1577-1577
                                    <button><img src={icon_kakao2} alt='카카오톡'/></button>
                                </span>
                                <span>평일&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;9:00 ~ 17:00 (점심시간 12:40 ~ 13:40)</span>
                                <span>토요일&nbsp;9:00 ~ 12:40 (A/S 관련 상담만 진행)</span>
                            </div>
                        </div>
                    </div>
                </article>


                <article className='main-footer-content-bottom'>
                    <ul className='main-footer-content-left main-footer-sns'>
                        <li>
                            <Link to="https://www.facebook.com"><img src={icon_facebook_brown} alt="facebook" /></Link>
                        </li>
                        <li>
                            <Link to="https://www.instagram.com"><img src={icon_instagram_brown} alt="instagram" /></Link>
                        </li>
                        <li>
                            <Link to="https://pf.kakao.com/_TsIAE"><img src={icon_kakao_brown} alt="kakao" /></Link>
                        </li>
                    </ul>

                    <ul className="main-footer-content-center main-footer-info">
                        <li>경기도 수원시 팔달구 중부대로 104 (인계동 208-6) (주)씨엠와이케이·대표이사 김승우</li>
                        <li>개인정보보호 책임자: 김승우</li>
                        <li>공동 프로젝트 팀</li>
                        <li>호스팅 서비스사업자·(주)씨엠와이케이</li>
                        <li>© 2026 PROJECT CMYK. All Rights Reserved.</li>
                    </ul>

                    <div className='main-footer-content-right main-footer-blank'></div>
                </article>
            </section>
        </footer>
    );
};

export default Footer;