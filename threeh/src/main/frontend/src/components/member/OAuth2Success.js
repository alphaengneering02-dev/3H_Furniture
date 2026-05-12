//소셜 로그인 성공 후, 데이터를 처리할 중간 정거장 컴포넌트
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const OAuth2Success = () => {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    

    useEffect(() => {
        // 1. 백엔드 SecurityConfig에서 보낸 파라미터(id)를 꺼냅니다.
        const id = searchParams.get('id');

        if (id) {
            setOAuth2Session(id);
        } else {
            console.log("OAuth2 소셜 회원 데이터 가져오기 실패!")
            navigate("/login");
        }
    }, []);


    // 2. 이전에 작성하신 완벽한 setSession 로직을 가져옵니다.
    const setOAuth2Session = async(id) => {
        try {
            // DB에서 회원 데이터 검색 (소셜 로그인 회원은 무조건 member 테이블에 저장된다)
            const res = await axios.get(`http://localhost:8080/member/${id}`);
            
            console.log("OAuth2 소셜 회원 데이터 가져오기 성공!", res.data);


            // 2. 프론트엔드 sessionStorage에 사용자 정보를 저장
            //(* 백엔드 HttpSession은 MemberSecurityService.java에서 저장)
            const now = new Date();
            const expireTime = 600 * 1000;  //10분

            const user = {
                ...res.data,
                expiry: now.getTime() + expireTime
            };

            //sessionStorage에 저장
            sessionStorage.setItem("user", JSON.stringify(user));

            console.log("[프론트엔드 sessionStorage에 올라간 소셜 회원정보]\n" 
                + sessionStorage.getItem("user")
            );

            //저장이 완벽히 끝나면 메인 페이지로 이동
            navigate("/")

        } catch (error) {
            console.error("OAuth2 소셜 회원 데이터 가져오기 실패!", error)
            navigate("/login")
        }
    }



    return (
        <div>
            <h2>소셜 로그인 처리 중입니다...</h2>
            <p>잠시만 기다려주세요.</p>
        </div>
    );
};

export default OAuth2Success;