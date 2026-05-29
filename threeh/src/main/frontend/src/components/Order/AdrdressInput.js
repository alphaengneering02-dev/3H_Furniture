import React, { use, useState } from 'react';
import DaumPostCode from 'react-daum-postcode';
import { Box, Button, TextField, Collapse } from '@mui/material';

function AdrdressInput({ address, setAddress, zipCode, setZipcode, detailedAddress, setDetailedAddress }) {
    
    const [isOpen, setIsOpen] = useState(false);
    const [mapKey, setMapKey] = useState(0);
    

    const completeHandler = (data) => {
        setIsOpen(true);


        const { address, zipCode } = data;
        setZipcode(data.zonecode);
        setAddress(data.address);
        setIsOpen(false);
    };

    const closeHandler = (state) => {
        if (state === "FORCE_CLOSE") {
            setIsOpen(false);
        } else if(state === "COMPETE_CLOSE") {
            setIsOpen(false);
        }
    };

    const toggleHandler = () => {
        setIsOpen((prevOpenState) => {
        const nextState = !prevOpenState;
      
        if (nextState) {
            setMapKey(prev => prev + 1);
        }
        return nextState;
      });
    };

    const inputChangeHandler = (event) => {
        setDetailedAddress(event.target.value);
    };




    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 우편번호 + 주소찾기 버튼 */}
        <Button 
          variant="contained" 
          onClick={toggleHandler}
          sx={{ height: '40px', backgroundColor: 'var(--color-charcoal)', color: '#000', '&:hover': { backgroundColor: '#000000', color: "#fff" } }}
        >
          주소 찾기
        </Button>

      {/* 다음 주소창 (애니메이션 효과 포함 펼침) */}
      <Collapse in={isOpen}>
        <Box sx={{ border: '1px solid', borderColor: 'divider', p: 1, backgroundColor: '#ffffff', maxWidth: '500px' }}>
          <DaumPostCode key={mapKey} onComplete={completeHandler} onClose={closeHandler} />
        </Box>
      </Collapse>

      {/* 기본 주소 출력 */}
      <TextField
        fullWidth
        size="small"
        placeholder="기본 주소"
        value={address || ''}
        slotProps={{ readOnly: true }}
        sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'background.paper' } }}
      />

      {/* 상세 주소 입력 */}
      <TextField
        fullWidth
        size="small"
        placeholder="상세 주소를 입력해주세요"
        value={detailedAddress || ''}
        onChange={(e) => setDetailedAddress(e.target.value)}
      />
    </Box>
  );
}

export default AdrdressInput;