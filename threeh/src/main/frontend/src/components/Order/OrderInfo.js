import React from 'react';
import AdrdressInput from './AdrdressInput';
import { Link } from 'react-router-dom';

import { 
  Box, 
  Typography, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormControl 
} from '@mui/material';

function OrderInfo({orderType, setOrderType, zipcode, address, setZipcode, setAddress, detailedAddress, setDetailedAddress}) {
    return (
                <Box sx={{ width: '100%', mb: 4 }}>
                {/* 1. 상단 로고 영역 */}
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="h1" sx={{ fontSize: '28px', letterSpacing: '0.08em' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'var(--color-black)', fontFamily: 'var(--font-serif)' }}>
                        3H
                    </Link>
                    </Typography>
                </Box>

                {/* 대형 타이틀 */}
                <Typography className="border-headline" sx={{ fontSize: '20px', fontWeight: 700, pb: 1, mb: 4 }}>
                    주문/결제
                </Typography>

                {/* 2. 배송 및 설치 선택 */}
                    <Box sx={{ mb: 4 }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                        배송 및 설치 선택
                        </Typography>
                        <Box sx={{ p: '20px 24px', backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                        <FormControl component="fieldset">
                            <RadioGroup
                            row
                            name="deliveryType"
                            value={orderType || ''}
                            onChange={(e) => setOrderType(e.target.value)}
                            sx={{ gap: 4 }}
                            >
                            <FormControlLabel
                                value="DELIVERY_WITH_INSTALLATION"
                                control={<Radio sx={{ color: 'divider', '&.Mui-checked': { color: 'primary.main' } }} />}
                                label={<Typography sx={{ fontSize: '13px', fontWeight: 500 }}>배송 및 설치 (까사미아 직접 배송)</Typography>}
                            />
                            <FormControlLabel
                                value="DELIVERY_ONLY"
                                control={<Radio sx={{ color: 'divider', '&.Mui-checked': { color: 'primary.main' } }} />}
                                label={<Typography sx={{ fontSize: '13px', fontWeight: 500 }}>배송만</Typography>}
                            />
                            </RadioGroup>
                        </FormControl>
                        </Box>
                    </Box>
                

                {/* 3. 주소 입력 */}
                <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                    배송지 주소
                    </Typography>
                    <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                    <AdrdressInput 
                        zipCode={zipcode}
                        address={address}
                        setZipcode={setZipcode}
                        setAddress={setAddress}
                        detailedAddress={detailedAddress}
                        setDetailedAddress={setDetailedAddress}
                    />
                    </Box>
                </Box>
                </Box>
    );
}

export default OrderInfo;