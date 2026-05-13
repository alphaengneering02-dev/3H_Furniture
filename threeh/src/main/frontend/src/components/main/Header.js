import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import icon_search from '../../assets/icon_search.png';
import icon_hamburger from '../../assets/icon_hamburger.png';
import icon_facebook from '../../assets/icon_facebook.png';
import icon_instagram from '../../assets/icon_instagram.png';
import icon_kakao from '../../assets/icon_kakao.png';
import icon_login from '../../assets/icon_login.png';
import icon_signup from '../../assets/icon_signup.png';
import axios from 'axios';

// 헤더
const Header = () => {

    const navigate = useNavigate();


    //로그인한 회원정보 가져오기
    const [user, setUser] = useState({})

    const getSession = () => {
        try {
            //sessionStorage에서 회원정보를 가져옴
            const rawData = sessionStorage.getItem("user")

            if(rawData) {
                const sessionData = JSON.parse(rawData)  //JSON ---> 객체 형태
                setUser(sessionData)

                console.log("[로그인 데이터 로드 완료]"  + "\n"
                    + rawData
                )
            }

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



    //검색창
    const [searchKey, setSearchKey] = useState()
    const [searchValue, setSearchValue] = useState()

    // const changeSearchKey = (evt) => {}
    const changeSearchValue = (evt) => {setSearchValue(evt.target.value)}


    const doSearch = async() => {

        try {
            navigate(`/searchResult/${searchKey}/${searchValue}`)
        } catch (error) {
            
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
                            <li> <Link to="#" target="_blank">
                                <img src={icon_facebook} alt="페이스북 바로가기" style={{width: 30}}/>
                            </Link> </li>
                            <li> <Link to="#" target="_blank">
                                <img src={icon_instagram} alt="인스타그램 바로가기" style={{width: 30}}/>
                            </Link> </li>
                            <li> <Link to="#" target="_blank">
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
                                {/* 검색창 (searchValue) */}
                                <button className="btn" type="button">
                                    <img src={icon_search} alt="검색하기" onClick={doSearch} style={{width: 20}}/>
                                </button>
                                <input className="input" type="text" id={searchValue} name={searchValue} value={searchValue} placeholder="검색어를 입력하세요" onChange={changeSearchValue}/>
                                <button className="hamburger" type="button">
                                    <img src={icon_hamburger} alt="검색하기" style={{width: 20}}/>
                                </button>

                                {/* 검색 조건 선택 (searchKey) */}
                                <section>
                                    <article>
                                        <h3>검색 조건</h3>
                                        <button>전체 삭제</button>
                                    </article>


                                    <article>
                                        {/* 사용공간 */}
                                        <div>
                                            <select>
                                                <option selected disabled>사용공간</option>
                                            </select>
                                        </div>

                                        {/* 종류 */}
                                        <div>
                                            <select>
                                                <option selected disabled>종류</option>
                                            </select>
                                        </div>

                                        {/* 브랜드 */}
                                        <div>
                                            <select>
                                                <option selected disabled>브랜드</option>
                                            </select>
                                        </div>

                                        {/* 소재 */}
                                        <div>
                                            <select>
                                                <option selected disabled>소재</option>
                                            </select>
                                        </div>

                                        {/* 사이즈 */}
                                        <div>
                                            <h4>사이즈</h4>
                                            <input type='range'/>
                                        </div>

                                        {/* 가격대 */}
                                        <div>
                                            <h4>가격대</h4>
                                            <input type='range'/>
                                        </div>
                                    </article>
                                </section>
                            </form>
                        </div>
                    </div>


                    {/* <!-- 우측 영역 : 사용자 메뉴들(로그인, 회원가입) --> */}
                    <div className="right">
                        <ul className="userMenu">
                            {
                                user
                                //로그인 한 상태의 화면
                                ? (
                                    <>
                                        <li>
                                            <Link to="/">
                                                <img src={null} alt="마이페이지"/>
                                                <p>마이페이지</p>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link onClick={logout}>
                                                <img src={null} alt="로그아웃"/>
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