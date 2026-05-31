import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import icon_search from '../../assets/icon_search.png';
import icon_hamburger from '../../assets/icon_hamburger.png';
import icon_facebook from '../../assets/icon_facebook.png';
import icon_instagram from '../../assets/icon_instagram.png';
import icon_kakao from '../../assets/icon_kakao.png';
import icon_dashboard from '../../assets/icon_dashboard.png';
import icon_product from '../../assets/icon_product.png';
import icon_mypage from '../../assets/icon_mypage.png';
import icon_cart from '../../assets/icon_cart.png';
import icon_logout from '../../assets/icon_logout.png';
import icon_login from '../../assets/icon_login.png';
import icon_signup from '../../assets/icon_signup.png';
import logo_header from '../../assets/logo_header.png';
import axios, { all } from 'axios';
import Header_searchCondition from './Header_searchCondition';
import { useToast } from '../../hook/useToast';
import { useSearch } from '../../hook/SearchContext'; // 검색관련 Context 임포트

// 헤더
const Header = () => {
    const navigate = useNavigate();
    const { success, error, warn, info} = useToast();
    const {
        searchValue, changeSearchValue,
        doSearch
    } = useSearch()  // Context에서 전역 검색상태 가져오기

    const [user, setUser] = useState({});  //로그인한 회원정보 저장객체


    const getSession = () => {
        try {
            //회원정보 저장객체 초기화
            setUser(null)

            //sessionStorage에서 회원정보를 가져옴
            const rawData = sessionStorage.getItem("user")
            if(!rawData) return

            const sessionData = JSON.parse(rawData)  //JSON ---> 객체 형태
            setUser(sessionData)

            console.log("[로그인 데이터 로드 완료]"  + "\n"
                + rawData
            )
            // debugger;  //디버깅 모드 on

        } catch (error) {
            console.error("[로그인 데이터 로드 실패]", error)
        }
    }


    useEffect(() => {
        getSession()
    }, [])


    //로그아웃
    const logout = async() => {
        try {
            //로그아웃 요청
            await axios.post("http://localhost:8080/api/member/logout")
            
            //로그아웃 성공 후, 프론트 세션 삭제
            sessionStorage.clear()
            setUser(null) // 상태 초기화
            console.log("로그아웃 성공!")
            info("로그아웃 되었습니다.")
            
            //메인 페이지로 이동
            setTimeout(() => {
                navigate("/")
            }, 400);
        } catch (error) {
            console.error("로그아웃 실패! 서버 연결 실패 혹은 네트워크 오류:", error)
        }

    }


    //==================검색==================
    //검색 조건창 열림 상태
    const [isSearchCondition, setIsSearchCondition] = useState(false)
    const toggleSearchCondition = () => {
        setIsSearchCondition(!isSearchCondition)
    }


    //엔터키로 검색하기
    const onEnter = (evt) => {
        if(evt.key==='Enter') {
            evt.preventDefault();  //브라우저의 기본 폼 제출(새로고침) 방지
            doSearch(evt)
        }
    }



    return (
        <header>
            <div>
                {/* 1. 상단 레이아웃 박스 */}
                <section className="main-header-topBox">
                    {/* 좌측 브랜드 로고 및 검색바 영역 */}
                    <div className="main-header-left">
                        <h1 className='main-header-logo'> 
                            <Link to="/">
                                <img src={logo_header} alt="CMYK logo"/>
                            </Link> 
                        </h1>
                    </div>


                    {/* 우측 사용자 메뉴 영역 */}
                    <div className="main-header-right">
                        <ul className="main-header-userMenu">
                            {
                                user && user!=null
                                //로그인 한 상태의 화면
                                ? (
                                    <>
                                        {
                                            user.adLoginId && user.adLoginId!=null
                                            ? (  //어드민 계정
                                                <>
                                                    <li>
                                                        <Link to="/admin">
                                                            <img src={icon_dashboard} alt="관리자 대시보드"/>
                                                            <p>관리자 대시보드</p>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/item">
                                                            <img src={icon_product} alt="관리자 상품관리"/>
                                                            <p>관리자 상품관리</p>
                                                        </Link>
                                                    </li>
                                                </>
                                            )
                                            : (  //일반 유저 계정
                                                <>
                                                    <li>
                                                        <Link to="/cart">
                                                            <img src={icon_cart} alt="장바구니" className='main-cart-image'/>
                                                            <p>장바구니</p>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/mypage">
                                                            <img src={icon_mypage} alt="마이페이지" className='main-mypage-image'/>
                                                            <p>마이페이지</p>
                                                        </Link>
                                                    </li>
                                                </>
                                            )
                                        }

                                        
                                        
                                        <li>
                                            <Link onClick={logout}>
                                                <img src={icon_logout} alt="로그아웃" className='main-logout-image'/>
                                                <p>로그아웃</p>
                                            </Link>
                                        </li>
                                    </>
                                )
                                //로그인 안한 상태의 화면
                                : (
                                    <>
                                        <li>
                                            <Link to="/login">
                                                <img src={icon_login} alt="로그인" className='main-login-image'/>
                                                <p>로그인</p>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/signup">
                                                <img src={icon_signup} alt="회원가입"/>
                                                <p>회원가입</p>
                                            </Link>
                                        </li>
                                    </>
                                )
                            }
                        </ul>
                    </div>
                </section>



                {/* 2. 하단 네비게이션 박스(GNB) */}
                <section className="main-header-bottomBox">
                    <nav className="main-header-GNB">
                        <ul>
                            <li> <Link to="/">홈</Link> </li>
                            <li> <Link to="/item?category=거실">거실</Link> </li>
                            <li> <Link to="/item?category=침실">침실</Link> </li>
                            <li> <Link to="/item?category=주방">주방</Link> </li>
                            <li> <Link to="/item?category=욕실">욕실</Link> </li>
                        </ul>
                    </nav>


                    <div className="main-header-search">
                        <form method="get">
                            {/* 검색창 */}
                            <section className='main-header-bar'>
                                <button type="button" id="do" className="do">
                                    <img 
                                        src={icon_search} alt="검색" 
                                        onClick={doSearch}
                                    />
                                </button>
                                <input className='input'
                                    type="text" 
                                    id={searchValue} name={searchValue} value={searchValue} 
                                    placeholder="검색어를 입력하세요" 
                                    onChange={changeSearchValue} 
                                    onKeyDown={onEnter}
                                />
                                <button type="button" className="hamburger">
                                    <img 
                                        src={icon_hamburger} alt="검색조건 선택창" 
                                        onClick={toggleSearchCondition}
                                    />
                                </button>
                            </section>


                            {/* 검색조건 선택창 팝업 */}
                            { isSearchCondition && <Header_searchCondition/> }
                        </form>
                    </div>
                </section>
            </div>  {/* <!-- 헤더 이너 끝 --> */}
        </header>
    );
};

export default Header;