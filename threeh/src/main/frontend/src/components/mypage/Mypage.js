import React, { useState, useEffect } from 'react';

const Mypage = () => {
    // 백엔드에서 긁어올 데이터 바구니들
    const [memberData, setMemberData] = useState(null);
    const [addressList, setAddressList] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        // 8080 백엔드 데이터 요청
        fetch('http://localhost:8080/Member/mypage.do')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setMemberData(data.member);
                setRecentOrders(data.recentOrders || []);
            })
            .catch(err => console.error("회원정보 수신 에러:", err));

        fetch('http://localhost:8080/Member/address/list')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => setAddressList(data.addressList || [])) 
            .catch(err => console.error("주소록 수신 에러:", err));
    }, []);

    // 💡 다른 조원들과 똑같이 순수 텍스트(데이터)만 줄줄이 출력하는 양식입니다.
    return (
        <div style={{ textAlign: 'left', padding: '10px' }}>
            <br />
            <strong>마이페이지 (Mypage 페이지)</strong><br />
            백엔드 서버에서 넘어온 member 데이터(response)<br />
            
            memberId: {memberData?.memberId || ' '}<br />
            id: {memberData?.userid || memberData?.id || ' '}<br />
            password: {memberData?.password || ' '}<br />
            name: {memberData?.name || ' '}<br />
            email: {memberData?.email || ' '}<br />
            phone: {memberData?.phone || ' '}<br />
            role: {memberData?.role || ' '}<br />
            regNo: {memberData?.regNo || ' '}<br />
            createdAt: {memberData?.createdAt || ' '}<br />
            updatedAt: {memberData?.updatedAt || ' '}<br />
            
            <br />
            <strong>등록된 주소지 목록</strong><br />
            {addressList.length > 0 ? (
                addressList.map((addr, index) => (
                    <div key={index}>
                        - [{addr.addressName}] {addr.roadAddress} {addr.detailAddress}
                    </div>
                ))
            ) : (
                '등록된 주소지 없음'
            )}<br />
            
            <br />
            <strong>최근 주문 내역</strong><br />
            {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                    <div key={index}>
                        - 주문번호: {order.id} | 상품명: {order.productName}
                    </div>
                ))
            ) : (
                '최근 주문 내역 없음'
            )}<br />
            <hr />
        </div>
    );
};

export default Mypage;
