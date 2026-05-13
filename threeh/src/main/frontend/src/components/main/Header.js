import React from 'react';
import { Link } from "react-router-dom";
import icon_search from '../../assets/image/icon_search.png';
import icon_hamburger from '../../assets/image/icon_hamburger.png';

// 헤더
const Header = () => {
    return (
        <header>
            <div className="inner">
                {/* 상단 헤더 */}
                <section className="topBox">
                    {/* 좌측 영역 : sns 바로가기 */}
                    <div className="left">
                        <ul className="sns">
                            <li> <Link to="#" target="_blank">
                                <img src={null} alt="페이스북 바로가기"/>
                            </Link> </li>
                            <li> <Link to="#" target="_blank">
                                <img src={null} alt="인스타그램 바로가기"/>
                            </Link> </li>
                            <li> <Link to="#" target="_blank">
                                <img src={null} alt="카카오톡 공식채널 바로가기"/>
                            </Link> </li>
                        </ul>   {/* sns 끝 */}
                    </div>


                    {/* <!-- 중앙 영역 : 로고와 통합검색창 --> */}
                    <div className="center">
                        <h1 className='logo'> 
                            <Link to="/"><img src={null} alt="웹사이트 로고"/></Link> 
                        </h1>

                        <div className="totalSearch">
                            <form action="" method="get">
                                <button className="btn" type="button">
                                    <img src={icon_search} alt="검색하기" style={{width: 20}}/>
                                </button>
                                <input className="input" type="text" placeholder="검색어를 입력하세요"/>
                                <button className="hamburger" type="button">
                                    <img src={icon_hamburger} alt="검색하기" style={{width: 20}}/>
                                </button>
                            </form>
                        </div>
                    </div>


                    {/* <!-- 우측 영역 : 사용자 메뉴들(로그인, 회원가입) --> */}
                    <div className="right">
                        <ul className="userMenu">
                            <li>
                                <Link to="/login">
                                    <img src={null} alt="로그인"/>
                                    <p>로그인</p>
                                </Link>
                            </li>
                            <li>
                                <Link to="/signup">
                                    <img src={null} alt="회원가입"/>
                                    <p>회원가입</p>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </section>



                {/* <!-- 하단 헤더: 네비게이션 바 --> */}
                <section className="bottomBox">
                    <nav className="GNB">
                        <ul>
                            {/* <!-- 메인메뉴1 --> */}
                            <li> <Link to="#">홈</Link> </li>


                            {/* <!-- 메인메뉴2 --> */}
                            <li>
                                <Link to="#">거실</Link>
                                <ul className="sub1">
                                    <li> <Link to="#">서브메뉴1</Link> </li>
                                    <li> <Link to="#">서브메뉴2</Link> </li>
                                    <li> <Link to="#">서브메뉴3</Link> </li>
                                    <li> <Link to="#">서브메뉴4</Link> </li>
                                </ul>
                            </li>


                            {/* <!-- 메인메뉴3 --> */}
                            <li>
                                <Link to="#">침실</Link>
                                <ul className="sub1">
                                    <li>
                                        <Link to="#">서브메뉴1</Link>
                                        <ul className="sub2">
                                            <li> <Link to="#">서브-서브메뉴1</Link> </li>
                                            <li> <Link to="#">서브-서브메뉴2</Link> </li>
                                            <li> <Link to="#">서브-서브메뉴3</Link> </li>
                                            <li> <Link to="#">서브-서브메뉴4</Link> </li>
                                        </ul>
                                    </li>
                                    
                                    <li>
                                        <Link to="#">서브메뉴2</Link>
                                        <ul className="sub2">
                                            <li> <Link to="#">서브-서브메뉴1</Link> </li>
                                            <li> <Link to="#">서브-서브메뉴2</Link> </li>
                                            <li> <Link to="#">서브-서브메뉴3</Link> </li>
                                            <li> <Link to="#">서브-서브메뉴4</Link> </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>

                        
                        {/* <!-- 배경색 박스 --> */}
                        <div className="menuBg"></div>
                    </nav>
                </section>
            </div>  {/* <!-- 헤더 이너 끝 --> */}
        </header>
    );
};

export default Header;