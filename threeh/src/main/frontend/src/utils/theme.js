import { createTheme } from '@mui/material/styles';

const casamiaTheme = createTheme({
  palette: {
    primary: {
      main: '#000000', // 까사미아의 메인 강한 블랙 버튼 & 텍스트
      light: '#2B2D2F',
    },
    secondary: {
      main: '#8C7A6B', // 우아한 웜 브라운/그레이 소품 톤
    },
    error: {
      main: '#FF3B30', // 할인율, 최종 결제 금액에 사용된 시그니처 레드
    },
    background: {
      default: '#FFFFFF',
      paper: '#F9F8F6', // 상단 카테고리 바 및 인풋 배경에 쓰인 아늑한 아이보리
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#767676',
    },
    divider: '#E5E2DC', // 이미지 전반에 쓰인 정갈하고 얇은 경계선 색상
  },
  typography: {
    fontFamily: "'Noto Sans KR', 'Playfair Display', sans-serif",
    h1: { fontFamily: "'Playfair Display', serif", fontWeight: 600 },
    h2: { fontFamily: "'Playfair Display', serif", fontWeight: 500 },
    body1: { fontSize: '14px', letterSpacing: '-0.02em', color: '#1A1A1A' },
    body2: { fontSize: '13px', letterSpacing: '-0.02em', color: '#767676' },
  },
  components: {
    // 까사미아 특유의 각지고 깔끔한 버튼 스타일 (스퀘어 라인)
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0px', // 라운드 없이 완벽한 스퀘어로 프리미엄 감성 강조
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    // 검색창 옆 필터 버튼 (둥근 타원형 칩 스타일 - 까5.PNG 참조)
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'Noto Sans KR', sans-serif",
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E2DC',
          borderRadius: '20px',
          color: '#1A1A1A',
          '&.MuiChip-clickable:hover': {
            backgroundColor: '#1A1A1A',
            color: '#FFFFFF',
          },
        },
      },
    },
    // 주문서, 인풋 창 스타일 (까6.PNG 참조)
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0px',
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E5E2DC',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#8C7A6B',
          },
        },
      },
    },
  },
});

export default casamiaTheme;