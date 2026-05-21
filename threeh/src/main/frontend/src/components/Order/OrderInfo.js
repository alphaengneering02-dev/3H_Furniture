import React from 'react';
import AdrdressInput from './AdrdressInput';
import { Link } from 'react-router-dom';
import '../../css/orderPageCss/orderPage.css';

import { 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormControl 
} from '@mui/material';

function OrderInfo({orderType, setOrderType, zipcode, address, setZipcode, setAddress, detailedAddress, setDetailedAddress}) {
    return (
    <div className="order-page-wrapper">
  
      {/* 상단 로고 영역 - 중앙 정렬 컨셉 */}
      <div className="order-logo-area">
        <Link to="/" className="order-logo-link">
          3H
        </Link>
      </div>

      {/* 대형 타이틀 */}
      <h2 className="order-page-title">주문/결제</h2>

      {
      }
      <div className="order-content-layout">
        
        {/* 좌측 콘텐츠 영역 */}
        <div className="order-left-section">

          {/* 1. 배송 및 설치 선택 */}
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
                    label={
                      <span className="order-radio-label">배송 및 설치</span>
                    }
                  />
                  <FormControlLabel
                    value="DELIVERY_ONLY"
                    control={<Radio className="order-radio" />}
                    label={
                      <span className="order-radio-label">배송만</span>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </div>
          </div>

          {/* 2. 배송지 주소 */}
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

        </div>

        {/* [참고] 이 자리에 추후 우측 결제 박스 컴포넌트(<OrderSummary /> 등)가 
          들어오면 display: flex를 통해 까사미아와 동일한 화면 배치가 완성됩니다!
        */}

      </div>
    </div>
    );
}

export default OrderInfo;