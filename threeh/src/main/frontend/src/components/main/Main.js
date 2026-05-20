import React, { useEffect, useState } from 'react';
import Header from './Header';
import Main_mainBanner from './Main_mainBanner';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Item from '../item/Item';

//Main 전용 CSS 임포트
import '../../css/mainPageCss/main.css';

const Main = () => {

    //전체 상품리스트 객체
    const [itemList, setItemList] = useState([])

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
            setItemList(res.data)


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
        <div className="main_wrapper">
            {/* Header 영역 */}
            <Header/>

            {/* Contents 영역 */}
            {/* global.css의 공통 레이아웃인 casamia-container를 사용하여 규격을 강제합니다. */}
            <div className="casamia-container main_inner">
                <div className="main_banner_section">
                    <Main_mainBanner/>  {/* 메인 배너 */}
                </div>
            

                <div className="main_item_section">
                    <Item/>  {/* 상품 목록 */}
                </div>
            </div>

            {/* Footer 영역 */}

        </div>
    );
};

export default Main;