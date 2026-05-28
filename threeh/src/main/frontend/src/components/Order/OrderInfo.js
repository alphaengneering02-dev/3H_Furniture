import React from 'react';
import AdrdressInput from './AdrdressInput';
import { Link } from 'react-router-dom';
import '../../css/orderPageCss/orderPage.css';
import Header from '../main/Header';
import Footer from "../main/Footer";

import { 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormControl 
} from '@mui/material';

function OrderInfo({orderType, setOrderType, zipcode, address, setZipcode, setAddress, detailedAddress, setDetailedAddress}) {
        return (
        <>
            {/* 💡 [공간/중복 해결] 여기에 들어있던 중복 <h2 className="order-page-title">주문/결제</h2>를 완전히 제거했습니다. */}
            {/* 💡 [정렬 해결] 다른 컴포넌트의 배치를 가로막던 잘못된 그릇(order-content-layout 등)을 도려냈습니다. */}

            {/* 1. 배송 및 설치 선택 (독립 카드) */}
            <div className="order-section-block">
                <div className="order-section-header">
                    <h3 className="order-section-title">배송 및 설치 선택</h3>
                </div>
                
                <div className="order-section-body">
                    <FormControl component="fieldset">
                        <RadioGroup
                            row
                            name="deliveryType"
                            value={orderType || ''}
                            onChange={(e) => setOrderType(e.target.value)}
                            className="order-radio-group"
                        >
                            <FormControlLabel
                                value="DELIVERY_WITH_INSTALLATION"
                                control={<Radio className="order-radio" />}
                                label={<span className="order-radio-label">배송 및 설치</span>}
                            />
                            <FormControlLabel
                                value="DELIVERY_ONLY"
                                control={<Radio className="order-radio" />}
                                label={<span className="order-radio-label">배송만</span>}
                            />
                        </RadioGroup>
                    </FormControl>
                </div>
            </div>

            {/* 2. 배송지 주소 (독립 카드) */}
            <div className="order-section-block">
                <div className="order-section-header">
                    <h3 className="order-section-title">배송지 정보</h3>
                </div>
                
                <div className="order-section-body">
                    <AdrdressInput
                        zipCode={zipcode}
                        address={address}
                        setZipcode={setZipcode}
                        setAddress={setAddress}
                        detailedAddress={detailedAddress}
                        setDetailedAddress={setDetailedAddress}
                    />
                </div>
            </div>
        </>
    );
}

export default OrderInfo;
