import React from 'react';
import Header from './Header';
import NewArrival from './NewArrival';

const Main = () => {
    return (
        <div>
            {/* Header 영역 */}
            <Header/>


            {/* <!-- Contents 시작 --> */}
            <div className="inner">
                <div className="banners">
                    <section className="mainBanner">
                        <ul className="slide">
                            <li className="s1"> <a href="#">배너1</a> </li>
                            <li className="s2"> <a href="#">배너2</a> </li>
                            <li className="s3"> <a href="#">배너3</a> </li>
                        </ul>
                        <div className="btnOnce">
                            <button className="prev"> &lt; </button>
                            <button className="next"> &gt; </button>
                        </div>
                        <ul className="btnOrder">
                            <li></li>
                            <li></li>
                            <li></li>
                        </ul>
                    </section>
                </div>


            
                <NewArrival/>



                <div className="banners">
                    <section className="customize">
                        <div className="imgBox">
                            <a href="#">
                                맞춤 가구 이미지
                            </a>
                        </div>

                        <div className="textBox">
                            <h2>맞춤 가구 제작</h2>
                            <p>
                                맞춤 가구 제작 페이지에 대한 설명 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                            </p>
                        </div>
                    </section>
                </div>


                <section className="board">
                    <article className="articles">
                        <div>
                            <div>
                                게시판 이미지
                            </div>
                            <p>@사용자id</p>
                        </div>

                        <div>
                            <div>
                                게시판 이미지
                            </div>
                            <p>@사용자id</p>
                        </div>

                        <div>
                            <div>
                                게시판 이미지
                            </div>
                            <p>@사용자id</p>
                        </div>

                        <div>
                            <div>
                                게시판 이미지
                            </div>
                            <p>@사용자id</p>
                        </div>
                    </article>
                    <div className="btnOnce">
                        <button className="prev"> &lt; </button>
                        <button className="next"> &gt; </button>
                    </div>
                    <ul className="btnOrder">
                        <li></li>
                        <li></li>
                        <li></li>
                    </ul>
                </section>
            </div>
            {/* <!-- Contents 끝 --> */}


            {/* Footer 영역 */}

        </div>
    );
};

export default Main;