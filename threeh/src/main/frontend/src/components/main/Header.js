import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import icon_search from '../../assets/icon_search.png';
import icon_hamburger from '../../assets/icon_hamburger.png';
import icon_facebook from '../../assets/icon_facebook.png';
import icon_instagram from '../../assets/icon_instagram.png';
import icon_kakao from '../../assets/icon_kakao.png';
import icon_mypage from '../../assets/icon_mypage.png';
import icon_cart from '../../assets/icon_cart.png';
import icon_logout from '../../assets/icon_logout.png';
import icon_login from '../../assets/icon_login.png';
import icon_signup from '../../assets/icon_signup.png';
import axios, { all } from 'axios';
import Header_searchCondition from './Header_searchCondition';

// 헤더
const Header = () => {

    const navigate = useNavigate();


    //로그인한 회원정보 가져오기
    const [user, setUser] = useState({})  //회원정보 저장객체

    const getSession = () => {
        try {
            //회원정보 저장객체 초기화
            setUser(null)

            //sessionStorage에서 회원정보를 가져옴
            const rawData = sessionStorage.getItem("user")

            if(!rawData) {
                return
            }

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
            alert("로그아웃 되었습니다.")
            
            //메인 페이지로 이동
            navigate("/")
            
        } catch (error) {
            console.error("로그아웃 실패! 서버 연결 실패 혹은 네트워크 오류:", error)
        }

    }



    //상품 통합검색
    //검색어 입력
    const [searchValue, setSearchValue] = useState("")  //String값
    const changeSearchValue = (evt) => {setSearchValue(evt.target.value)}

    //검색 조건 선택
    /*
    searchKey (다중 선택 가능)
    - category: [거실, 침실, 주방...] 
    - color: [책상, 의자, 책꽃이...]
    */
    const [searchKey, setSearchKey] = useState({
        "category": [],
        "color": [],
    })  //객체

    const [isSearchCondition, setIsSearchCondition] = useState(false)
    const toggleSearchCondition = () => {
        setIsSearchCondition(!isSearchCondition)
    }


    //검색 함수
    const doSearch = async() => {

        try {
            //1. Query String 생성 (예: ?searchValue=책상&space=거실,침실&size=1,6)
            const params = new URLSearchParams()  //파라미터를 생성하는 훅

            if (searchValue.trim() !== "") {  //parameter - 검색어
                params.append("searchValue", searchValue);
            }

            Object.keys(searchKey).forEach(key => {  //parameter - 다중 검색 조건(searchKey)을 순회하며 파라미터에 추가
                const value = searchKey[key];  //검색조건 배열
                
                if (value.length > 0) {  //유효한 값들만 params에 쉼표(,)로 연결해 추가 (예: ["거실", "주방"])
                    params.append(key, value.join(','))
                }
            })


            //2. 완성된 Query String 확인 (디버깅용)
            const queryString = params.toString()
            console.log("현재 searchKey 상태:", searchKey);
            console.log("검색 쿼리:", queryString)


            //3. 프론트엔드 라우터(SearchResult 페이지)로 이동
            navigate(`/searchResult?${queryString}`)
        } catch (error) {
            console.error("검색 이동 중 오류 발생:", error)
        }

    }



    return (
        <header>
            <div className="inner">
                {/* 상단 헤더 */}
                <section className="topBox">
                    {/* 좌측 영역 : sns 바로가기 */}
                    <div className="left">
                        <ul className="sns">
                            <li> <Link to="https://www.facebook.com" target="_blank">
                                <img src={icon_facebook} alt="페이스북 바로가기" style={{width: 30}}/>
                            </Link> </li>
                            <li> <Link to="https://www.instagram.com" target="_blank">
                                <img src={icon_instagram} alt="인스타그램 바로가기" style={{width: 30}}/>
                            </Link> </li>
                            <li> <Link to="https://pf.kakao.com/_TsIAE" target="_blank">
                                <img src={icon_kakao} alt="카카오톡 공식채널 바로가기" style={{width: 30}}/>
                            </Link> </li>
                        </ul>   {/* sns 끝 */}
                    </div>


                    {/* <!-- 중앙 영역 : 로고와 검색창 --> */}
                    <div className="center">
                        <h1 className='logo'> 
                            <Link to="/"><img src={null} alt="웹사이트 로고"/></Link> 
                        </h1>

                        <div className="search">
                            <form action="" method="get">
                                {/* 검색창 */}
                                <section className='bar'>
                                    <button className="btn" type="button">
                                        <img src={icon_search} alt="검색하기" onClick={doSearch} style={{width: 20}}/>
                                    </button>
                                    <input type="text" id={searchValue} name={searchValue} value={searchValue} placeholder="검색어를 입력하세요" onChange={changeSearchValue}/>
                                    <button className="hamburger" type="button">
                                        <img src={icon_hamburger} alt="검색 조건 선택창" onClick={toggleSearchCondition} style={{width: 20}}/>
                                    </button>
                                </section>


                                {/* 검색 조건 선택창 */}
                                {
                                    isSearchCondition &&
                                    <Header_searchCondition searchKey={searchKey} setSearchKey={setSearchKey}/>
                                }
                            </form>
                        </div>
                    </div>


                    {/* <!-- 우측 영역 : 사용자 메뉴들(로그인, 회원가입) --> */}
                    <div className="right">
                        <ul className="userMenu">
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
                                                            <img src={icon_mypage} alt="관리자 대시보드" style={{width: 50}}/>
                                                            <p>관리자 대시보드</p>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/item">
                                                            <img src={icon_mypage} alt="관리자 상품관리" style={{width: 50}}/>
                                                            <p>관리자 상품관리</p>
                                                        </Link>
                                                    </li>
                                                </>
                                            )
                                            : (  //일반 유저 계정
                                                <>
                                                    <li>
                                                        <Link to="/cart">
                                                            <img src={icon_cart} alt="장바구니" style={{width: 50}}/>
                                                            <p>장바구니</p>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/mypage">
                                                            <img src={icon_mypage} alt="마이페이지" style={{width: 50}}/>
                                                            <p>마이페이지</p>
                                                        </Link>
                                                    </li>
                                                </>
                                            )
                                        }

                                        
                                        
                                        <li>
                                            <Link onClick={logout}>
                                                <img src={icon_logout} alt="로그아웃" style={{width: 50}}/>
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
                                                <img src={icon_login} alt="로그인" style={{width: 50}}/>
                                                <p>로그인</p>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/signup">
                                                <img src={icon_signup} alt="회원가입" style={{width: 50}}/>
                                                <p>회원가입</p>
                                            </Link>
                                        </li>
                                    </>
                                )
                            }
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