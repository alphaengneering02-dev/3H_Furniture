import React, { useEffect, useState } from 'react';
import Header from './Header';
import Main_mainBanner from './Main_mainBanner';
import axios from 'axios';
import Ranking from '../admin/Ranking';

//Main 전용 CSS 임포트
import '../../css/mainPageCss/main.css';
import Footer from './Footer';
import Main_itemList from './Main_itemList';
import MainCategory from './MainCategory';
import MainBestSection from './MainBestSection';

const Main = () => {

    //전체 상품리스트 객체
    const [totalItemList, setTotalItemList] = useState([]);
    const [bestItems, setBestItems] = useState([]);

    //랭킹에 넘길 주문 목록_오현옥
    const [orders, setOrders] = useState([]);
    //랭킹에 넘길 배송기사 목록_오현옥
    const [drivers,setDrivers] = useState([]);

    useEffect(() => {
        getItemList();
        
        //메인 랭킹용 데이터 조회
        getRankingData();
    }, []);


    //DB에서 전체 상품리스트를 가져오는 함수
    const getItemList = async () => {
        try {
            //상품리스트 가져오기
            const res = await axios.get(
                `http://localhost:8080/api/item`
            );

            const itemList = res.data || [];
            setTotalItemList(itemList);


            //콘솔 출력
            //코딩 수정_오현옥(;이거 추가함)
            const originalItemList = [];
            for (let i = 0; i <= 3; i++) {
                if (itemList[i]) {
                    originalItemList.push(itemList[i]);
                }
            }
            console.log("[전체 상품 리스트 (상위 4개)]\n", originalItemList);

            //코딩 추가 아래_오현옥
            //전체 상품 리스트를 먼저 가져온 뒤, 베스트 상품 계산할 때 itemId 매칭용으로 넘김
            getBestItemsList(itemList);

        } catch (error) {
            console.error("[전체 상품리스트 조회 실패]\n", error);
        }
    };

    //메인 랭킹 데이터 가져오기_오현옥
    const getRankingData = async()=>{
        try{
            //주문 목록 가져오기
            const orderRes = await axios.get(
                `http://localhost:8080/admin/orders`,
                {
                    withCredentials: true,
                }
            );

            setOrders(orderRes.data||[]);

            //배송기사 목록 가져오기
            //배송기사api 주소에 맞게 가져와.
            const driverRes = await axios.get(
                'http://localhost:8080/admin/list',
                {
                    withCredentials:true,
                }
            );
            setDrivers(driverRes.data||[]);

            console.log("메인 랭킹 주문 데이터:",orderRes.data);
            console.log("메인 랭킹 기사 데이터:",driverRes.data);
        }catch(error){
            console.error("메인 랭킹 데이터 조회 실패",error);
        }
    };

    //상품 대표 이미지 가져오기_오현옥:대표이미지 있으면 대표이미지, 없으면 첫번째 이미지
    const getItemThumbnailUrl = async (itemId) => {
        if (!itemId) {
            console.warn("이미지 조회 실패: itemId가 없습니다.");
            return null;
        }

        try {
            const res = await axios.get(
                `http://localhost:8080/api/itemImgs/${itemId}`,
                {
                    withCredentials: true,
                }
            );

            const imgs = res.data || [];
            
            //이미지 확인용 콘솔
            console.log(`상품 이미지 목록 itemId=${itemId}:`,imgs);

            if(!Array.isArray(imgs) || imgs.length===0){
                console.warn(`등록된 이미지가 없습니다. itemId=${itemId}`);
                return null;
            }
            //이미지 이넘 적용
            const thumbnailImg = imgs.find((img) => img.thumbnailYn === "Y");

            //대표 이미지가 없으면 첫 번째 이미지 사용
            const slelectedImg = thumbnailImg||imgs[0];

            console.log(`선택된 이미지 itemId=${itemId}:`,slelectedImg);
            return slelectedImg?.itemImgUrl ||null;
        }catch(error){
            console.error(`상품 이미지 조회 실패 itemId=${itemId}`,error);
            return null;
        }
    };

    //코딩 수정_오현옥(베스트 아이템 목록 불러오기_어드민대시보드 참조.)
    const getBestItemsList = async (itemList) => {
        try {
            const res = await axios.get('http://localhost:8080/admin/orders', {
                withCredentials: true,
            });

            const orders = res.data || [];

            const statsMap = {};

            orders.forEach(order => {
                const orderItems = order.orderItems || order.orderitems || order.items || [];

                if (!Array.isArray(orderItems)) {
                    return;
                }

                orderItems.forEach(orderItem => {
                    const itemId = orderItem.itemId || orderItem.item?.itemId;
                    const name = orderItem.itemName;
                    const count = Number(orderItem.count || 1);

                    if (!name) {
                        return;
                    }

                    //itemId가 존재하면, itemId기준으로 묶자, 아니면 name으로._오현옥
                    const key = itemId?String(itemId):name;

                    if (!statsMap[key]) {
                        statsMap[key] = {
                            itemId,
                            name,
                            sales: 0,
                        };
                    }

                    statsMap[key].sales += count;
                });
            });

            const top3Base = Object.values(statsMap)
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 3);

            //확인용
            console.log("베스트 상품 기본 데이터:", top3Base);

            //베스트 상품에 이미지 붙이기
            const top3 = await Promise.all(
                top3Base.map(async (bestItem, idx) => {

                    //전체 상품 리스트에서 주문 상품과 같은 상품을 찾음
                    //itemId가 있으면 itemId로 먼저 찾고, 없으면 itemName으로 찾음
                    const matchedItem = itemList.find((item) => {
                        if (bestItem.itemId && Number(item.itemId) === Number(bestItem.itemId)) {
                            return true;
                        }

                        return item.itemName === bestItem.name;
                    });
                    //확인용
                    console.log("베스트 상품 매칭 확인:",{
                        bestItem,
                        matchedItem,
                    });

                    const finalItemId = matchedItem?.itemId || bestItem.itemId;

                    //ItemImgController의 GET /api/itemImgs/{itemId} 사용해서 가져와
                    const thumbnailUrl = await getItemThumbnailUrl(finalItemId);

                    return {
                        rank: idx + 1,

                        //베스트 상품 기본 정보
                        itemId: finalItemId,
                        name: bestItem.name,
                        sales: bestItem.sales,

                        //MainBestSection에서 이미지 필드명이 달라도 대응 가능하게 여러 이름으로 넘김
                        image: thumbnailUrl || matchedItem?.itemImgUrl || null,
                        itemImgUrl: thumbnailUrl || matchedItem?.itemImgUrl || null,

                        //MainBestSection에서 상품명/가격을 사용할 수 있게 같이 넘김
                        itemName: matchedItem?.itemName || bestItem.name,
                        itemPrice: matchedItem?.itemPrice || 0,
                        itemDiscountPrice: matchedItem?.itemDiscountPrice || 0,
                        itemFinalPrice: matchedItem?.itemFinalPrice || 0,
                    };
                })
            );

            console.log("베스트 상품 TOP3:", top3);

            setBestItems(top3);

        } catch (error) {
            console.error("베스트 상품 조회 실패", error);
        }
    };

    return (
        <div>
            {/* Header 영역 */}
            <div className="main-header">
                <Header />
            </div>

            <div className="main-body-wrapper">
                {/* Contents 영역 */}
                {/* global.css의 공통 레이아웃인 casamia-container를 사용하여 규격을 강제합니다. */}
                <div className="casamia-container main-container">
                    <div className="main-banner-section">
                        <Main_mainBanner />  {/* 메인 배너 */}
                    </div>

                    <div>
                        <MainCategory />
                    </div>

                    <div className="main-item-section">
                        <Main_itemList totalItemList={totalItemList} />{/* 상품 목록(카드 형식) */}
                    </div>

                    <div>
                        <MainBestSection bestItems={bestItems} />
                    </div>

                    {/*이게 랭킹.._ */}
                    <Ranking orders={orders} items={drivers} />
                </div>
            </div>


            {/* Footer 영역 */}
            <div className="main-mypage-footer">
                <Footer />
            </div>
        </div>
    );
};

export default Main;