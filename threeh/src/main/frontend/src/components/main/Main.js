import React from 'react';
import Header from './Header';

const Main = () => {
    return (
        <div>
            {/* Header 영역 */}
            <Header/>


            {/* <!-- Contents 시작 --> */}
            <div class="inner">
                <div class="banners">
                    <section class="mainBanner">
                        <ul class="slide">
                            <li class="s1"> <a href="#">배너1</a> </li>
                            <li class="s2"> <a href="#">배너2</a> </li>
                            <li class="s3"> <a href="#">배너3</a> </li>
                        </ul>
                        <div class="btnOnce">
                            <button class="prev"> &lt; </button>
                            <button class="next"> &gt; </button>
                        </div>
                        <ul class="btnOrder">
                            <li></li>
                            <li></li>
                            <li></li>
                        </ul>
                    </section>
                </div>


            
                <section class="newArrival">
                    <h2>NEW ARRIVAL</h2>

                    <article class="products">
                        <div>
                            <div>
                                상품 이미지
                                <button>♡</button>
                            </div>
                            <p>상품명</p>
                            <h4>가격</h4>
                        </div>

                        <div>
                            <div>
                                상품 이미지
                                <button>♡</button>
                            </div>
                            <p>상품명</p>
                            <h4>가격</h4>
                        </div>

                        <div>
                            <div>
                                상품 이미지
                                <button>♡</button>
                            </div>
                            <p>상품명</p>
                            <h4>가격</h4>
                        </div>

                        <div>
                            <div>
                                상품 이미지
                                <button>♡</button>
                            </div>
                            <p>상품명</p>
                            <h4>가격</h4>
                        </div>
                    </article>
                </section>



                <div class="banners">
                    <section class="customize">
                        <div class="imgBox">
                            <a href="#">
                                맞춤 가구 이미지
                            </a>
                        </div>

                        <div class="textBox">
                            <h2>맞춤 가구 제작</h2>
                            <p>
                                맞춤 가구 제작 페이지에 대한 설명 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                            </p>
                        </div>
                    </section>
                </div>


                <section class="board">
                    <article class="articles">
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
                    <div class="btnOnce">
                        <button class="prev"> &lt; </button>
                        <button class="next"> &gt; </button>
                    </div>
                    <ul class="btnOrder">
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