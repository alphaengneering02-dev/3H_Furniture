import React from 'react';
import AdrdressInput from './AdrdressInput';
import { Link } from 'react-router-dom';

function OrderInfo({orderType, setOrderType, zipcode, address, setZipcode, setAddress, detailedAddress, setDetailedAddress}) {
    return (
        <div>
           <div>
                <h1> <Link to="/">로고</Link> </h1>

                <label>배송 및 설치 선택</label>

                <div>
                    <label>
                        <input type='radio' id='install' name='deliveryType' value={"DELIVERY_WITH_INSTALLATION"}
                        checked={orderType === "DELIVERY_WITH_INSTALLATION"}
                        onChange={(e) => setOrderType(e.target.value)}/> 배송 및 설치
                    </label>

                    <label>
                        <input 
                        type='radio' 
                        name='deliveryType' 
                        value="DELIVERY_ONLY" 
                        checked={orderType === "DELIVERY_ONLY"}
                        onChange={(e) => setOrderType(e.target.value)}
                    /> 배송만
                    </label>
                </div>

                <label>주소 입력</label>
                <div>
                    <AdrdressInput 
                        zipcode={zipcode}
                        address={address}
                        setZipcode={setZipcode}
                        setAddress={setAddress}
                        detailedAddress={detailedAddress}
                        setDetailedAddress={setDetailedAddress}/>
                </div>

            </div>
        </div>
    );
}

export default OrderInfo;