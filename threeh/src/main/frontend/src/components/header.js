import React from 'react';
import { Link } from "react-router-dom/cjs/react-router-dom";

// 헤더
const Header = () => {
    return (
        <header>
            <div class="inner">
                {/* 상단 헤더 */}
                <section class="topBox">
                    {/* 좌측 영역 : sns 바로가기 */}
                    <div class="left">
                        <ul class="sns">
                            <li> <Link to="#" target="_blank"><img src="" alt="sns 바로가기1"/></Link> </li>
                            <li> <Link to="#" target="_blank"><img src="" alt="sns 바로가기2"/></Link> </li>
                            <li> <Link to="#" target="_blank"><img src="" alt="sns 바로가기3"/></Link> </li>
                        </ul>   {/* sns 끝 */}
                    </div>


                    {/* <!-- 중앙 영역 : 로고와 통합검색창 --> */}
                    <div class="center">
                        <h1> <Link to="/"><img src="" alt="웹사이트 로고"/></Link> </h1>

                        <div class="totalSearch">
                            <form action="" method="get">
                                <button class="btnSearch" type="button"> <img src="" alt="검색하기"/> </button>
                                <input class="inputSearch" type="text" placeholder="검색어를 입력하세요"/>
                                <button class="hamSearch" type="button"> ▤ </button>
                            </form>
                        </div>
                    </div>


                    {/* <!-- 우측 영역 : 사용자 메뉴들(로그인, 회원가입) --> */}
                    <div class="right">
                        <ul class="userMenu">
                            <li>
                                <Link to="#">
                                    <img src="" alt="로그인"/>
                                    <p>로그인</p>
                                </Link>
                            </li>
                            <li>
                                <Link to="#">
                                    <img src="" alt="회원가입"/>
                                    <p>회원가입</p>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </section>



                {/* <!-- 하단 헤더: 네비게이션 바 --> */}
                <section class="bottomBox">
                    <nav class="GNB">
                        <ul>
                            {/* <!-- 메인메뉴1 --> */}
                            <li> <Link to="#">홈</Link> </li>


                            {/* <!-- 메인메뉴2 --> */}
                            <li>
                                <Link to="#">거실</Link>
                                <ul class="sub1">
                                    <li> <Link to="#">서브메뉴1</Link> </li>
                                    <li> <Link to="#">서브메뉴2</Link> </li>
                                    <li> <Link to="#">서브메뉴3</Link> </li>
                                    <li> <Link to="#">서브메뉴4</Link> </li>
                                </ul>
                            </li>


                            {/* <!-- 메인메뉴3 --> */}
                            <li>
                                <Link to="#">침실</Link>
                                <ul class="sub1">
                                    <li>
                                        <Link to="#">서브메뉴1</Link>
                                        <ul class="sub2">
                                            <li> <Link to="#">서브-서브메뉴1</Link> </li>
                                            <li> <Link to="#">서브-서브메뉴2</Link> </li>
                                            <li> <Link to="#">서브-서브메뉴3</Link> </li>
                                            <li> <Link to="#">서브-서브메뉴4</Link> </li>
                                        </ul>
                                    </li>
                                    
                                    <li>
                                        <Link to="#">서브메뉴2</Link>
                                        <ul class="sub2">
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
                        <div class="menuBg"></div>
                    </nav>
                </section>
            </div>  {/* <!-- 헤더 이너 끝 --> */}
        </header>
    );
};

export default Header;