import React from 'react';
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

export const useDriverAuto = ({
    orders,
    items,
    selectedOrderIds,
    setSelectedOrderIds,
    handleDriverSelect,
    handleAssignDriver
}) => {
    
    const handleAutoAssign = () => {
        if (selectedOrderIds.length === 0) {
            toast.error('자동 배정할 주문을 선택해주세요.');
            return;
        }

        if (window.confirm(`선택한 ${selectedOrderIds.length}건의 주문을 '경기(12가)', '강원(78라)' 규칙 및 최대 5건 제한 조건에 맞춰 자동 배정하시겠습니까?`)) {
            
            console.log("====== 🚀 자동 배정 디버깅 시작 ======");
            console.log("선택된 주문 IDs:", selectedOrderIds);
            console.log("전체 기사 데이터(items):", items);

            // 1. 현재 기사별로 이미 배정되어 있는 주문 수 계산
            const driverOrderCounts = {};
            orders.forEach(o => {
                if (o.deliveryId) {
                    driverOrderCounts[o.deliveryId] = (driverOrderCounts[o.deliveryId] || 0) + 1;
                }
            });
            console.log("현재 기사별 누적 배정 건수:", driverOrderCounts);

            let assignedCount = 0;
            let failCount = 0;

            // 2. 선택된 주문들을 순서대로 순회하며 배정 시작
            selectedOrderIds.forEach(orderId => {
                console.log(`\n--------------------------------------------`);
                console.log(`🔎 [분석 중] 주문 ID: ${orderId}`);

                const targetOrder = orders.find(o => o.orderId === orderId);
                if (!targetOrder) {
                    console.error(`❌ 오류: orders 목록에서 주문 ID ${orderId}를 찾을 수 없습니다.`);
                    failCount++;
                    return;
                }

                const address = targetOrder.deliveryAddr || '';
                let targetCarPrefix = '';

                if (address.includes('경기')) {
                    targetCarPrefix = '12가';
                } else if (address.includes('강원')) {
                    targetCarPrefix = '78라';
                }

                console.log(`   - 주문 주소: "${address}"`);
                console.log(`   - 매칭되어야 할 차량 앞자리: "${targetCarPrefix || '없음(지역 불일치)'}"`);

                if (!targetCarPrefix) {
                    console.warn(`   ⚠️ 경고: 주소에 '경기' 또는 '강원'이 포함되어 있지 않아 기사를 매칭할 수 없습니다.`);
                }

                // 조건에 맞는 기사님들 필터링
                const availableDrivers = items.filter(driver => {
                    const isMatchCar = driver.deliveryCarNo?.startsWith(targetCarPrefix);
                    const currentLoad = driverOrderCounts[driver.deliveryId] || 0;
                    
                    // 🔍 기사 한 명 한 명 체크할 때마다 콘솔에 출력
                    console.log(`   👥 기사 ID: ${driver.deliveryId} | 차량번호: ${driver.deliveryCarNo || '없음'} | 현재 배정량: ${currentLoad}/5`);
                    console.log(`      -> 차량 일치 여부: ${isMatchCar} | 배정 가능 여부(5건 미만): ${currentLoad < 5}`);

                    return isMatchCar && currentLoad < 5;
                });

                console.log(`   - 조건 만족하는 기사 풀(가용 기사):`, availableDrivers);

                // 3. 조건에 맞는 기사가 존재한다면 첫 번째 기사에게 배정
                if (availableDrivers.length > 0) {
                    const pickedDriver = availableDrivers[0];
                    const driverId = pickedDriver.deliveryId;

                    console.log(`   ✅ 배정 성공 ➡️ 주문 ID: ${orderId}를 기사 ID: ${driverId}에게 배정합니다.`);

                    driverOrderCounts[driverId] = (driverOrderCounts[driverId] || 0) + 1;

                    if (typeof handleDriverSelect === 'function') {
                        handleDriverSelect(orderId, driverId);
                    }
                    if (typeof handleAssignDriver === 'function') {
                        handleAssignDriver(orderId, driverId);
                    }
                    assignedCount++;
                } else {
                    console.error(`   ❌ 배정 실패 ➡️ 주문 ID: ${orderId}에 알맞은 기사가 없습니다.`);
                    failCount++;
                }
            });

            console.log(`\n====== 🏁 자동 배정 프로세스 종료 ======`);
            console.log(`최종 결과 - 성공: ${assignedCount}건 / 실패: ${failCount}건`);

            // 4. 결과 리포트 알림
            toast.error(`자동 배정 프로세스 완료!\n- 배정 성공: ${assignedCount}건\n- 배정 실패(지역 불일치 또는 5건 초과 기사 풀 부족): ${failCount}건`);
            setSelectedOrderIds([]); 
        }
    };

    // 외부(Orderboard)에서 쓸 수 있도록 함수를 반환합니다.
    return { handleAutoAssign };
};