import React, { useEffect, useState } from 'react';
import Header from './Header';
import Main_mainBanner from './Main_mainBanner';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Item from '../item/Item';

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
        <div>
            {/* Header 영역 */}
            <Header/>


            {/* <!-- Contents 시작 --> */}
            <div className="inner">
                <Main_mainBanner/>  {/* 메인 배너 */}
                <Item/>  {/* 상품 목록 */}
            </div>
            {/* <!-- Contents 끝 --> */}


            {/* Footer 영역 */}

        </div>
    );
};

export default Main;