//소셜 로그인 성공 후, 데이터를 처리할 중간 정거장 컴포넌트
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../hook/useToast';
import { LinearProgress } from '@mui/material';

//OAuth2Success 전용 CSS 임포트
import '../../css/memberPageCss/oauth2Success.css';

const OAuth2Success = () => {

    const navigate = useNavigate();
    const { success, error: err, warn, info } = useToast();
    const [searchParams] = useSearchParams();
    

    useEffect(() => {
        // 1. URL 파라미터에서 id와 isNewOAuth2User 값을 모두 꺼냅니다.
        const id = searchParams.get('id');
        const isNewOAuth2UserString = searchParams.get('isNewOAuth2User'); 
        
        // 문자열 'true'/'false'를 boolean 타입으로 변환
        const isNewOAuth2User = isNewOAuth2UserString === 'true';

        if (id) {
            setOAuth2Session(id, isNewOAuth2User); // 파라미터로 같이 넘겨줍니다.
        } else {
            console.log("OAuth2 소셜 회원 데이터 가져오기 실패! (ID 누락)");
            navigate("/login");
        }
    }, []);



    // 2. 전달받은 isNewOAuth2User를 활용하여 분기 처리합니다.
    const setOAuth2Session = async(id, isNewOAuth2User) => {
        try {
            // DB에서 회원 데이터 검색
            const res = await axios.get(`http://localhost:8080/api/member/${id}`);
            console.log("OAuth2 소셜 회원 데이터 가져오기 성공!", res.data);

            // 프론트엔드 sessionStorage에 사용자 정보 저장
            const now = new Date();
            const expireTime = 30 * 60 * 1000;  // 30분

            const user = {
                ...res.data,
                expiry: now.getTime() + expireTime
            };

            sessionStorage.setItem("user", JSON.stringify(user));

            console.log("[프론트엔드 sessionStorage에 올라간 소셜 회원정보]\n" 
                + sessionStorage.getItem("user")
            );
            
            // ==============================================================
            // 백엔드 API에서 가져온 URL 파라미터로 라우팅을 결정합니다.
            // ==============================================================
            
            if (isNewOAuth2User) {
                // 신규 소셜 회원의 경우
                const passMessage = "소셜 회원가입이 완료되었습니다! 추가 정보를 입력하시려면 마이페이지로 이동합니다.";
                if(window.confirm(passMessage)) {
                    navigate("/mypage");  // 확인 누르면 마이페이지로
                } else {
                    navigate("/");        // 취소 누르면 메인 홈으로 (멈춤 방지)
                }
            } else {
                // 기존 소셜 회원의 경우
                success("로그인에 성공하였습니다.");
                navigate("/"); // 메인 페이지로 이동
            }

        } catch (error) {
            if (error.response && error.response.data) {
                const errorMessage = error.response.data.message || "로그인 처리 중 오류가 발생했습니다.";
                err(errorMessage);
                console.log(errorMessage);
            } else {
                err("서버와 연결할 수 없습니다.");
                console.log("서버와 연결할 수 없습니다.");
            }

            console.error("OAuth2 소셜 회원 데이터 가져오기 실패!", error);
            navigate("/login");
        }
    }



    return (
        <div className="oauth2-success-body-wrapper">
            <div className="oauth2-success-content">
                <div className="oauth2-success-progress-bar-wrapper">
                    <LinearProgress 
                        aria-label="Loading…" 
                        sx={{
                            backgroundColor: '#e6dfd9',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: '#8a7664'
                            }
                        }}
                    />
                </div>
                <h2 className="oauth2-success-title">소셜 로그인 처리 중입니다...</h2>
                <p className="oauth2-success-desc">잠시만 기다려주세요.</p>
            </div>
        </div>
    );
};

export default OAuth2Success;