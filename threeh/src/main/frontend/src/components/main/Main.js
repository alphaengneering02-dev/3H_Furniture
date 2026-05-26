import React, { useEffect, useState } from 'react';
import Header from './Header';
import Main_mainBanner from './Main_mainBanner';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Item from '../item/Item';

//Main 전용 CSS 임포트
import '../../css/mainPageCss/main.css';
import Footer from './Footer';
import Main_itemList from './Main_itemList';

const Main = () => {

    //전체 상품리스트 객체
    const [totalItemList, setTotalItemList] = useState([])

    useEffect(() => {
        getItemList()
    }, [])


    //DB에서 전체 상품리스트를 가져오는 함수
    const getItemList = async() =>{
        try{
            //상품리스트 가져오기
            const res = await axios.get(
                `http://localhost:8080/api/item`
            );
            setTotalItemList(res.data)


            //콘솔 출력
            const originalItemList = [];
            for(let i=0; i<=3; i++) {
                originalItemList.push(res.data[i])
            }
            console.log("[전체 상품 리스트 (상위 4개)]\n", originalItemList)

        } catch(error){
            console.error("[전체 상품리스트 조회 실패]\n", error);
        }
    };


    return (
        <div>
            {/* Header 영역 */}
            <div className="main-header">
                <Header/>
            </div>


            <div className="main-body-wrapper">
                {/* Contents 영역 */}
                {/* global.css의 공통 레이아웃인 casamia-container를 사용하여 규격을 강제합니다. */}
                <div className="casamia-container main-container">
                    <div className="main-banner-section">
                        <Main_mainBanner/>  {/* 메인 배너 */}
                    </div>

                    <div className="main-item-section">
                        <Main_itemList totalItemList={totalItemList}/>  {/* 상품 목록(카드 형식) */}
                    </div>
                </div>
            </div>


            {/* Footer 영역 */}
            <div className="main-mypage-footer">
                <Footer/>
            </div>
        </div>
    );
};

export default Main;