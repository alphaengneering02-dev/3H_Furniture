import React from 'react';
import Header from './Header';
import Main_newArrival from './Main_newArrival';
import Main_mainBanner from './Main_mainBanner';
import Main_customize from './Main_customize';
import Main_board from './Main_board';

const Main = () => {
    return (
        <div>
            {/* Header 영역 */}
            <Header/>


            {/* <!-- Contents 시작 --> */}
            <div className="inner">
                <Main_mainBanner/>  {/* 메인 배너 */}
                <Main_newArrival/>  {/* NEW ARRIVAL(신상품) */}
                <Main_customize/>  {/* 맞춤 가구 제작 */}
                <Main_board/>  {/* 사용자 게시판 */}
            </div>
            {/* <!-- Contents 끝 --> */}


            {/* Footer 영역 */}

        </div>
    );
};

export default Main;