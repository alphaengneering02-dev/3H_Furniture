import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboardCopy = () => {
    // 1. [격리 스위치] true면 전체화면 가림막이 활성화됩니다.
    const [isMyTestMode, setIsMyTestMode] = useState(true);

    // 2. [데이터 상태 관리] 기존 배송 데이터 + 신규 회원/주소 데이터
    const [items, setItems] = useState([]); // 기사 리스트
    const [memberData, setMemberData] = useState(null); // 회원 정보
    const [addressList, setAddressList] = useState([]); // 주소록 정보

    // 3. [데이터 호출] 8080 서버에서 데이터를 가져옵니다.
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 기존 기사 리스트 호출
                const resList = await axios.get('http://localhost:8080/admin/list');
                setItems(resList.data);

                // 마이페이지 회원 정보 호출
                const resMember = await axios.get('http://localhost:8080/Member/mypage.do');
                setMemberData(resMember.data);

                // 주소록 리스트 호출
                const resAddr = await axios.get('http://localhost:8080/Member/address/list');
                setAddressList(resAddr.data);
            } catch (error) {
                console.error("데이터 로드 중 오류 발생:", error);
            }
        };

        fetchAllData();
    }, []);

    // 4. [화면 렌더링] 격리 모드일 때 보여줄 레이아웃
    if (isMyTestMode) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundColor: '#f4f7f6', zIndex: 9999, overflowY: 'auto', padding: '40px',
                textAlign: 'left', boxSizing: 'border-box', fontFamily: 'sans-serif'
            }}>
                {/* 우측 상단 닫기 버튼 */}
                <button 
                    onClick={() => setIsMyTestMode(false)}
                    style={{
                        position: 'fixed', top: '20px', right: '20px', padding: '10px 15px',
                        backgroundColor: '#ff4d4f', color: 'white', border: 'none',
                        borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    ❌ 내 화면 닫고 팀원 화면 보기
                </button>

                <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <h1 style={{ color: '#1a73e8' }}>🛠️ Admin Dashboard (Copy Mode)</h1>
                    <p style={{ color: '#666' }}>이 화면은 다른 컴포넌트의 간섭을 받지 않는 독립 테스트 공간입니다.</p>
                    
                    <hr style={{ margin: '20px 0' }} />

                    {/* 섹션 1: 회원 정보 (상대방 로직) */}
                    <section style={{ marginBottom: '30px' }}>
                        <h3>👤 내 계정 정보</h3>
                        {memberData ? (
                            <div style={{ padding: '15px', background: '#eef2f8', borderRadius: '8px' }}>
                                <p><strong>ID:</strong> {memberData.userid || memberData.id}</p>
                                <p><strong>이름:</strong> {memberData.name}</p>
                                <p><strong>이메일:</strong> {memberData.email}</p>
                            </div>
                        ) : (
                            <p style={{ color: 'orange' }}>⏳ 회원 데이터를 불러오는 중...</p>
                        )}
                    </section>

                    {/* 섹션 2: 배송 기사 리스트 (본인 로직) */}
                    <section style={{ marginBottom: '30px' }}>
                        <h3>🚚 기사 리스트 관리</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1a73e8', color: 'white' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>기사명</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>연락처</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? items.map((item) => (
                                    <tr key={item.deliveryId}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{item.deliveryName}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{item.deliveryPhone}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: item.status === 'WAITING' ? 'blue' : 'black' }}>
                                            {item.status}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>데이터가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </section>

                    {/* 섹션 3: 배송지 목록 (상대방 로직) */}
                    <section>
                        <h3>📍 등록된 배송지 ({addressList.length})</h3>
                        {addressList.map((addr, idx) => (
                            <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                <strong>{addr.addressName}</strong> : {addr.roadAddress} {addr.detailAddress}
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        );
    }

    // 스위치가 꺼지면 보여줄 기본 메시지 (또는 null)
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>테스트 모드가 비활성화되었습니다.</h2>
            <button onClick={() => setIsMyTestMode(true)}>다시 내 화면 켜기</button>
        </div>
    );
};

export default AdminDashboardCopy;