import React, { useEffect, useState } from 'react';
import Header from './Header';
import Main_mainBanner from './Main_mainBanner';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Item from '../item/Item';
import Ranking from '../admin/Ranking';
import imgPath from '../../utils/BackendPath';

//Main 전용 CSS 임포트
import '../../css/mainPageCss/main.css';
import Footer from './Footer';
import Main_itemList from './Main_itemList';
import MainCategory from './MainCategory';
import MainBestSection from './MainBestSection';

const Main = () => {

    //전체 상품리스트 객체
    const [totalItemList, setTotalItemList] = useState([])
    const [bestItems, setBestItems] = useState([]);

    useEffect(() => {
        getItemList()
        getBestItemsList()
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

    const getBestItemsList = async () => {
        try {
            const res = await axios.get('/admin/orders');
            const orders = res.data;
            const itemRes = await axios.get('imgPath/api/item');
            const allItems = itemRes.data;

            const statsMap = {};
            orders.forEach(order => {
                const orderItems = order.orderItems || order.orderitems || order.items || [];
                if(!Array.isArray(orderItems)) return;

                orderItems.forEach(item => {
                    const name = item.itemName;
                    if(!name) return;
                    if(!statsMap[name]){
                        const matched = allItems.find(i => i.itemName?.trim() === name?.trim());
                        statsMap[name] = {name, sales: 0, image: matched?.itemImgUrl || null};
                    }
                    statsMap[name].sales += Number(item.count || 1);
                });
            });

            console.log("상품 샘플:", allItems[0]);
            console.log("포세린 찾기:", allItems.find(i => i.itemName === "포세린 세라믹 디럭스 식탁"));

            const top3 = Object.values(statsMap)
                .sort((a, b) => b.sales - a.sales)
                .slice(0,3)
                .map((item, idx) => ({rank: idx+1, ...item}));

            setBestItems(top3);


        } catch (error) {
            console.error("베스트 상품 조회 실패", error);
        }
    }


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

                    <div>
                        <MainCategory/>
                    </div>

                  

                    <div className="main-item-section">
                        <Main_itemList totalItemList={totalItemList}/>  {/* 상품 목록(카드 형식) */}
                    </div>

                    <div>
                        <MainBestSection bestItems={bestItems}/>
                    </div>

                    <Ranking/>
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