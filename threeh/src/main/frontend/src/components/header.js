import React from 'react';

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
                            <li> <link to="#" target="_blank"><img src="" alt="sns 바로가기1"/></link> </li>
                            <li> <link to="#" target="_blank"><img src="" alt="sns 바로가기2"/></link> </li>
                            <li> <link to="#" target="_blank"><img src="" alt="sns 바로가기3"/></link> </li>
                        </ul>   {/* sns 끝 */}
                    </div>


                    {/* <!-- 중앙 영역 : 로고와 통합검색창 --> */}
                    <div class="center">
                        <h1> <link to="#"><img src="" alt="웹사이트 로고"/></link> </h1>

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
                                <link to="#">
                                    <img src="" alt="로그인"/>
                                    <p>로그인</p>
                                </link>
                            </li>
                            <li>
                                <link to="#">
                                    <img src="" alt="회원가입"/>
                                    <p>회원가입</p>
                                </link>
                            </li>
                        </ul>
                    </div>
                </section>



                {/* <!-- 하단 헤더: 네비게이션 바 --> */}
                <section class="bottomBox">
                    <nav class="GNB">
                        <ul>
                            {/* <!-- 메인메뉴1 --> */}
                            <li> <link to="#">홈</link> </li>


                            {/* <!-- 메인메뉴2 --> */}
                            <li>
                                <link to="#">거실</link>
                                <ul class="sub1">
                                    <li> <link to="#">서브메뉴1</link> </li>
                                    <li> <link to="#">서브메뉴2</link> </li>
                                    <li> <link to="#">서브메뉴3</link> </li>
                                    <li> <link to="#">서브메뉴4</link> </li>
                                </ul>
                            </li>


                            {/* <!-- 메인메뉴3 --> */}
                            <li>
                                <link to="#">침실</link>
                                <ul class="sub1">
                                    <li>
                                        <link to="#">서브메뉴1</link>
                                        <ul class="sub2">
                                            <li> <link to="#">서브-서브메뉴1</link> </li>
                                            <li> <link to="#">서브-서브메뉴2</link> </li>
                                            <li> <link to="#">서브-서브메뉴3</link> </li>
                                            <li> <link to="#">서브-서브메뉴4</link> </li>
                                        </ul>
                                    </li>
                                    
                                    <li>
                                        <link to="#">서브메뉴2</link>
                                        <ul class="sub2">
                                            <li> <link to="#">서브-서브메뉴1</link> </li>
                                            <li> <link to="#">서브-서브메뉴2</link> </li>
                                            <li> <link to="#">서브-서브메뉴3</link> </li>
                                            <li> <link to="#">서브-서브메뉴4</link> </li>
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